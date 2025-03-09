"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Button } from "../ui/button";
import { Package2, Shirt, Smartphone, Truck } from "lucide-react";
import LaundrySearchBar from "./searchbar";
import Link from "next/link";

export default function Homepage() {
  const images = [
    "https://img.freepik.com/free-vector/laundry-service-facebook-template_23-2150940963.jpg?t=st=1740681005~exp=1740684605~hmac=daf4cb79adee7fd192963480afc35cf180fa213aa049efbf91f1f271ee694c49&w=1480",
    "https://img.freepik.com/free-vector/laundry-service-webinar-template_23-2150940975.jpg?t=st=1740865716~exp=1740869316~hmac=eb651b8a3163daa7b9190ee8ac62040004520cd8fc0d97c4678104219a844d7f&w=1480",
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
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen text-center p-4 mb-24">
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

      <section className="pt-28 space-y-14">
        <div className="flex flex-col md:flex-row items-center gap-8 px-12">
          <div className="text-center md:text-left md:w-1/2">
            <h2 className="text-2xl md:text-4xl font-bold">
              Fresh Laundry,{" "}
              <span className="relative bg-oren p-2 text-white inline-block overflow-hidden rotate-12 group">
                Hassle-Free
                {/* Lipatan awalnya terlihat */}
                <span className="absolute top-0 right-0 w-[40px] h-[40px] bg-gradient-to-br from-white to-gray-300 rounded-bl-full shadow-lg transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-0 group-hover:translate-x-8 group-hover:-translate-y-8"></span>
                <span className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-t-[#E7FAFE] border-l-transparent transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-0 group-hover:translate-x-8 group-hover:-translate-y-8"></span>
              </span>
            </h2>

            <p className="text-gray-600">Experience premium laundry service at your fingertips.</p>
            <div className="flex justify-center md:justify-start">
              <div className="mt-6 space-x-2">
                <Button className="bg-oren hover:bg-orange-400 text-white text-sm">
                  <Link href={"/register"}>Get Started Now</Link>
                </Button>
                <Button className="bg-birtu hover:bg-gray-800 text-white text-sm">
                  <Link href={"/about"}>Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <Swiper
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              modules={[Pagination, Autoplay]}
              className="w-full max-w-xs md:max-w-full mx-auto rounded-3xl mt-10"
            >
              {images.map((src, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={src}
                    alt={`Laundry ${index + 1}`}
                    width={900}
                    height={666}
                    className="rounded-lg object-cover w-full h-auto"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Promotions Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-12 mt-8">
          {[
            { title: "20% OFF", desc: "First Order Discount" },
            { title: "FREE", desc: "Pickup This Week" },
            { title: "30% OFF", desc: "Bulk Orders" },
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-lg text-orange-500 font-bold">{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Why Choose Us Section */}
        <section className="mt-8">
          <h3 className="text-xl md:text-2xl font-semibold">Why Choose Us</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-12 mt-6">
            {[
              {
                icon: "⚡",
                title: "Quick Service",
                desc: "24-hour turnaround on most services.",
              },
              {
                icon: "🌿",
                title: "Eco-Friendly",
                desc: "Using sustainable cleaning methods.",
              },
              {
                icon: "💰",
                title: "Affordable",
                desc: "Competitive prices for quality service.",
              },
            ].map((item, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold text-orange-500">
                  {item.icon} {item.title}
                </h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-8 md:px-20">
          <h3 className="text-xl md:text-2xl font-semibold">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-12 mt-6">
            {[
              {
                title: "1. Place Order",
                desc: "Easily schedule your laundry pickup via our app. Select the date and time that works best for you.",
                Icon: Smartphone,
              },
              {
                title: "2. Pickup",
                desc: "Our driver will come to your doorstep to pick up your laundry at the scheduled time, hassle-free.",
                Icon: Truck,
              },
              {
                title: "3. Clean & Fold",
                desc: "We professionally clean and fold your clothes using eco-friendly detergents and safe methods.",
                Icon: Shirt,
              },
              {
                title: "4. Delivery",
                desc: "Once your laundry is cleaned and folded, we’ll return it to your doorstep promptly and with care.",
                Icon: Package2,
              },
            ].map((item, index) => (
              <div key={index} className="bg-white shadow-md rounded-full p-6 flex items-center space-x-4">
                <div className="flex justify-center items-center p-4 bg-orange-100 rounded-full">
                  <item.Icon className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-start">
                  <h4 className="text-lg font-semibold">{item.title}</h4>
                  <p className="text-gray-700 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
