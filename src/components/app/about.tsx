"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { ShowerHead, ThumbsUp, Clock, WashingMachine } from "lucide-react";
import LaundrySearchBar from "./searchbar";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"machines" | "services" | "why-us">("machines");
  const [selectedItem, setSelectedItem] = useState<number>(0);

  // Machines data
  const machines = [
    {
      id: 0,
      name: "Industrial Washers",
      description:
        "Our commercial-grade washing machines handle larger loads while using less water and energy than traditional machines. Perfect for bulky items and family-sized loads.",
      capacity: "25kg capacity",
      image: "/images/washer.jpg",
      features: ["Energy efficient", "Gentle on fabrics", "Extra rinse option"],
    },
    {
      id: 1,
      name: "High-Speed Dryers",
      description:
        "State-of-the-art dryers with adjustable temperature settings to protect your fabrics while drying them thoroughly and quickly.",
      capacity: "20kg capacity",
      image: "/images/dryer.jpg",
      features: ["Moisture sensing", "Quick dry technology", "Anti-wrinkle setting"],
    },
    {
      id: 2,
      name: "Stain Treatment Station",
      description:
        "Specialized equipment for pre-treating stubborn stains before washing, ensuring better results on difficult spots and marks.",
      capacity: "Custom treatments",
      image: "/images/stain-station.jpg",
      features: ["Eco-friendly solutions", "Targeted application", "Works on all fabrics"],
    },
  ];

  // Services data
  const services = [
    {
      id: 0,
      name: "Wash & Fold",
      description:
        "Our popular wash and fold service is perfect for busy professionals. Just drop off your laundry, and we'll take care of washing, drying, and folding it for you.",
      price: "Starting at $2.50/lb",
      image: "/images/wash-fold.jpg",
      features: ["24-hour turnaround", "Sorted by color", "Neatly folded"],
    },
    {
      id: 1,
      name: "Dry Cleaning",
      description:
        "Professional dry cleaning for your delicate garments, suits, dresses, and specialty fabrics that require special care.",
      price: "Starting at $6.99/item",
      image: "/images/dry-cleaning.jpg",
      features: ["Gentle process", "Stain treatment", "Preserves fabric quality"],
    },
    {
      id: 2,
      name: "Express Service",
      description:
        "Need it fast? Our express service guarantees same-day completion when dropped off before 10 AM.",
      price: "Additional 30% fee",
      image: "/images/express.jpg",
      features: ["Same-day service", "Priority handling", "SMS notification"],
    },
  ];

  // Why Choose Us data
  const whyChooseUs = [
    {
      id: 0,
      title: "Eco-Friendly Products",
      description:
        "We use biodegradable detergents and energy-efficient machines to minimize our environmental footprint while still delivering exceptional cleaning results.",
      icon: <ShowerHead className="w-12 h-12 text-birtu" />,
    },
    {
      id: 1,
      title: "Experienced Staff",
      description:
        "Our team has over 15 years of experience in textile care, with specialized training in stain removal and fabric preservation techniques.",
      icon: <ThumbsUp className="w-12 h-12 text-birtu" />,
    },
    {
      id: 2,
      title: "Quick Turnaround",
      description:
        "Most services are completed within 24 hours, and we offer express options when you need your laundry even faster.",
      icon: <Clock className="w-12 h-12 text-birtu" />,
    },
    {
      id: 3,
      title: "Advanced Technology",
      description:
        "Our laundry uses the latest washing and drying technology to ensure better cleaning results while being gentler on your clothes.",
      icon: <WashingMachine className="w-12 h-12 text-birtu" />,
    },
  ];
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen text-start p-4 mb-24">
      {/* Navbar Sticky dengan Search Bar */}
      <div
        className={`fixed top-0 left-80 right-80 z-50 transition-all ${
          isScrolled ? "bg-transparent" : "bg-transparent py-6"
        }`}
      >
        <div className="hidden md:flex w-50 mx-auto px-4">
          <LaundrySearchBar />
        </div>
      </div>
      {/* Header Banner */}
      <section className="pt-28 px-4 md:px-12 mt-10 mb-16">
        <div className="bg-birtu rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-birtu to-transparent opacity-90"></div>
          <div className="relative z-10 py-16 px-8 md:px-16 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-white mb-8 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Washio Laundry</h1>
              <p className="text-lg opacity-90 mb-6">
                Discover our state-of-the-art equipment, premium services, and why customers choose us for all
                their laundry needs.
              </p>
              <Button className="bg-oren hover:bg-orange-600 text-white border-none">Book Service Now</Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-52 h-52 md:w-52 md:h-52 bg-birmud rounded-full flex items-center justify-center">
                <Image
                  src={"/washio-oren.png"}
                  alt="washio-logo"
                  width={200} // Sesuaikan ukuran logo
                  height={200}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="max-w-6xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 overflow-hidden">
          <button
            onClick={() => {
              setActiveTab("machines");
              setSelectedItem(0);
            }}
            className={`py-4 px-6 font-medium text-lg whitespace-nowrap ${
              activeTab === "machines"
                ? "text-oren border-b-2 border-oren -mb-px"
                : "text-birtu hover:text-oren"
            }`}
          >
            Our Machines
          </button>
          <button
            onClick={() => {
              setActiveTab("services");
              setSelectedItem(0);
            }}
            className={`py-4 px-6 font-medium text-lg whitespace-nowrap ${
              activeTab === "services"
                ? "text-oren border-b-2 border-oren -mb-px"
                : "text-birtu hover:text-oren"
            }`}
          >
            Services
          </button>
          <button
            onClick={() => {
              setActiveTab("why-us");
              setSelectedItem(0);
            }}
            className={`py-4 px-6 font-medium text-lg whitespace-nowrap ${
              activeTab === "why-us"
                ? "text-oren border-b-2 border-oren -mb-px"
                : "text-birtu hover:text-oren"
            }`}
          >
            Chose Us
          </button>
        </div>

        {/* Content Area */}
        <div className="grid md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            {activeTab === "machines" && (
              <div className="bg-putbir rounded-xl p-4">
                <h3 className="text-birtu font-medium mb-4">Equipment</h3>
                {machines.map((machine, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItem(machine.id)}
                    className={`w-full text-left mb-2 p-3 rounded-lg transition-all ${
                      selectedItem === machine.id
                        ? "bg-birmud text-birtu shadow-sm"
                        : "hover:bg-birmud hover:bg-opacity-50 text-gray-700"
                    }`}
                  >
                    {machine.name}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "services" && (
              <div className="bg-putbir rounded-xl p-4">
                <h3 className="text-birtu font-medium mb-4">Our Services</h3>
                {services.map((service, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItem(service.id)}
                    className={`w-full text-left mb-2 p-3 rounded-lg transition-all ${
                      selectedItem === service.id
                        ? "bg-birmud text-birtu shadow-sm"
                        : "hover:bg-birmud hover:bg-opacity-50 text-gray-700"
                    }`}
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "why-us" && (
              <div className="bg-putbir rounded-xl p-4">
                <h3 className="text-birtu font-medium mb-4">Our Advantages</h3>
                {whyChooseUs.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedItem(item.id)}
                    className={`w-full text-left mb-2 p-3 rounded-lg transition-all ${
                      selectedItem === item.id
                        ? "bg-birmud text-birtu shadow-sm"
                        : "hover:bg-birmud hover:bg-opacity-50 text-gray-700"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-9">
            {/* Machines Content */}
            {activeTab === "machines" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
                <div className="bg-gradient-to-r from-birmud to-putbir h-48 flex items-center justify-center p-4">
                  <div className="bg-white rounded-full p-8 shadow-md">
                    <WashingMachine className="w-16 h-16 text-birtu" />
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-birtu mb-3">{machines[selectedItem].name}</h2>
                  <p className="text-gray-700 mb-6">{machines[selectedItem].description}</p>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 bg-putbir rounded-lg p-4">
                      <h3 className="font-medium text-birtu mb-2">Capacity</h3>
                      <p>{machines[selectedItem].capacity}</p>
                    </div>
                    <div className="flex-1 bg-putbir rounded-lg p-4">
                      <h3 className="font-medium text-birtu mb-2">Features</h3>
                      <ul className="list-disc list-inside">
                        {machines[selectedItem].features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services Content */}
            {activeTab === "services" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
                <div className="bg-gradient-to-r from-birmud to-putbir h-48 flex items-center justify-center p-4">
                  <div className="bg-white rounded-full p-8 shadow-md">
                    <ShowerHead className="w-16 h-16 text-birtu" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-bold text-birtu">{services[selectedItem].name}</h2>
                    <span className="bg-oren text-white px-3 py-1 rounded-full text-sm">
                      {services[selectedItem].price}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6">{services[selectedItem].description}</p>

                  <div className="bg-putbir rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-birtu mb-2">What's Included</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {services[selectedItem].features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="bg-birmud p-1 rounded-full mr-2">
                            <svg
                              className="w-4 h-4 text-birtu"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-oren hover:bg-orange-600 text-white">Book This Service</Button>
                </div>
              </div>
            )}

            {/* Why Choose Us Content */}
            {activeTab === "why-us" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
                <div className="bg-gradient-to-r from-birmud to-putbir p-12 flex justify-center">
                  {whyChooseUs[selectedItem].icon}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-birtu mb-4">{whyChooseUs[selectedItem].title}</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {whyChooseUs[selectedItem].description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto mt-24 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Johnson",
              comment:
                "The express service saved me when I needed my suit cleaned for an unexpected meeting. Incredible turnaround time!",
              rating: 5,
            },
            {
              name: "Mark Davis",
              comment:
                "I've been using their wash & fold service for months. My clothes come back perfectly clean and neatly folded every time.",
              rating: 5,
            },
            {
              name: "Amy Chen",
              comment:
                "As someone who cares about the environment, I appreciate their eco-friendly approach to laundry. Great service!",
              rating: 4,
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-birmud rounded-full flex items-center justify-center mr-4">
                  <span className="text-birtu font-bold">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-medium">{testimonial.name}</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating ? "text-oren" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-6xl mx-auto mt-24 px-4">
        <div className="bg-oren rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-oren to-transparent opacity-90"></div>
          <div className="relative z-10 py-12 px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Experience Premium Laundry Service?
            </h2>
            <p className="text-white opacity-90 mb-8 max-w-2xl mx-auto">
              Join our satisfied customers and let us take care of your laundry needs. First-time customers
              get 20% off their first order!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-white text-oren hover:bg-birmud hover:text-birtu">Book a Pickup</Button>
              <Button className="bg-transparent border border-white text-white hover:bg-white hover:text-oren">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
