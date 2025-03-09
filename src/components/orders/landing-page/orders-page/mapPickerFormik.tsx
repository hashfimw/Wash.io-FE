// components/MapPickerFormik.tsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FormikProps } from "formik";

// Custom icon
const customIcon = new L.Icon({
  iconUrl: "/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

// Fungsi untuk mendapatkan dan memproses alamat
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

    // Ekstrak district dengan beberapa kemungkinan field
    const district =
      address.district ||
      address.suburb ||
      address.city_district ||
      address.subdistrict ||
      address.neighbourhood ||
      "";

    // Ekstrak village dengan beberapa kemungkinan field
    const village =
      address.village || address.suburb || address.neighbourhood || "";

    // Buat addressLine yang terstruktur
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

  useMapEvents({
    click: async (e) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const { lat, lng } = e.latlng;
        const address = await getAddressFromCoordinates(lat, lng);

        if (address) {
          // Update Formik values
          formik.setFieldValue("latitude", address.latitude);
          formik.setFieldValue("longitude", address.longitude);
          formik.setFieldValue("addressLine", address.addressLine);
          formik.setFieldValue("province", address.province);
          formik.setFieldValue("regency", address.regency);
          formik.setFieldValue("district", address.district);
          formik.setFieldValue("village", address.village);
        }
      } catch (error) {
        console.error("Error updating form:", error);
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
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const MapPickerFormik = ({ formik, latitude, longitude }: MapPickerFormikProps) => {
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([
    -6.2, 106.816666, // Default to Jakarta coordinates
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGeolocation, setHasGeolocation] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentLocation([parseFloat(latitude), parseFloat(longitude)]);
      setIsLoading(false);
      return;
    }

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
              // Update Formik values
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
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, [latitude, longitude, formik]);

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center border rounded-md">
        Loading map...
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-md border">
      <MapContainer
        center={currentLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
    </div>
  );
};

export default MapPickerFormik;