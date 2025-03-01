import { Outlet } from "@/types/outlet";

interface OutletsListProps {
  outlets: Outlet[];
  selectedOutletId?: number;
  onSelectOutlet: (outlet: Outlet) => void;
}

export function OutletsList({
  outlets,
  selectedOutletId,
  onSelectOutlet,
}: OutletsListProps) {
  if (outlets.length === 0) {
    return <div className="text-center py-4 text-birtu">No outlets found</div>;
  }

  return (
    <div className="h-[400px] overflow-y-auto pr-2">
      <div className="space-y-2">
        {outlets.map((outlet) => (
          <div
            key={outlet.id}
            className={`
              p-3 rounded-md cursor-pointer transition-colors
              ${
                selectedOutletId === outlet.id
                  ? "bg-birmud border-l-4 border-birtu"
                  : "bg-putbir hover:bg-birmud border-l-4 border-transparent"
              }
            `}
            onClick={() => onSelectOutlet(outlet)}
          >
            <h3 className="font-medium text-birtu">{outlet.outletName}</h3>
            <p className="text-sm text-birtu/70 truncate mt-1">
              {outlet.outletAddress.addressLine}
            </p>
            <div className="text-xs text-birtu/60 mt-1 flex justify-between">
              <span>{outlet.outletAddress.regency}</span>
              <span>{outlet.outletAddress.province}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
