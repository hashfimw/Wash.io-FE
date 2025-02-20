// src/components/address/SearchableAddress.tsx
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { OutletFormValues } from "../outlets/outlet-form/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    county?: string;
    state?: string;
    village?: string;
    district?: string;
    subdistrict?: string;
  };
}

interface SearchableAddressProps {
  form: UseFormReturn<OutletFormValues>;
}

function formatAddress(address: SearchResult["address"]) {
  const parts = [
    address.road,
    address.village || address.suburb,
    address.subdistrict,
    address.city || address.county,
  ];
  return parts.filter(Boolean).join(", ");
}

export function SearchableAddress({ form }: SearchableAddressProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery || !open) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&addressdetails=1&countrycodes=id&limit=5`
        );
        const data: SearchResult[] = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching address:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, open]);

  const handleSelect = (result: SearchResult) => {
    const formattedAddress = formatAddress(result.address);

    form.setValue("latitude", result.lat);
    form.setValue("longitude", result.lon);
    form.setValue("addressLine", formattedAddress);
    form.setValue("province", result.address.state || "");
    form.setValue(
      "regency",
      result.address.city || result.address.county || ""
    );
    form.setValue(
      "district",
      result.address.district ||
        result.address.subdistrict ||
        result.address.city_district ||
        ""
    );
    form.setValue(
      "village",
      result.address.village || result.address.suburb || ""
    );

    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            {...form.register("addressLine")}
            placeholder="Enter address"
          />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[320px] sm:w-[400px] md:w-[500px] p-0 md:-left-[550px] lg:absolute items-center justify-center"
            align="end"
            sideOffset={5}
          >
            <Command className="w-full">
              <CommandInput
                placeholder="Search address..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-9"
              />
              <CommandList className="max-h-[300px] overflow-auto">
                <CommandEmpty>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    "No address found."
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {searchResults.map((result) => {
                    const formattedAddress = formatAddress(result.address);
                    return (
                      <CommandItem
                        key={`${result.lat}-${result.lon}`}
                        value={formattedAddress}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            form.watch("addressLine") === formattedAddress
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <span className="flex-1 truncate">
                          {formattedAddress}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
