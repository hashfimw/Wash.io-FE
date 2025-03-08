'use client';

// context/LocationContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

  // Function to clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check permission status on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setPermissionStatus('unavailable');
      return;
    }

    // Check geolocation permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state as LocationPermissionStatus);
          
          // Listen for permission changes
          result.onchange = () => {
            setPermissionStatus(result.state as LocationPermissionStatus);
            
            // If permission became granted and we don't have location yet, get it
            if (result.state === 'granted' && !location) {
              getCurrentPosition();
            }
          };
        })
        .catch((err) => {
          console.error('Error checking permission:', err);
          // If we can't check permissions, we'll assume 'prompt'
        });
    }
  }, [location]);

  // Function to get current position
  const getCurrentPosition = (): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      setIsLoading(true);
      setError(null);
      
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
          
          if (err.code === 1) { // PERMISSION_DENIED
            setPermissionStatus('denied');
            setError('Location permission denied. Please enable location access in your browser settings.');
          } else if (err.code === 2) { // POSITION_UNAVAILABLE
            setError('Location information is unavailable. Please try again.');
          } else if (err.code === 3) { // TIMEOUT
            setError('The request to get location timed out. Please check your connection and try again.');
          } else {
            setError(`An error occurred: ${err.message}`);
          }
          
          resolve(null);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Accept positions that are up to 1 minute old
        }
      );
    });
  };

  // Function to request location permission and get position
  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setPermissionStatus('unavailable');
      return null;
    }
    
    return getCurrentPosition();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  // Returns distance in kilometers
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }, []);

  // Helper function to convert degrees to radians
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

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

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};