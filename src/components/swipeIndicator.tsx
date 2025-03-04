// src/components/ui/SwipeIndicator.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeIndicatorProps {
  text?: string;
  className?: string;
}

const SwipeIndicator = ({
  text = "Swipe table to view details",
  className = "",
}: SwipeIndicatorProps) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-2 text-sm text-gray-700 bg-gray-50 rounded-md border border-b-0 ${className}`}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{text}</span>
      <ChevronRight className="h-4 w-4" />
    </div>
  );
};

export default SwipeIndicator;
