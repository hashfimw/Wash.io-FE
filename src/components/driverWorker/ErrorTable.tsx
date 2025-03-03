"use client";

import { CircleAlert } from "lucide-react";
import Cloud from "./Cloud";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function ErrorTable({ errorMessage }: { errorMessage: string }) {
  const router = useRouter();

  return (
    <div className="size-full flex flex-col items-center place-content-center py-12 max-w-[480px] mx-auto gap-2">
      <div className="relative size-36 opacity-50 mb-2">
        <Cloud className="absolute left-2 -top-4 size-40 scale-x-[-1] fill-red-800" />
        <Cloud className="absolute -left-6 size-44 rotate-[168deg] fill-red-300" />
        <CircleAlert className="absolute -bottom-4 left-[27px] size-20 text-red-700 stroke-[3] animate-bounce" />{" "}
      </div>
      <p className="text-xl font-semibold text-black/75">Error</p>
      <p className="text-muted-foreground font-medium text-center">{errorMessage}</p>
      <Button
        onClick={() => router.refresh()}
        variant="outline"
        className="bg-birtu text-white hover:text-white transition hover:bg-oren rounded-lg border-0"
      >
        Refresh page
      </Button>
    </div>
  );
}
