"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Outlet } from "@/types/outlet";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";

// Custom icon
const defaultIcon = new L.Icon({
  iconUrl: "/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: "/images/marker-icon-red.png", // You'll need this image
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to recenter map on selected outlet
function CenterMapView({ outlet }: { outlet: Outlet | null }) {
  const map = useMap();

  useEffect(() => {
    if (
      outlet &&
      outlet.outletAddress.latitude &&
      outlet.outletAddress.longitude
    ) {
      map.setView(
        [
          parseFloat(outlet.outletAddress.latitude),
          parseFloat(outlet.outletAddress.longitude),
        ],
        14
      );
    }
  }, [outlet, map]);

  return null;
}

// Handle markers for all outlets
function OutletMarkers({
  outlets,
  selectedOutletId,
  onSelectOutlet,
}: {
  outlets: Outlet[];
  selectedOutletId?: number;
  onSelectOutlet: (outlet: Outlet) => void;
}) {
  return (
    <>
      {outlets.map((outlet) => {
        // Skip outlets without coordinates
        if (!outlet.outletAddress.latitude || !outlet.outletAddress.longitude) {
          return null;
        }

        // Type guard to ensure latitude and longitude are defined
        const latitude = outlet.outletAddress.latitude;
        const longitude = outlet.outletAddress.longitude;

        if (!latitude || !longitude) return null;

        return (
          <Marker
            key={outlet.id}
            position={[parseFloat(latitude), parseFloat(longitude)]}
            icon={selectedOutletId === outlet.id ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onSelectOutlet(outlet),
            }}
          >
            <Popup className="leaflet-popup-custom">
              <div className="text-center p-1">
                <h3 className="font-bold text-lg text-birtu">
                  {outlet.outletName}
                </h3>
                <p className="text-sm text-birtu/70">
                  {outlet.outletAddress.addressLine}
                </p>
                <Button
                  onClick={() => onSelectOutlet(outlet)}
                  className="mt-2 text-xs bg-birtu hover:bg-birtu/80 text-white"
                  size="sm"
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

interface OutletMapProps {
  outlets: Outlet[];
  selectedOutlet: Outlet | null;
  onSelectOutlet: (outlet: Outlet) => void;
  form: UseFormReturn<any>;
}

export function OutletMap({
  outlets,
  selectedOutlet,
  onSelectOutlet,
  form,
}: OutletMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [defaultCenter, setDefaultCenter] = useState<[number, number]>([
    -6.2,
    106.816666, // Default Jakarta coordinates
  ]);

  useEffect(() => {
    // Calculate default center from first outlet with coordinates or selected outlet
    if (
      selectedOutlet?.outletAddress.latitude &&
      selectedOutlet?.outletAddress.longitude
    ) {
      const latitude = selectedOutlet.outletAddress.latitude;
      const longitude = selectedOutlet.outletAddress.longitude;

      if (latitude && longitude) {
        setDefaultCenter([parseFloat(latitude), parseFloat(longitude)]);
      }
    } else if (outlets.length > 0) {
      // Find first outlet with coordinates
      const outletWithCoords = outlets.find(
        (o) => o.outletAddress.latitude && o.outletAddress.longitude
      );

      if (
        outletWithCoords &&
        outletWithCoords.outletAddress.latitude &&
        outletWithCoords.outletAddress.longitude
      ) {
        setDefaultCenter([
          parseFloat(outletWithCoords.outletAddress.latitude),
          parseFloat(outletWithCoords.outletAddress.longitude),
        ]);
      }
    }

    setMapReady(true);
  }, [outlets, selectedOutlet]);

  if (!mapReady) {
    return (
      <div className="h-[400px] w-full bg-birmud/20 animate-pulse rounded-md"></div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-md border border-birtu/20 overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <OutletMarkers
          outlets={outlets}
          selectedOutletId={selectedOutlet?.id}
          onSelectOutlet={onSelectOutlet}
        />

        <CenterMapView outlet={selectedOutlet} />
      </MapContainer>
    </div>
  );
}
