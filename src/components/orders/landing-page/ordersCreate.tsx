"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { useAddress } from "@/hooks/api/request-order/useAddress";
import { useLocation } from "@/context/LocationContext";

const CreatePickupOrder: React.FC = () => {
  const router = useRouter();
  const { createPickupOrder } = useOrders();
  const { addresses, loading: addressesLoading, error: addressesError, getAllAddresses } = useAddress();

  const { permissionStatus, requestLocation } = useLocation();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching addresses...");
    getAllAddresses();
  }, [getAllAddresses]);

  useEffect(() => {
    console.log("Addresses fetched:", addresses);
  }, [addresses]);

  useEffect(() => {
    console.log("Location permission status:", permissionStatus);
    if (permissionStatus !== "granted") {
      requestLocation();
    }
  }, [permissionStatus, requestLocation]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAddressId) {
        setError("Please select an address");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const order = await createPickupOrder(selectedAddressId);
        router.push(`/orders/${order.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create pickup order");
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedAddressId, createPickupOrder, router]
  );

  if (addressesLoading) {
    return <div className="p-4 text-center">Loading addresses...</div>;
  }

  if (addressesError) {
    return <div className="p-4 text-center text-red-500">{addressesError}</div>;
  }

  if (permissionStatus !== "granted") {
    return (
      <div className="p-4 text-center text-yellow-700">
        Location access is required to create a pickup order.
        <button onClick={requestLocation} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md">
          Enable Location
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4 pt-20">Create Pickup Order</h2>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Select Pickup Address</label>
          {addresses?.length === 0 ? (
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
              You don&apos;t have any saved addresses. Please add an address first.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses?.map((address) => (
                <div key={address.id} className="flex items-start">
                  <input
                    type="radio"
                    id={`address-${address.id}`}
                    name="address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-1 mr-3"
                  />
                  <label htmlFor={`address-${address.id}`} className="cursor-pointer">
                    <div className="font-medium">
                      {address.isPrimary && <span className="text-blue-600">(Primary) </span>}
                      {address.addressLine}
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.village}, {address.district}, {address.regency}, {address.province}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            // disabled={isSubmitting || !selectedAddressId}
            className={`px-4 py-2 rounded-md text-white ${
              isSubmitting || !selectedAddressId
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Pickup Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePickupOrder;
