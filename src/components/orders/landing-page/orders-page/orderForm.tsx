import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddress } from "@/hooks/api/request-order/useAddress";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { useToast } from "@/components/ui/use-toast";
import { usePublicOutlets } from "@/hooks/api/outlets/usePublicOutlets";
import { useLocation } from "@/context/LocationContext";
import { Locate, AlertCircle } from "lucide-react";
import AddressSelector from "./addressSelector";
import AddressForm from "./addressForm";
import { Outlet } from "@/types/outlet"; // Import your types
import { Order } from "@/types/requestOrder";
import { useRouter } from "next/navigation"; // Import router for redirection

// Define additional types needed
interface OutletWithDistance extends Outlet {
  distance?: number;
}

interface FormValues {
  addressId: number;
  outletId: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
}

interface OrderFormProps {
  onOrderCreated?: () => void; // Optional callback prop
}

const OrderForm = ({ onOrderCreated }: OrderFormProps = {}) => {
  const router = useRouter(); // Initialize router for redirection
  const { addresses, getAllAddresses } = useAddress();
  const { createPickupOrder, loading, error } = useOrders();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const { toast } = useToast();

  // Get outlets data
  const {
    outlets,
    loading: outletsLoading,
    error: outletsError,
    getPublicOutlets,
  } = usePublicOutlets();

  // Get location context
  const {
    location,
    permissionStatus,
    error: locationError,
    isLoading: locationLoading,
    requestLocation,
    clearError,
    calculateDistance,
  } = useLocation();

  // State for nearest outlet
  const [nearestOutlet, setNearestOutlet] = useState<OutletWithDistance | null>(
    null
  );
  const [isLoadingOutlet, setIsLoadingOutlet] = useState<boolean>(false);
  const [nearestOutletDistance, setNearestOutletDistance] = useState<
    number | null
  >(null);

  // Maximum distance in kilometers to consider an outlet
  const MAX_DISTANCE_KM = 30;

  // Initial fetch of outlets on component mount
  useEffect(() => {
    fetchInitialOutlets();
  }, []);

  const fetchInitialOutlets = async (): Promise<void> => {
    try {
      // Get initial outlet data
      await getPublicOutlets({ limit: 100 });
    } catch (error) {
      console.error("Error fetching initial outlets:", error);
    }
  };

  // Calculate nearest outlet when user location and outlets are available
  useEffect(() => {
    if (location && outlets && outlets.length > 0) {
      findNearestOutlet(outlets, location.latitude, location.longitude);
    }
  }, [location, outlets]);

  const findNearestOutlet = (
    outletData: Outlet[],
    latitude: number,
    longitude: number
  ): void => {
    // Calculate distance for each outlet
    const outletsWithDistance: OutletWithDistance[] = outletData.map(
      (outlet: Outlet) => {
        // Parse latitude and longitude values
        const outletLat = parseFloat(outlet.outletAddress.latitude || "0");
        const outletLng = parseFloat(outlet.outletAddress.longitude || "0");

        // Skip distance calculation if outlet coordinates are not available
        if (outletLat === 0 && outletLng === 0) {
          return { ...outlet, distance: undefined };
        }

        // Calculate distance using the Haversine formula
        const distance = calculateDistance(
          latitude,
          longitude,
          outletLat,
          outletLng
        );

        return { ...outlet, distance };
      }
    );

    // Filter out outlets without valid coordinates and outside MAX_DISTANCE_KM
    const validOutlets: OutletWithDistance[] = outletsWithDistance.filter(
      (outlet) =>
        outlet.distance !== undefined && outlet.distance <= MAX_DISTANCE_KM
    );

    // Sort by distance
    const sortedOutlets: OutletWithDistance[] = validOutlets.sort(
      (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
    );

    if (sortedOutlets.length > 0) {
      setNearestOutlet(sortedOutlets[0]);
      setNearestOutletDistance(sortedOutlets[0].distance ?? null);

      // Show success notification
      toast({
        title: "Nearest Outlet Found ✅",
        description: `Found ${sortedOutlets[0].outletName} (${
          sortedOutlets[0].distance && sortedOutlets[0].distance < 1
            ? `${(sortedOutlets[0].distance * 1000).toFixed(0)} m`
            : `${sortedOutlets[0].distance?.toFixed(1)} km`
        } away)`,
        variant: "default",
      });
    } else {
      // No nearby outlets found
      setNearestOutlet(null);
      setNearestOutletDistance(null);

      toast({
        title: "No Nearby Outlets ❌",
        description: `No outlets found within ${MAX_DISTANCE_KM}km of your location`,
        variant: "destructive",
      });
    }
  };

  const handleRequestLocation = async (): Promise<void> => {
    clearError(); // Clear any previous errors
    setIsLoadingOutlet(true);

    try {
      // Request user's location
      const userLocation: LocationData | null = await requestLocation();

      if (userLocation) {
        // If we already have outlets, find nearest
        if (outlets && outlets.length > 0) {
          findNearestOutlet(
            outlets,
            userLocation.latitude,
            userLocation.longitude
          );
        } else {
          // Otherwise fetch outlets and then find nearest
          const params = { limit: 100 };
          const response = await getPublicOutlets(params);

          if (response && response.data) {
            findNearestOutlet(
              response.data,
              userLocation.latitude,
              userLocation.longitude
            );
          }
        }
      }
    } catch (error) {
      console.error("Error using location:", error);
      toast({
        title: "Location Error",
        description: locationError || "Failed to get your location",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOutlet(false);
    }
  };

  // Get formatted address for display
  const getFormattedAddress = (outlet: Outlet | null): string => {
    if (!outlet) return "";

    const { addressLine, village, district, regency, province } =
      outlet.outletAddress;
    return [addressLine, village, district, regency, province]
      .filter((part): part is string => Boolean(part && part.trim() !== ""))
      .join(", ");
  };

  const orderFormik = useFormik<FormValues>({
    initialValues: {
      addressId: 0,
      outletId: 0, // Add outletId to form values
    },
    validationSchema: Yup.object({
      addressId: Yup.number().min(1, "Please select an address"),
      outletId: Yup.number().min(
        1,
        "No outlet selected. Please find nearest outlet first"
      ),
    }),
    onSubmit: async (values) => {
      try {
        // Pass both addressId and outletId to create order
        const newOrder: Order | null = await createPickupOrder({
          addressId: values.addressId,
          outletId: values.outletId,
        });

        console.log(newOrder);

        toast({
          title: "Order Created ✅",
          description: `Order successfully created, please check on your orders`,
          variant: "default",
        });

        // Reset form after successful order creation
        orderFormik.resetForm();
        setShowAddressForm(false);
        // Refresh addresses to show the newly added one
        getAllAddresses();
        
        // If callback provided, call it (for parent component to handle)
        if (onOrderCreated) {
          onOrderCreated();
        } else {
          // Otherwise, handle redirect directly
          router.push("/orders");
        }
      } catch (err) {
        console.error("Failed to create order:", err);
        toast({
          title: "Order Creation Failed ❌",
          description: error || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    },
  });

  // Update outletId in form when nearest outlet changes
  useEffect(() => {
    if (nearestOutlet) {
      orderFormik.setFieldValue("outletId", nearestOutlet.id);
    }
  }, [nearestOutlet]);

  const handleAddressCreated = (addressId: number): void => {
    orderFormik.setFieldValue("addressId", addressId);
    setShowAddressForm(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Pickup Order</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Nearest outlet section */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Nearest Outlet</h3>

            {nearestOutlet ? (
              <div className="mb-4">
                <div className="font-medium">{nearestOutlet.outletName}</div>
                <div className="text-sm text-gray-600 mb-1">
                  {getFormattedAddress(nearestOutlet)}
                </div>
                <div className="text-sm text-blue-600">
                  {nearestOutletDistance && nearestOutletDistance < 1
                    ? `${(nearestOutletDistance * 1000).toFixed(0)} meters away`
                    : `${nearestOutletDistance?.toFixed(1)} km away`}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 mb-4">
                No outlet selected yet. Use your location to find the nearest
                outlet.
              </div>
            )}

            <Button
              onClick={handleRequestLocation}
              disabled={isLoadingOutlet || locationLoading}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoadingOutlet || locationLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                  Finding nearest outlet...
                </>
              ) : (
                <>
                  <Locate className="w-4 h-4" />
                  {permissionStatus === "denied"
                    ? "Location permission denied. Click to try again"
                    : "Find Nearest Outlet"}
                </>
              )}
            </Button>

            {(locationError || outletsError) && (
              <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {locationError || outletsError}
              </div>
            )}

            {permissionStatus === "denied" && (
              <div className="mt-2 text-xs text-gray-500">
                Please enable location services in your browser settings to use
                this feature.
              </div>
            )}
          </div>

          <form onSubmit={orderFormik.handleSubmit} className="space-y-4">
            <AddressSelector
              value={orderFormik.values.addressId.toString()}
              onChange={(value) =>
                orderFormik.setFieldValue("addressId", Number(value))
              }
              error={orderFormik.errors.addressId}
              touched={orderFormik.touched.addressId}
            />

            {orderFormik.errors.outletId && orderFormik.touched.outletId && (
              <div className="text-sm text-red-500">
                {orderFormik.errors.outletId}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !nearestOutlet}
              className="w-full"
            >
              {loading ? "Processing..." : "Create Order"}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="w-full"
            >
              {showAddressForm ? "Cancel Adding Address" : "Add New Address"}
            </Button>
          </div>

          {showAddressForm && (
            <AddressForm
              onAddressCreated={handleAddressCreated}
              onCancel={() => setShowAddressForm(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderForm;