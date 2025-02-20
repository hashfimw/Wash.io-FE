// src/components/orders/order-tracking/Timeline.tsx
import { Timeline as TimelineType } from "@/types/order";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TimelineProps {
  timeline: TimelineType[];
}

export function Timeline({ timeline }: TimelineProps) {
  return (
    <div className="space-y-4">
      {timeline.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                item.status === "Completed" ? "bg-green-500" : "bg-gray-300"
              )}
            />
            {index !== timeline.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-medium">{item.stage.replace(/_/g, " ")}</p>
            {item.worker && (
              <p className="text-sm text-gray-500">Worker: {item.worker}</p>
            )}
            {item.driver && (
              <p className="text-sm text-gray-500">Driver: {item.driver}</p>
            )}
            <p className="text-sm text-gray-500">
              {new Date(item.timestamp).toLocaleString()}
            </p>
            <Badge
              variant={item.status === "Completed" ? "default" : "secondary"}
            >
              {item.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
