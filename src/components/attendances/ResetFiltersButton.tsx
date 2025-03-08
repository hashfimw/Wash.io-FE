"use client";

import { ListRestart } from "lucide-react";
import { Button } from "../ui/button";

export default function ResetFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" className="text-sm w-fit" onClick={onClick}>
      <ListRestart />
      Reset filters
    </Button>
  );
}
