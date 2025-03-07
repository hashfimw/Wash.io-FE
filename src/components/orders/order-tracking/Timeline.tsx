// src/components/orders/order-tracking/Timeline.tsx
import { Timeline as TimelineType } from "@/types/order";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TimelineProps {
  timeline: TimelineType[];
  orderId?: number;
}

// Define all possible stages in order
const ALL_STAGES = ["PICKUP", "WASHING", "IRONING", "PACKING", "DELIVERY"];

export function Timeline({ timeline, orderId }: TimelineProps) {
  // Create a map of existing stages from the timeline
  const existingStages = new Map<string, TimelineType>();

  timeline.forEach((item) => {
    existingStages.set(item.stage, item);
  });

  // Create the complete timeline with all stages
  const completeTimeline = ALL_STAGES.map((stage) => {
    if (existingStages.has(stage)) {
      return existingStages.get(stage);
    } else {
      // Return a placeholder for stages not yet reached
      return {
        stage,
        status: "Pending", // This is a string, compatible with your type
        timestamp: new Date(),
      } as TimelineType; // Type assertion to match your Timeline type
    }
  });

  return (
    <div className="space-y-4">
      {completeTimeline.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                item?.status === "Completed"
                  ? "bg-birtu"
                  : item?.status === "In Progress"
                  ? "bg-oren"
                  : "bg-gray-300"
              )}
            />
            {index !== completeTimeline.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-medium">{item?.stage.replace(/_/g, " ")}</p>
            {item?.worker && (
              <p className="text-sm text-gray-500">Worker: {item?.worker}</p>
            )}
            {item?.driver && (
              <p className="text-sm text-gray-500">Driver: {item?.driver}</p>
            )}
            {item?.status !== "Pending" && (
              <p className="text-sm text-gray-500">
                {item?.timestamp && new Date(item.timestamp).toLocaleString()}
              </p>
            )}
            <Badge
              variant={
                item?.status === "Completed"
                  ? "default"
                  : item?.status === "In Progress"
                  ? "secondary"
                  : "outline"
              }
              className={cn(
                item?.status === "Completed"
                  ? "bg-birmud text-birtu hover:bg-birtu hover:text-white"
                  : item?.status === "In Progress"
                  ? "bg-birtu text-white hover:bg-oren"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-100"
              )}
            >
              {item?.status === "Pending" ? "Not Started Yet" : item?.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
