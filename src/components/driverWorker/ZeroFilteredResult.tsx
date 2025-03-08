"use client";

import { CircleHelp, Filter, Search } from "lucide-react";
import Cloud from "./Cloud";

export default function ZeroFilteredResult() {
  return (
    <div className="size-full flex flex-col items-center place-content-center py-12 max-w-[480px] mx-auto gap-2">
      <div className="relative size-36 opacity-50 mb-2">
        <Cloud className="absolute left-2 -top-4 size-40 scale-x-[-1] fill-birtu/50" />
        <Cloud className="absolute -left-6 size-44 rotate-[168deg] fill-birmud" />
        <Filter className="absolute size-32 -left-6 scale-x-[-1] text-oren brightness-50 -rotate-6" />
        <Search className="absolute size-32 bottom-0 right-0 text-birtu brightness-50 rotate-6" />
        <CircleHelp className="absolute -bottom-4 left-[27px] size-20 text-red-700 stroke-[3] animate-bounce" />{" "}
      </div>
      <p className="text-xl font-semibold text-black/75">No results found</p>
      <p className="text-muted-foreground font-medium text-center">
        No results match the filter criteria. Change the filter or reset all the filters.
      </p>
    </div>
  );
}
