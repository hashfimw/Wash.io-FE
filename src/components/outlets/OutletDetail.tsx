import { Outlet } from "@/types/outlet";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OutletDetailProps {
  outlet: Outlet;
}

export function OutletDetail({ outlet }: OutletDetailProps) {
  // Format date
  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-birtu">{outlet.outletName}</h3>
        <p className="text-birtu/60 text-sm">
          Added on {formatDate(outlet.createdAt)}
        </p>
      </div>

      <Separator className="bg-birtu/20" />

      <div className="space-y-3">
        <h4 className="font-medium text-birtu">Location Details</h4>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-birtu/60">Address</p>
            <p className="font-medium text-birtu">
              {outlet.outletAddress.addressLine}
            </p>
          </div>

          <div>
            <p className="text-birtu/60">Province</p>
            <p className="font-medium text-birtu">
              {outlet.outletAddress.province}
            </p>
          </div>

          <div>
            <p className="text-birtu/60">Regency</p>
            <p className="font-medium text-birtu">
              {outlet.outletAddress.regency}
            </p>
          </div>

          <div>
            <p className="text-birtu/60">District</p>
            <p className="font-medium text-birtu">
              {outlet.outletAddress.district}
            </p>
          </div>

          <div>
            <p className="text-birtu/60">Village</p>
            <p className="font-medium text-birtu">
              {outlet.outletAddress.village}
            </p>
          </div>
        </div>
      </div>

      {outlet.outletAddress.latitude && outlet.outletAddress.longitude && (
        <div>
          <h4 className="font-medium text-birtu">Coordinates</h4>
          <p className="text-sm text-birtu/70">
            Lat: {outlet.outletAddress.latitude}, Long:{" "}
            {outlet.outletAddress.longitude}
          </p>
        </div>
      )}

      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-birtu border-birtu hover:bg-birmud hover:text-birtu"
          asChild
        >
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${outlet.outletAddress.latitude},${outlet.outletAddress.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Open in Google Maps
          </a>
        </Button>
      </div>
    </div>
  );
}
