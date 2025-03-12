"use client";

import { useLocation } from "@/context/LocationContext";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const LocationPermissionBanner = () => {
  const { permissionStatus, requestLocation, error } = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show the banner after client-side hydration
  useEffect(() => {
    setShowBanner(true);
  }, []);

  const handleClose = () => {
    setDismissed(true);
  };

  if (!showBanner || dismissed) return null;

  if (permissionStatus === "granted") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white shadow-lg border-t border-gray-200">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        <button 
          onClick={handleClose} 
          className="absolute top-0 right-0 -mt-2 -mr-2 sm:static sm:mt-0 sm:mr-0 p-1 text-gray-500 hover:text-gray-700"
          aria-label="Close banner"
        >
          <X size={20} />
        </button>
        
        {permissionStatus === "prompt" ? (
          <>
            <p className="text-sm">
              Washio works better with your location. Would you like to share
              your location?
            </p>
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 whitespace-nowrap"
            >
              Allow Location Access
            </button>
          </>
        ) : (
          permissionStatus === "denied" && (
            <>
              <p className="text-sm">
                Location access is denied. To enable location services, please
                update your browser settings.
              </p>
              <button
                onClick={requestLocation}
                className="px-4 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 whitespace-nowrap"
              >
                Try Again
              </button>
            </>
          )
        )}

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default LocationPermissionBanner;