import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddress } from "@/hooks/api/request-order/useAddress";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { useToast } from "@/components/ui/use-toast";
import { usePublicOutlets } from "@/hooks/api/outlets/usePublicOutlets";
import { useLocation } from "@/context/LocationContext";
import { 
  MapPin, 
  AlertCircle, 
  Store, 
  PlusCircle, 
  Loader2, 
  LocateFixed, 
  CheckCircle2,
  Ban,
  ArrowRight
} from "lucide-react";
import AddressSelector from "./addressSelector";
import AddressForm from "./addressForm";
import { Outlet } from "@/types/outlet";
import { Order } from "@/types/requestOrder";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  onOrderCreated?: () => void;
}

const OrderForm = ({ onOrderCreated }: OrderFormProps = {}) => {
  const router = useRouter();
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
  const [nearestOutlet, setNearestOutlet] = useState<OutletWithDistance | null>(null);
  const [isLoadingOutlet, setIsLoadingOutlet] = useState<boolean>(false);
  const [nearestOutletDistance, setNearestOutletDistance] = useState<number | null>(null);

  // Maximum distance in kilometers to consider an outlet
  const MAX_DISTANCE_KM = 30;

  // Initial fetch of outlets on component mount
  useEffect(() => {
    fetchInitialOutlets();
  }, []);

  const fetchInitialOutlets = async (): Promise<void> => {
    try {
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
        title: "Nearest Outlet Found",
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
        title: "No Nearby Outlets",
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
      outletId: 0,
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
          title: "Order Created",
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
          title: "Order Creation Failed",
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

  // Function to format distance for display
  const formatDistance = (distance: number | null): string => {
    if (distance === null) return "Unknown";
    
    return distance < 1 
      ? `${(distance * 1000).toFixed(0)} meters` 
      : `${distance.toFixed(1)} km`;
  };

  return (
    <div className="space-y-6">
      {/* Nearest Outlet Section */}
      <div className="space-y-4">
        <div className="flex items-center mb-2">
          <Store className="w-5 h-5 mr-2 text-orange-500" />
          <h3 className="text-lg font-medium">Nearest Laundry Outlet</h3>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {nearestOutlet ? (
              <div className="flex flex-col">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-blue-900">{nearestOutlet.outletName}</h4>
                      <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {formatDistance(nearestOutletDistance)} away
                      </Badge>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1 text-gray-500" />
                    {getFormattedAddress(nearestOutlet)}
                  </p>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    This outlet will handle your laundry pickup and delivery.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center">
                <div className="bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Store className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-700 mb-1">No Outlet Selected Yet</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Use your location to find the nearest laundry outlet.
                </p>
                
                <Button
                  onClick={handleRequestLocation}
                  disabled={isLoadingOutlet || locationLoading}
                  variant="outline"
                  className="w-full bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-600"
                >
                  {isLoadingOutlet || locationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding nearest outlet...
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-4 h-4 mr-2" />
                      {permissionStatus === "denied"
                        ? "Location permission denied. Try again"
                        : "Find Nearest Outlet"}
                    </>
                  )}
                </Button>

                {(locationError || outletsError) && (
                  <div className="mt-3 text-sm text-red-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{locationError || outletsError}</span>
                  </div>
                )}

                {permissionStatus === "denied" && (
                  <div className="mt-3 text-xs text-gray-500 flex items-center justify-center">
                    <Ban className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>Please enable location services in your browser settings.</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Delivery Address Selection */}
      <form onSubmit={orderFormik.handleSubmit} className="space-y-6">
        <AddressSelector
          value={orderFormik.values.addressId.toString()}
          onChange={(value) =>
            orderFormik.setFieldValue("addressId", Number(value))
          }
          error={orderFormik.touched.addressId ? orderFormik.errors.addressId : undefined}
          touched={orderFormik.touched.addressId}
        />

        {orderFormik.errors.outletId && orderFormik.touched.outletId && (
          <div className="flex items-center text-sm text-red-500 mt-1">
            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{orderFormik.errors.outletId}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !nearestOutlet}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Create Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Add New Address Section */}
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => setShowAddressForm(!showAddressForm)}
          className="w-full border-dashed border-gray-300"
        >
          {showAddressForm ? (
            "Cancel Adding Address"
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Address
            </>
          )}
        </Button>
      </div>

      {showAddressForm && (
        <div className="mt-4 border-t pt-4">
          <AddressForm
            onAddressCreated={handleAddressCreated}
            onCancel={() => setShowAddressForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default OrderForm;