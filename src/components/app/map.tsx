"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapProps {
  latitude: number;
  longitude: number;
  outletName: string;
}

const Map: React.FC<MapProps> = ({ latitude, longitude, outletName }) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      className="h-full w-full rounded-lg border"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]}>
        <Popup>{outletName}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
