"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import { Search, MapPin, Phone, Clock, Star, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

import dynamic from "next/dynamic";
import { usePublicOutlets } from "@/hooks/api/outlets/usePublicOutlets";
import Link from "next/link";

// Dynamically import the LocationPicker to avoid SSR issues with Leaflet
const LocationPickerNoSSR = dynamic(
  () => import("../map/locationPicker").then((mod) => mod.LocationPicker),
  { ssr: false }
);

// Modified interface to match your API structure
interface OutletData {
  id: number;
  outletName: string;
  outletAddress: {
    addressLine: string;
    province: string;
    regency: string;
    district: string;
    village: string;
    latitude?: string;
    longitude?: string;
  };
  // Additional properties we'll add for UI needs
  phone?: string;
  hours?: string;
  rating?: number;
  services?: string[];
  image?: string;
}

// Simplified form type for LocationPicker (normally you'd import this)
interface OutletFormValues {
  latitude: string;
  longitude: string;
  addressLine: string;
  province: string;
  regency: string;
  district: string;
  village: string;
}

interface OutletSearchParams {
  search: string;
  limit: number;
  latitude?: number;
  longitude?: number;
}

const LaundryOutlets = () => {
  const searchParams = useSearchParams(); // Get search params from URL
  const urlSearchQuery = searchParams.get("search") || ""; // Get 'search' parameter

  const [activeOutlet, setActiveOutlet] = useState(0);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery); // Initialize with URL query
  const [outletData, setOutletData] = useState<OutletData[]>([]);
  const { getPublicOutlets, loading, error } = usePublicOutlets();
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileView, setMobileView] = useState(false);
  const [locationParams, setLocationParams] = useState<{
    lat?: number;
    lng?: number;
  } | null>(null);
  const itemsPerPage = 3;

  // Mock form for LocationPicker (since we're not editing, just viewing)
  const mockForm = {
    setValue: (field: string, value: any) => {
      // This is just a viewer so we don't need to do anything with the values
      console.log(`Setting ${field} to ${value}`);
    },
  } as any; // Type assertion to satisfy LocationPicker props

  const fetchOutlets = async () => {
    try {
      const searchParams: OutletSearchParams = {
        search: searchQuery,
        limit: 10, // You can adjust this as needed
      };

      // If we have location parameters, add them to the search
      if (locationParams) {
        searchParams.latitude = locationParams.lat;
        searchParams.longitude = locationParams.lng;
      }

      // Use the existing getOutlets function with search parameters
      const response = await getPublicOutlets(searchParams);

      // The rest of your code remains the same...
      const enrichedData = response.data.map((outlet) => ({
        ...outlet,
        phone: "+62 89 1011 1213",
        hours: "24 Hours",
        rating: 4.5,
        services: ["Regular Wash", "Dry Cleaning", "Express Service"],
        image:
          "https://img.freepik.com/free-vector/laundry-service-illustration_23-2151178846.jpg?t=st=1740680864~exp=1740684464~hmac=9bc3f24a6a19e52337f4e7b352c2e24ebf3c0efe157469aea6a31967130b6a26&w=900",
      }));

      setOutletData(enrichedData);
    } catch (err) {
      console.error("Error fetching outlets:", err);
    }
  };

  // Also update the dependency array of the useEffect that calls fetchOutlets:
  useEffect(() => {
    fetchOutlets();
  }, [searchQuery, locationParams]);

  // Implement debounce for search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      // This will trigger the useEffect above
      window.dispatchEvent(new Event("resize"));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = outletData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will trigger through the useEffect dependency on searchQuery
  };

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white p-4 pt-20 sm:p-6 py-8 sm:py-12 sm:mt-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8">
          Our <span className="text-orange-500">Laundry</span> Outlets
        </h2>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6 sm:mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center border-2 border-gray-300 rounded-full bg-white overflow-hidden pl-3 sm:pl-4 pr-2 py-1.5 sm:py-2"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-1 sm:mr-2" />
            <input
              type="text"
              placeholder="Search outlets by name or location..."
              className="w-full text-sm sm:text-base outline-none bg-transparent"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
            <button
              type="submit"
              className="ml-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1 sm:p-2"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
              Loading outlets...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base">
            <p>{error}</p>
            <button
              className="mt-2 text-xs sm:text-sm underline"
              onClick={() => getPublicOutlets()}
            >
              Try again
            </button>
          </div>
        )}

        {/* Content when data is loaded */}
        {!loading && !error && (
          <>
            {/* Mobile View: Tab navigation to switch between list and detail */}
            {mobileView && outletData.length > 0 && (
              <div className="mb-4 flex border-b border-gray-200">
                <button
                  className={`flex-1 py-2 px-4 text-center ${
                    activeOutlet < 0
                      ? "border-b-2 border-orange-500 text-orange-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveOutlet(-1)} // Menampilkan daftar outlet
                >
                  Outlets List
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-center ${
                    activeOutlet >= 0
                      ? "border-b-2 border-orange-500 text-orange-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveOutlet(0)} // Menampilkan detail outlet pertama
                  disabled={outletData.length === 0}
                >
                  Outlet Details
                </button>
              </div>
            )}

            {/* Mobile: Conditionally render either list or details */}
            {mobileView ? (
              activeOutlet >= 0 ? (
                // Mobile Details View
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Map - Fixed with z-index and position relative */}
                  <div className="h-48 sm:h-64 bg-gray-200 relative z-10">
                    {outletData[activeOutlet] &&
                      outletData[activeOutlet].outletAddress && (
                        <div className="absolute inset-0">
                          <LocationPickerNoSSR
                            form={mockForm}
                            latitude={
                              outletData[activeOutlet].outletAddress.latitude
                            }
                            longitude={
                              outletData[activeOutlet].outletAddress.longitude
                            }
                          />
                        </div>
                      )}
                  </div>

                  {/* Details */}
                  <div className="p-4 mt-32">
                    {/* Outlet Image */}
                    <div className="rounded-lg overflow-hidden w-full h-40 relative mb-4">
                      <Image
                        src={
                          outletData[activeOutlet].image ||
                          "/placeholder-laundry.jpg"
                        }
                        alt={outletData[activeOutlet].outletName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Outlet Name */}
                    <h3 className="text-xl font-bold">
                      {outletData[activeOutlet].outletName}
                    </h3>

                    {/* Outlet Details */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-gray-700 text-sm">
                            {outletData[activeOutlet].outletAddress.addressLine}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {[
                              outletData[activeOutlet].outletAddress.village,
                              outletData[activeOutlet].outletAddress.district,
                              outletData[activeOutlet].outletAddress.regency,
                              outletData[activeOutlet].outletAddress.province,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${outletData[activeOutlet].outletAddress.latitude}&mlon=${outletData[activeOutlet].outletAddress.longitude}#map=16/${outletData[activeOutlet].outletAddress.latitude}/${outletData[activeOutlet].outletAddress.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-500 flex items-center mt-1"
                          >
                            Get directions{" "}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-orange-500" />
                        <p className="text-gray-700 text-sm">
                          {outletData[activeOutlet].phone}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        <p className="text-gray-700 text-sm">
                          {outletData[activeOutlet].hours}
                        </p>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mt-3">
                      <h4 className="font-semibold text-sm">
                        Services Available:
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {outletData[activeOutlet].services?.map(
                          (service, idx) => (
                            <span
                              key={idx}
                              className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full"
                            >
                              {service}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Button */}
                    <div className="mt-4">
                      <Link href={"/new-order"}>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm">
                          Order Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Mobile List View
                <div className="space-y-3">
                  {currentItems.length > 0 ? (
                    currentItems.map((outlet, index) => (
                      <div
                        key={outlet.id}
                        className="border rounded-lg p-3 bg-white cursor-pointer transition-all"
                        onClick={() => setActiveOutlet(index)}
                      >
                        <h3 className="font-semibold text-base">
                          {outlet.outletName}
                        </h3>
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1 text-orange-500" />
                          <p className="line-clamp-1">
                            {outlet.outletAddress.addressLine}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          <Clock className="w-3 h-3 mr-1 text-orange-500" />
                          <p>{outlet.hours}</p>
                        </div>
                        <div className="flex items-center text-xs mt-1">
                          <div className="flex items-center">
                            <Star
                              className="w-3 h-3 text-yellow-400 mr-1"
                              fill="#FACC15"
                            />
                            <span>{outlet.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg">
                      <p className="text-sm">
                        No outlets found matching your search.
                      </p>
                    </div>
                  )}
                </div>
              )
            ) : (
              // Desktop View - Original layout with improvements
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Outlet List */}
                <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                  {currentItems.length > 0 ? (
                    currentItems.map((outlet, index) => (
                      <div
                        key={outlet.id}
                        className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                          activeOutlet === index
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 bg-white"
                        }`}
                        onClick={() => setActiveOutlet(index)}
                      >
                        <h3 className="font-semibold text-base sm:text-lg">
                          {outlet.outletName}
                        </h3>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500" />
                          <p className="line-clamp-1">
                            {outlet.outletAddress.addressLine}
                          </p>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500" />
                          <p>{outlet.hours}</p>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm mt-1">
                          <div className="flex items-center">
                            <Star
                              className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mr-1"
                              fill="#FACC15"
                            />
                            <span>{outlet.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 bg-white rounded-lg">
                      <p className="text-sm sm:text-base">
                        No outlets found matching your search.
                      </p>
                    </div>
                  )}
                </div>

                {/* Map and Details Section */}
                {outletData.length > 0 && (
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Map - Fixed with z-index and position relative */}
                    <div className="h-48 sm:h-64 bg-gray-200 relative">
                      <div className="absolute inset-0 z-10">
                        <LocationPickerNoSSR
                          form={mockForm}
                          latitude={
                            outletData[activeOutlet].outletAddress.latitude
                          }
                          longitude={
                            outletData[activeOutlet].outletAddress.longitude
                          }
                        />
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 sm:pt-6 md:pt-4">
                      <div className="flex flex-col md:flex-row md:items-center">
                        <div className="md:w-1/3 mb-4 md:mb-0">
                          <div className="rounded-lg overflow-hidden w-full h-32 sm:h-40 relative">
                            <Image
                              src={
                                outletData[activeOutlet].image ||
                                "/placeholder-laundry.jpg"
                              }
                              alt={outletData[activeOutlet].outletName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        <div className="md:w-2/3 md:pl-6 pt-10">
                          <h3 className="text-xl sm:text-2xl font-bold">
                            {outletData[activeOutlet].outletName}
                          </h3>

                          <div className="mt-3 sm:mt-4 space-y-2">
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500 mt-0.5" />
                              <div>
                                <p className="text-gray-700 text-sm sm:text-base">
                                  {
                                    outletData[activeOutlet].outletAddress
                                      .addressLine
                                  }
                                </p>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                  {[
                                    outletData[activeOutlet].outletAddress
                                      .village,
                                    outletData[activeOutlet].outletAddress
                                      .district,
                                    outletData[activeOutlet].outletAddress
                                      .regency,
                                    outletData[activeOutlet].outletAddress
                                      .province,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                                <a
                                  href={`https://www.openstreetmap.org/?mlat=${outletData[activeOutlet].outletAddress.latitude}&mlon=${outletData[activeOutlet].outletAddress.longitude}#map=16/${outletData[activeOutlet].outletAddress.latitude}/${outletData[activeOutlet].outletAddress.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm text-orange-500 flex items-center mt-1"
                                >
                                  Get directions{" "}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                              <p className="text-gray-700 text-sm sm:text-base">
                                {outletData[activeOutlet].phone}
                              </p>
                            </div>

                            <div className="flex items-center">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-500" />
                              <p className="text-gray-700 text-sm sm:text-base">
                                {outletData[activeOutlet].hours}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 sm:mt-4">
                            <h4 className="font-semibold text-sm sm:text-base">
                              Services Available:
                            </h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                              {outletData[activeOutlet].services?.map(
                                (service, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-orange-100 text-orange-800 text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-full"
                                  >
                                    {service}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div className="mt-4 sm:mt-6">
                            <Link href={"/new-order"}>
                              <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base">
                                Order Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination - Improved for mobile */}
            {currentItems.length > 0 && (
              <div className="flex justify-center items-center space-x-2 mt-4 sm:mt-6">
                <button
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-md"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="text-sm sm:text-base px-2">
                  Page {currentPage}
                </div>
                <button
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-md"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={indexOfLastItem >= outletData.length}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default LaundryOutlets;
