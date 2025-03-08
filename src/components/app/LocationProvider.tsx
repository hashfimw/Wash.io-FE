"use client";

// components/app/LocationProviderWrapper.tsx
import { ReactNode } from "react";
import { LocationProvider } from "@/context/LocationContext";

export default function LocationProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <LocationProvider>{children}</LocationProvider>;
}
