// src/components/bypass/Badge.tsx
import { Badge as UIBadge } from "@/components/ui/badge";
import { ByPassStatus, WorkerStation } from "@/types/bypass";

interface BadgeProps {
  type: "status" | "station";
  value: ByPassStatus | WorkerStation | null;
}

export function CustomBadge({ type, value }: BadgeProps) {
  // Status badge logic
  if (type === "status") {
    const status = value as ByPassStatus | null;

    if (status === null) {
      return (
        <UIBadge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Pending
        </UIBadge>
      );
    } else if (status === "ACCEPTED") {
      return (
        <UIBadge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Approved
        </UIBadge>
      );
    } else if (status === "REJECTED") {
      return (
        <UIBadge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Rejected
        </UIBadge>
      );
    }
    return <UIBadge variant="outline">{status as string}</UIBadge>;
  }

  // Station badge logic
  if (type === "station") {
    const station = value as WorkerStation;

    switch (station) {
      case "WASHING":
        return (
          <UIBadge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Washing
          </UIBadge>
        );
      case "IRONING":
        return (
          <UIBadge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Ironing
          </UIBadge>
        );
      case "PACKING":
        return (
          <UIBadge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Packing
          </UIBadge>
        );
      default:
        return <UIBadge variant="outline">{station as string}</UIBadge>;
    }
  }

  // Fallback for any other type
  return <UIBadge variant="outline">{String(value)}</UIBadge>;
}
