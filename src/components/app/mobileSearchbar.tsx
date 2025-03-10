"use client"

import React, { useRef, useState, useEffect } from "react";
import {
  Search,
  Locate,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { usePublicOutlets } from "@/hooks/api/outlets/usePublicOutlets";
import { Outlet, OutletParams } from "@/types/outlet";
import { useLocation } from "@/context/LocationContext";

export default function MobileLaundrySearchBar() {
  const router = useRouter();
  
  const {
    outlets,
    loading: apiLoading,
    error: apiError,
    getPublicOutlets,
  } = usePublicOutlets();
  const {
    location,
    permissionStatus,
    error: locationError,
    isLoading: locationLoading,
    requestLocation,
    clearError,
    calculateDistance,
  } = useLocation();

  const [searchValues, setSearchValues] = useState({
    location: "",
    service_type: "",
  });
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<
    (Outlet & { distance?: number })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [outletLocations, setOutletLocations] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<"text" | "location">("text");
  const [lastSearchParams, setLastSearchParams] = useState<OutletParams | null>(
    null
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Maximum distance in kilometers to show outlets
  const MAX_DISTANCE_KM = 30;

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial fetch of outlets on component mount
  useEffect(() => {
    fetchInitialOutlets();
  }, []);

  // Update search results with distance when location changes
  useEffect(() => {
    if (
      location &&
      searchType === "location" &&
      outlets &&
      outlets.length > 0
    ) {
      updateOutletsWithDistance(outlets, location.latitude, location.longitude);
    }
  }, [location, outlets, searchType]);

  // Extract unique locations from outlets for search suggestions
  useEffect(() => {
    if (outlets && outlets.length > 0) {
      // Extract unique location names from outlets
      const locations = outlets
        .map(
          (outlet) =>
            [
              outlet.outletAddress.province,
              outlet.outletAddress.regency,
              outlet.outletAddress.district,
            ].filter(Boolean)[0] || ""
        )
        .filter((location) => location.trim() !== "")
        .filter((value, index, self) => self.indexOf(value) === index); // Get unique values

      setOutletLocations(locations);
    }
  }, [outlets]);

  // Filter suggestions based on search input
  useEffect(() => {
    if (searchValues.location.trim() === "") {
      setFilteredSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Only show suggestions if we're not currently showing search results
    if (searchResults.length > 0) {
      return;
    }

    // Filter locations that match search term
    const filtered = outletLocations.filter((location) =>
      location.toLowerCase().includes(searchValues.location.toLowerCase())
    );

    setFilteredSuggestions(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchValues.location, outletLocations, searchResults.length]);

  const fetchInitialOutlets = async () => {
    try {
      // Get initial outlet data
      await getPublicOutlets({ limit: 100 });
    } catch (error) {
      console.error("Error fetching initial outlets:", error);
    }
  };

  const updateOutletsWithDistance = (
    outletData: Outlet[],
    latitude: number,
    longitude: number
  ) => {
    // Calculate distance for each outlet
    const outletsWithDistance = outletData.map((outlet) => {
      // Parse latitude and longitude values
      const outletLat = parseFloat(outlet.outletAddress.latitude || "0");
      const outletLng = parseFloat(outlet.outletAddress.longitude || "0");

      // Skip distance calculation if outlet coordinates are not available
      if (outletLat === 0 && outletLng === 0) {
        return { ...outlet, distance: undefined };
      }

      // Calculate distance using the Haversine formula
      const distance = calculateDistance(
        latitude,
        longitude,
        outletLat,
        outletLng
      );

      return { ...outlet, distance };
    });

    // Filter out outlets without valid coordinates and outside MAX_DISTANCE_KM
    const nearbyOutlets = outletsWithDistance.filter(
      (outlet) =>
        outlet.distance !== undefined && outlet.distance <= MAX_DISTANCE_KM
    );

    // Sort by distance
    const sortedOutlets = nearbyOutlets.sort(
      (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
    );

    setSearchResults(sortedOutlets);

    // Update search input to reflect the number of nearby outlets found
    setSearchValues({
      ...searchValues,
      location: `${sortedOutlets.length} outlets within ${MAX_DISTANCE_KM}km`,
    });

    // Show "no results" message in dropdown if no nearby outlets found
    setShowDropdown(true);
  };

  const handleRequestLocation = async () => {
    clearError(); // Clear any previous errors
    setSearchType("location");

    try {
      setIsLoading(true);

      // Request user's location
      const userLocation = await requestLocation();

      if (userLocation) {
        // If we already have outlets, update distances
        if (outlets && outlets.length > 0) {
          updateOutletsWithDistance(
            outlets,
            userLocation.latitude,
            userLocation.longitude
          );
        } else {
          // Otherwise fetch outlets and then update distances
          const params: OutletParams = { limit: 100 };
          const response = await getPublicOutlets(params);

          if (response && response.data) {
            updateOutletsWithDistance(
              response.data,
              userLocation.latitude,
              userLocation.longitude
            );
          }
        }
      }
    } catch (error) {
      console.error("Error using location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchValues.location.trim() === "") return;

    try {
      setIsLoading(true);
      setSearchType("text");
      setMobileNavOpen(false); // Close mobile nav when searching

      // Search parameters
      const params: OutletParams = {
        search: searchValues.location,
        limit: 100, // Increased limit to get more potential nearby results
      };

      setLastSearchParams(params);

      // Fetch outlets with search parameters
      const response = await getPublicOutlets(params);

      if (response && response.data) {
        // If we have user location, add distance information and filter by distance
        if (location) {
          updateOutletsWithDistance(
            response.data,
            location.latitude,
            location.longitude
          );
        } else {
          // If no location data, show search results without distance filtering
          setSearchResults(response.data);
          setShowDropdown(true);
        }
      }
    } catch (error) {
      console.error("Error searching outlets:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchValues({ ...searchValues, location: suggestion });
    setShowDropdown(false);

    // Trigger search with the selected suggestion
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleOutletSelect = (outlet: Outlet) => {
    // Navigate to outlet detail page with the outlet ID
    setShowDropdown(false);
    
    // Navigate to outlets page with the search query
    // We'll use the outlet's location data for the search
    const searchQuery = outlet.outletAddress.district || 
                       outlet.outletAddress.regency || 
                       outlet.outletAddress.province || 
                       outlet.outletName;
    
    router.push(`/outlets?search=${encodeURIComponent(searchQuery)}`);
  };

  // Format the full address from outlet address components
  const getFormattedAddress = (outlet: Outlet): string => {
    const { addressLine, village, district, regency, province } =
      outlet.outletAddress;
    return [addressLine, village, district, regency, province]
      .filter((part) => part && part.trim() !== "")
      .join(", ");
  };

  // Function to navigate to outlets page with current search
  const goToOutletsPage = () => {
    if (searchValues.location.trim() !== "") {
      router.push(`/outlets?search=${encodeURIComponent(searchValues.location)}`);
    } else {
      router.push('/outlets');
    }
    setShowDropdown(false);
  };

  // Toggle mobile navigation
  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
    // Close dropdown when opening mobile nav
    if (!mobileNavOpen) {
      setShowDropdown(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Header with logo and menu button */}

      {/* Search area - always visible */}
      <div className="p-3 bg-transparent">
        <div className="relative flex items-center gap-2 bg-white rounded-full shadow-sm border border-gray-200">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-birtu">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchValues.location}
              onChange={(e) =>
                setSearchValues({ ...searchValues, location: e.target.value })
              }
              placeholder="Find outlets..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full outline-none text-sm focus:ring-2 focus:ring-blue-300 transition-shadow"
              onFocus={() => {
                if (
                  searchValues.location.trim() !== "" &&
                  filteredSuggestions.length > 0
                ) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleRequestLocation}
              disabled={locationLoading}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full 
                hover:bg-gray-100 focus:outline-none transition-colors
                ${
                  permissionStatus === "denied"
                    ? "text-red-500"
                    : "text-gray-500"
                }
              `}
              title={
                permissionStatus === "denied"
                  ? "Location permission denied. Click to try again."
                  : "Use my current location to find outlets within 30km"
              }
            >
              <Locate
                className={`w-4 h-4 ${
                  locationLoading ? "animate-pulse text-blue-500" : ""
                }`}
              />
            </button>
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || apiLoading}
            className={`px-3 py-2.5 bg-oren text-white rounded-full 
              hover:bg-orange-400 transition-colors flex items-center justify-center
              ${isLoading || apiLoading ? "opacity-70" : ""}
              w-10 h-10
            `}
          >
            {isLoading || apiLoading || locationLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Dropdown for search suggestions and results */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute w-full bg-white shadow-lg z-10 overflow-hidden max-h-80 overflow-y-auto"
        >
          {isLoading || apiLoading || locationLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                {searchType === "location"
                  ? "Finding outlets nearby..."
                  : "Searching outlets..."}
              </p>
            </div>
          ) : filteredSuggestions.length > 0 && searchResults.length === 0 ? (
            <div className="p-2">
              <h3 className="text-xs text-gray-500 px-3 py-1">Suggestions</h3>
              <ul>
                {filteredSuggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{suggestion}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              <div className="flex justify-between items-center text-xs text-gray-500 px-3 py-1">
                <h3>
                  {searchType === "location"
                    ? `Outlets Within ${MAX_DISTANCE_KM}km`
                    : "Outlets Found"}
                  {searchResults.length > 0 && (
                    <span className="ml-1">({searchResults.length})</span>
                  )}
                </h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {searchResults.slice(0, 5).map((outlet, index) => (
                  <li key={outlet.id || index}>
                    <button
                      onClick={() => handleOutletSelect(outlet)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{outlet.outletName}</span>
                        {outlet.distance !== undefined && (
                          <span className="text-xs text-gray-500">
                            {outlet.distance < 1
                              ? `${(outlet.distance * 1000).toFixed(0)} m`
                              : `${outlet.distance.toFixed(1)} km`}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate max-w-full">
                        {getFormattedAddress(outlet)}
                      </div>
                      {/* Operating hours UI */}
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        24 Hours
                      </div>
                    </button>
                  </li>
                ))}
                {searchResults.length > 5 && (
                  <li>
                    <button
                      onClick={goToOutletsPage}
                      className="w-full text-center py-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
                    >
                      View All {searchResults.length} Results
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ) : locationError || apiError ? (
            <div className="p-4 flex flex-col items-center text-center">
              <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
              <p className="text-red-500 font-medium text-sm">
                {locationError || apiError}
              </p>
              {permissionStatus === "denied" && (
                <p className="text-xs text-gray-600 mt-2">
                  Please enable location services in your browser settings to
                  use this feature.
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchType === "location"
                ? "No outlets found within 30km of your location"
                : "No results found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}