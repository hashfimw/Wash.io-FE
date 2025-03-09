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
        console.log("Submitting address form with values:", values);
        
        // Create address and get the ID
        const addressId = await createAddress(values);
        console.log("Address creation successful, ID:", addressId);
        
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

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Add New Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addressFormik.handleSubmit} className="space-y-4">
          {/* Form fields remain the same */}
          <div className="space-y-2">
            <Label htmlFor="addressLine">Full Address</Label>
            <Input
              id="addressLine"
              {...addressFormik.getFieldProps("addressLine")}
              placeholder="Enter your full address"
            />
            {addressFormik.touched.addressLine &&
              addressFormik.errors.addressLine && (
                <p className="text-sm text-red-500">
                  {addressFormik.errors.addressLine}
                </p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                {...addressFormik.getFieldProps("province")}
                placeholder="Province"
              />
              {addressFormik.touched.province &&
                addressFormik.errors.province && (
                  <p className="text-sm text-red-500">
                    {addressFormik.errors.province}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="regency">Regency/City</Label>
              <Input
                id="regency"
                {...addressFormik.getFieldProps("regency")}
                placeholder="Regency/City"
              />
              {addressFormik.touched.regency &&
                addressFormik.errors.regency && (
                  <p className="text-sm text-red-500">
                    {addressFormik.errors.regency}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                {...addressFormik.getFieldProps("district")}
                placeholder="District"
              />
              {addressFormik.touched.district &&
                addressFormik.errors.district && (
                  <p className="text-sm text-red-500">
                    {addressFormik.errors.district}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                {...addressFormik.getFieldProps("village")}
                placeholder="Village"
              />
              {addressFormik.touched.village &&
                addressFormik.errors.village && (
                  <p className="text-sm text-red-500">
                    {addressFormik.errors.village}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                {...addressFormik.getFieldProps("latitude")}
                placeholder="Latitude"
              />
              {addressFormik.touched.latitude &&
                addressFormik.errors.latitude && (
                  <p className="text-sm text-red-500">
                    {addressFormik.errors.latitude}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                {...addressFormik.getFieldProps("longitude")}
                placeholder="Longitude"
              />
              {addressFormik.touched.longitude &&
                addressFormik.errors.longitude && (
                  <p className="text-sm text-red-500">
                    {addressFormik.errors.longitude}
                  </p>
                )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPrimary"
              checked={addressFormik.values.isPrimary}
              onCheckedChange={(checked) =>
                addressFormik.setFieldValue("isPrimary", Boolean(checked))
              }
            />
            <Label htmlFor="isPrimary">Set as primary address</Label>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={addressFormik.isSubmitting || !isAuth}
            >
              {addressFormik.isSubmitting ? "Saving..." : "Save Address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={addressFormik.isSubmitting}
            >
              Cancel
            </Button>
          </div>
          
          {!isAuth && (
            <p className="text-sm text-red-500">
              You must be logged in to add addresses
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;