import React, { useRef, useState, useEffect } from "react";
import { Search, MapPin, Clock, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function LaundrySearchBar() {
  const [outletLocations, setOutletLocations] = useState<string[]>([]);
  const [searchValues, setSearchValues] = useState({
    location: "",
    service_type: "",
  });
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionRef = useRef<HTMLDivElement | null>(null);
  const serviceRef = useRef<HTMLDivElement | null>(null);

  const serviceOptions = [
    { value: "", label: "Quick Service" },
    { value: "express", label: "Express (2 hours)" },
    { value: "same_day", label: "Same Day" },
    { value: "next_day", label: "Next Day" },
  ];

  useEffect(() => {
    // Fetch nearby outlets dynamically (Simulated API Call)
    setOutletLocations([
      "Downtown",
      "Central Park",
      "East Side",
      "Greenwood",
      "Riverdale",
    ]);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsLocationOpen(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(target)) {
        setIsServiceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValues({ ...searchValues, location: value });

    if (value.trim()) {
      const matches = outletLocations.filter((location) =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
      setIsLocationOpen(true);
    } else {
      setIsLocationOpen(false);
    }
  };

  const handleSearch = () => {
    console.log("Searching nearby outlets:", searchValues);
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ${
        isScrolled ? "max-w-4xl" : "max-w-6xl"
      } mx-auto`}
    >
      <div
        className={`flex items-center transition-all duration-500 ${
          isScrolled ? "gap-6" : "flex-col gap-6"
        }`}
      >
        <nav className="space-x-6">
          <Link href="/" className="hover:text-orange-500">
            Home
          </Link>
          <Link href="/services" className="hover:text-orange-500">
            Teams
          </Link>
          <Link href="/locations" className="hover:text-orange-500">
            Outlets
          </Link>
          <Link href="/about" className="hover:text-orange-500">
            About
          </Link>
          <Link href="/contact" className="hover:text-orange-500">
            Contact
          </Link>
        </nav>
        <div
          className={`mx-auto p-4 flex items-center gap-4 transition-all duration-1000 ${
            isScrolled ? "bg-transparent" : "bg-white shadow-md rounded-full"
          }`}
        >
          {/* Location Search with Icon */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchValues.location}
              onChange={handleLocationChange}
              placeholder="Find outlets nearby..."
              className="w-full pl-12 pr-4 py-3 border rounded-full outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
              onFocus={() => setIsLocationOpen(true)}
            />
            {isLocationOpen && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute z-10 w-full bg-white border border-gray-200 shadow-lg rounded-md mt-1 max-h-40 overflow-y-auto"
              >
                {filteredSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setSearchValues({
                        ...searchValues,
                        location: suggestion,
                      });
                      setIsLocationOpen(false);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-300"></div>

          {/* Custom Service Type Dropdown */}
          <div className="relative" ref={serviceRef}>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <button
              className="w-48 pl-12 pr-4 py-3 border rounded-full outline-none focus:ring-2 focus:ring-blue-300 bg-transparent text-left flex items-center justify-between"
              onClick={() => setIsServiceOpen(!isServiceOpen)}
            >
              <span>
                {serviceOptions.find(
                  (opt) => opt.value === searchValues.service_type
                )?.label || "Quick Service"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isServiceOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                {serviceOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-blue-300 hover:text-white cursor-pointer transition-colors"
                    onClick={() => {
                      setSearchValues({
                        ...searchValues,
                        service_type: option.value,
                      });
                      setIsServiceOpen(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-3 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
