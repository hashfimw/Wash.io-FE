"use client"

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FormikProps } from "formik";
import { Loader2, MapPin, Compass, AlertCircle, Check } from "lucide-react";

const customIcon = new L.Icon({
  iconUrl: "/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl: "/images/marker-shadow.png"
});

const pulsingIcon = new L.DivIcon({
  className: "map-marker-pulsing",
  html: `<div class="marker-pin"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface MapPickerFormikProps {
  formik: FormikProps<any>;
  latitude?: string;
  longitude?: string;
}

interface AddressResult {
  addressLine: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  latitude: string;
  longitude: string;
}

async function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<AddressResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    const address = data.address;

    const district =
      address.district ||
      address.suburb ||
      address.city_district ||
      address.subdistrict ||
      address.neighbourhood ||
      "";

    const village =
      address.village || address.suburb || address.neighbourhood || "";

    const addressLine = [
      address.road,
      district,
      address.city || address.county || address.town,
      address.state,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      addressLine,
      province: address.state || "",
      regency: address.city || address.county || address.town || "",
      district,
      village,
      latitude: lat.toString(),
      longitude: lng.toString(),
    };
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
}

function MapEvents({ formik }: { formik: FormikProps<any> }) {
  const [isLoading, setIsLoading] = useState(false);
  const map = useMap();

  const mapEvents = useMapEvents({
    click: async (e) => {
      if (isLoading) return;

      setIsLoading(true);
      const statusDiv = L.DomUtil.create('div', 'map-status-overlay');
      statusDiv.innerHTML = `
        <div class="status-content">
          <div class="status-spinner"></div>
          <span>Finding address...</span>
        </div>
      `;
      document.getElementById('map-container')?.appendChild(statusDiv);
      
      try {
        const { lat, lng } = e.latlng;
        const address = await getAddressFromCoordinates(lat, lng);

        if (address) {
          formik.setFieldValue("latitude", address.latitude);
          formik.setFieldValue("longitude", address.longitude);
          formik.setFieldValue("addressLine", address.addressLine);
          formik.setFieldValue("province", address.province);
          formik.setFieldValue("regency", address.regency);
          formik.setFieldValue("district", address.district);
          formik.setFieldValue("village", address.village);
        
          statusDiv.innerHTML = `
            <div class="status-content success">
              <div class="status-icon-success"></div>
              <span>Address found!</span>
            </div>
          `;
          
          setTimeout(() => {
            if (document.getElementById('map-container')?.contains(statusDiv)) {
              document.getElementById('map-container')?.removeChild(statusDiv);
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Error updating form:", error);
        
        statusDiv.innerHTML = `
          <div class="status-content error">
            <div class="status-icon-error"></div>
            <span>Failed to get address</span>
          </div>
        `;
        
        setTimeout(() => {
          if (document.getElementById('map-container')?.contains(statusDiv)) {
            document.getElementById('map-container')?.removeChild(statusDiv);
          }
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    },
  });
  
  return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

const MapPickerFormik = ({ formik, latitude, longitude }: MapPickerFormikProps) => {
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([
    -6.2, 106.816666, 
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGeolocation, setHasGeolocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const findCurrentLocation = () => {
    setIsLoading(true);
    setLocationError(null);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation([lat, lng]);
          setHasGeolocation(true);

          try {
            const address = await getAddressFromCoordinates(lat, lng);
            if (address) {
              formik.setFieldValue("latitude", address.latitude);
              formik.setFieldValue("longitude", address.longitude);
              formik.setFieldValue("addressLine", address.addressLine);
              formik.setFieldValue("province", address.province);
              formik.setFieldValue("regency", address.regency);
              formik.setFieldValue("district", address.district);
              formik.setFieldValue("village", address.village);
            }
          } catch (error) {
            console.error("Error fetching address:", error);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(
            error.code === 1 
              ? "Location permission denied. Please enable location access in your browser."
              : "Unable to get your location."
          );
          setIsLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentLocation([parseFloat(latitude), parseFloat(longitude)]);
      setIsLoading(false);
      return;
    }

    findCurrentLocation();
  }, [latitude, longitude, formik]);

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center border rounded-md bg-gray-50">
        <div className="flex flex-col items-center text-gray-600">
          <Loader2 className="h-10 w-10 animate-spin mb-2 text-blue-500" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div id="map-container" className="h-[300px] w-full rounded-md border relative overflow-hidden">
        {/* Map instructions overlay */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 bg-white py-1 px-3 rounded-full shadow-md text-xs font-medium flex items-center">
          <MapPin className="w-3 h-3 mr-1 text-orange-500" />
          Click anywhere on the map to select location
        </div>
        
        {/* Location button */}
        <button 
          type="button"
          onClick={findCurrentLocation}
          className="absolute bottom-3 right-3 z-[1000] bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          title="Find my location"
        >
          <Compass className="w-5 h-5 text-blue-600" />
        </button>
        
        <MapContainer
          center={currentLocation}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomleft" />
          <RecenterMap lat={currentLocation[0]} lng={currentLocation[1]} />
          <MapEvents formik={formik} />
          {((latitude && longitude) || hasGeolocation) && (
            <Marker
              position={
                latitude && longitude
                  ? [parseFloat(latitude), parseFloat(longitude)]
                  : currentLocation
              }
              icon={customIcon}
            />
          )}
        </MapContainer>

        <style jsx global>{`
          .map-marker-pulsing .marker-pin {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: #3b82f6;
            box-shadow: 0 0 0 rgba(59, 130, 246, 0.6);
            animation: pulse 1.5s infinite;
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }
          
          .map-status-overlay {
            position: absolute;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            padding: 8px 16px;
            background-color: white;
            border-radius: 24px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            font-size: 14px;
          }
          
          .status-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .status-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s linear infinite;
          }
          
          .status-content.success {
            color: #16a34a;
          }
          
          .status-content.error {
            color: #ef4444;
          }
          
          .status-icon-success {
            width: 16px;
            height: 16px;
            background-color: #16a34a;
            border-radius: 50%;
            position: relative;
          }
          
          .status-icon-success:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%) rotate(45deg);
            width: 8px;
            height: 4px;
            border-bottom: 2px solid white;
            border-right: 2px solid white;
          }
          
          .status-icon-error {
            width: 16px;
            height: 16px;
            background-color: #ef4444;
            border-radius: 50%;
            position: relative;
          }
          
          .status-icon-error:before,
          .status-icon-error:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 8px;
            height: 2px;
            background-color: white;
          }
          
          .status-icon-error:before {
            transform: translate(-50%, -50%) rotate(45deg);
          }
          
          .status-icon-error:after {
            transform: translate(-50%, -50%) rotate(-45deg);
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
      
      {/* Location error message */}
      {locationError && (
        <div className="flex items-center text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}
      
      {/* Success message when location is selected */}
      {formik.values.latitude && formik.values.longitude && !locationError && (
        <div className="flex items-center text-xs text-green-600 mt-1 bg-green-50 p-2 rounded">
          <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
          <span>Location selected successfully</span>
        </div>
      )}
    </div>
  );
};

export default MapPickerFormik;