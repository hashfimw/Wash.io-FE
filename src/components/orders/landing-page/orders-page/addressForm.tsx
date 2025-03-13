"use client"

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddress } from "@/hooks/api/request-order/useAddress";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/hooks/useSession";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  MapPin, 
  Home, 
  AlertCircle, 
  Save, 
  X, 
  Loader2,
  Lock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Import the CSS (if using CSS modules)
// import styles from '@/styles/map-styles.css'

// Dynamically import the map component to prevent SSR issues
const MapPicker = dynamic(
  () => import("./mapPickerFormik").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full flex items-center justify-center border rounded-md bg-gray-50">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
  }
);

interface AddressFormProps {
  onAddressCreated: (addressId: number) => void;
  onCancel: () => void;
}

const AddressForm = ({ onAddressCreated, onCancel }: AddressFormProps) => {
  const { createAddress } = useAddress();
  const { toast } = useToast();
  const { user, isAuth } = useSession();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuth || !user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to add addresses",
        variant: "destructive",
      });
    }
  }, [isAuth, user, toast]);

  const addressFormik = useFormik({
    initialValues: {
      addressLine: "",
      regency: "",
      province: "",
      district: "",
      village: "",
      latitude: "",
      longitude: "",
      isPrimary: false,
    },
    validationSchema: Yup.object({
      addressLine: Yup.string().required("Address is required"),
      regency: Yup.string().required("Regency is required"),
      province: Yup.string().required("Province is required"),
      district: Yup.string().required("District is required"),
      village: Yup.string().required("Village is required"),
      latitude: Yup.string().required("Latitude is required"),
      longitude: Yup.string().required("Longitude is required"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (!isAuth || !user) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to add addresses",
          variant: "destructive",
        });
        return;
      }

      try {
        // Create address and get the ID
        const addressId = await createAddress(values);
        
        if (typeof addressId !== 'number' || isNaN(addressId)) {
          throw new Error(`Invalid address ID: ${addressId}`);
        }
        
        resetForm();
        onAddressCreated(addressId);
        toast({
          title: "Address Added",
          description: "New address has been added successfully",
          variant: "default",
        });
      } catch (err) {
        console.error("Failed to add address:", err);
        toast({
          title: "Address Creation Failed",
          description: err instanceof Error ? err.message : "Failed to add new address",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Helper function to check if a field has an error
  const hasError = (fieldName: string) => {
    return addressFormik.touched[fieldName as keyof typeof addressFormik.touched] && 
           addressFormik.errors[fieldName as keyof typeof addressFormik.errors];
  };

  // Helper function to get field error message
  const getErrorMessage = (fieldName: string) => {
    return addressFormik.errors[fieldName as keyof typeof addressFormik.errors];
  };

  return (
    <Card className="shadow-md border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b pb-4">
        <CardTitle className="flex items-center text-blue-900">
          <MapPin className="w-5 h-5 mr-2 text-orange-500" />
          Add New Delivery Address
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {!isAuth && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-center space-x-2 text-red-700">
            <Lock className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">You must be logged in to add addresses</p>
          </div>
        )}
        
        <form onSubmit={addressFormik.handleSubmit} className="space-y-5">
          {/* Map Section */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-orange-500" />
              Select Location on Map
            </Label>
            
            {/* The key container for the map with proper dimensions */}
            <div className="rounded-md overflow-hidden shadow-sm border border-gray-200 h-[300px] relative">
              <MapPicker 
                formik={addressFormik}
                latitude={addressFormik.values.latitude}
                longitude={addressFormik.values.longitude}
              />
            </div>
            
            {/* Coordinates badges (moved outside the map container) */}
            {addressFormik.values.latitude && addressFormik.values.longitude && (
              <div className="flex items-center space-x-2 text-xs pt-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  Lat: {parseFloat(addressFormik.values.latitude).toFixed(6)}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                  Long: {parseFloat(addressFormik.values.longitude).toFixed(6)}
                </Badge>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Address Details Section */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Home className="w-4 h-4 mr-1.5 text-orange-500" />
              Address Details
            </h3>
            
            <div className="space-y-4">
              {/* Full Address */}
              <div className="space-y-2">
                <Label htmlFor="addressLine" className={hasError('addressLine') ? 'text-red-500' : ''}>
                  Full Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addressLine"
                  {...addressFormik.getFieldProps("addressLine")}
                  placeholder="Enter your full address"
                  className={hasError('addressLine') ? 'border-red-300 focus-visible:ring-red-500' : ''}
                />
                {hasError('addressLine') && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    {getErrorMessage('addressLine')}
                  </p>
                )}
              </div>

              {/* Province and Regency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province" className={hasError('province') ? 'text-red-500' : ''}>
                    Province <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="province"
                    {...addressFormik.getFieldProps("province")}
                    placeholder="Province"
                    className={hasError('province') ? 'border-red-300 focus-visible:ring-red-500' : ''}
                  />
                  {hasError('province') && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {getErrorMessage('province')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regency" className={hasError('regency') ? 'text-red-500' : ''}>
                    Regency/City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="regency"
                    {...addressFormik.getFieldProps("regency")}
                    placeholder="Regency/City"
                    className={hasError('regency') ? 'border-red-300 focus-visible:ring-red-500' : ''}
                  />
                  {hasError('regency') && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {getErrorMessage('regency')}
                    </p>
                  )}
                </div>
              </div>

              {/* District and Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district" className={hasError('district') ? 'text-red-500' : ''}>
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="district"
                    {...addressFormik.getFieldProps("district")}
                    placeholder="District"
                    className={hasError('district') ? 'border-red-300 focus-visible:ring-red-500' : ''}
                  />
                  {hasError('district') && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {getErrorMessage('district')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village" className={hasError('village') ? 'text-red-500' : ''}>
                    Village <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="village"
                    {...addressFormik.getFieldProps("village")}
                    placeholder="Village"
                    className={hasError('village') ? 'border-red-300 focus-visible:ring-red-500' : ''}
                  />
                  {hasError('village') && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {getErrorMessage('village')}
                    </p>
                  )}
                </div>
              </div>

              {/* Hidden coordinates fields */}
              <div className="hidden">
                <Input
                  id="latitude"
                  {...addressFormik.getFieldProps("latitude")}
                />
                <Input
                  id="longitude"
                  {...addressFormik.getFieldProps("longitude")}
                />
              </div>

              {/* Primary Address Checkbox */}
              <div className="flex items-center space-x-2 mt-2 pt-1">
                <Checkbox
                  id="isPrimary"
                  checked={addressFormik.values.isPrimary}
                  onCheckedChange={(checked) =>
                    addressFormik.setFieldValue("isPrimary", Boolean(checked))
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="isPrimary" className="text-sm">
                    Set as primary address
                  </Label>
                  <p className="text-xs text-gray-500">
                    This will be used as your default address
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 sm:flex-1 order-2 sm:order-1"
              disabled={addressFormik.isSubmitting || !isAuth}
            >
              {addressFormik.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Address
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="sm:flex-1 order-1 sm:order-2"
              disabled={addressFormik.isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;