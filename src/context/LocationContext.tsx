'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode, 
  useCallback 
} from 'react';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';

type LocationContextType = {
  location: Coordinates | null;
  permissionStatus: LocationPermissionStatus;
  error: string | null;
  isLoading: boolean;
  requestLocation: () => Promise<Coordinates | null>;
  clearError: () => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('prompt');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Memoized error clearing function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check permission status on component mount
  useEffect(() => {
    // Server-side rendering check
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setPermissionStatus('unavailable');
      return;
    }

    // Advanced permission checking
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          
          const updatePermissionStatus = () => {
            setPermissionStatus(result.state as LocationPermissionStatus);
            
            // Automatically request location if permission is granted
            if (result.state === 'granted' && !location) {
              requestLocation();
            }
          };

          // Initial status
          updatePermissionStatus();

          // Listen for permission changes
          result.addEventListener('change', updatePermissionStatus);

          // Cleanup listener
          return () => result.removeEventListener('change', updatePermissionStatus);
        }
      } catch (err) {
        console.error('Permission query error:', err);
        // Fallback to default behavior
        setPermissionStatus('prompt');
      }
    };

    checkPermission();
  }, [location]);

  // Robust getCurrentPosition method
  const getCurrentPosition = useCallback((): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      // Prevent multiple simultaneous requests
      if (isLoading) return resolve(null);

      setIsLoading(true);
      setError(null);
      
      const options = { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Accept cached position up to 1 minute old
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setLocation(newLocation);
          setPermissionStatus('granted');
          setIsLoading(false);
          resolve(newLocation);
        },
        (err) => {
          setIsLoading(false);
          
          const errorMap: Record<number, string> = {
            1: 'Location permission denied. Please enable access in browser settings.',
            2: 'Location information unavailable. Please try again.',
            3: 'Location request timed out. Check your connection.',
          };

          const errorMessage = errorMap[err.code] || `Location error: ${err.message}`;
          setError(errorMessage);
          setPermissionStatus(err.code === 1 ? 'denied' : 'prompt');
          
          resolve(null);
        },
        options
      );
    });
  }, [isLoading]);

  // Request location with additional safety checks
  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    // Server-side and browser support check
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation not supported');
      setPermissionStatus('unavailable');
      return null;
    }
    
    return getCurrentPosition();
  }, [getCurrentPosition]);

  // Haversine formula for distance calculation (unchanged)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in kilometers
  }, []);

  return (
    <LocationContext.Provider value={{ 
      location, 
      permissionStatus, 
      error, 
      isLoading,
      requestLocation, 
      clearError,
      calculateDistance
    }}>
      {children}
    </LocationContext.Provider>
  );
};

// Hook to use location context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};