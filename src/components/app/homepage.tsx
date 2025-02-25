"use client";

import Image from "next/image";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Button } from "../ui/button";
import { Package2, Shirt, Smartphone, Truck } from "lucide-react";

export default function Homepage() {
  const images = [
    "https://www.goteso.com/products/assets/images/clone-scripts/laundrapp/laundrapp-clone-banner.png",
    "https://img.freepik.com/free-vector/flat-design-laundry-service-instagram-posts_23-2150989277.jpg?t=st=1738556340~exp=1738559940~hmac=3e1551d8c688b631863d5723eb2f35a162dc220cf640d70d3d6a70c983cea6d0&w=996",
    "https://www.digitalopeners.com/images/service/Laundry%20App/laundry-banner.webp",
  ];

  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen text-center p-4">
      <section className="py-24 space-y-14">
        <div className="flex flex-col md:flex-row items-center gap-8 px-12">
          <div className="text-center md:text-left md:w-1/2">
            <h2 className="text-2xl md:text-4xl font-bold">
              Fresh Laundry,{" "}
              <span className="bg-orange-500 p-1 text-white">Hassle-Free</span>
            </h2>
            <p className="text-gray-600">
              Experience premium laundry service at your fingertips.
            </p>
            <div className="flex justify-center md:justify-start">
              <div className="mt-6 space-x-2">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
                  Get Started Now
                </Button>
                <Button className="bg-gray-700 hover:bg-gray-800 text-white text-sm">
                  Learn More.
                </Button>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <Swiper
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true, el: "none" }}
              modules={[Pagination, Autoplay]}
              className="w-full max-w-xs md:max-w-full mx-auto rounded-lg"
            >
              {images.map((src, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={src}
                    alt={`Laundry ${index + 1}`}
                    width={900}
                    height={250}
                    className="rounded-lg object-cover w-full h-auto"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-12 mt-8">
          {[
            { title: "20% OFF", desc: "First Order Discount" },
            { title: "FREE", desc: "Pickup This Week" },
            { title: "30% OFF", desc: "Bulk Orders" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <h3 className="text-lg text-orange-500 font-bold">
                {item.title}
              </h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </section>

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
              <div
                key={index}
                className="bg-white shadow-md rounded-full p-6 flex items-center space-x-4"
              >
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
