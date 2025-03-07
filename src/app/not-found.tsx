"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shirt, WashingMachine, AlertTriangle, Home, Droplets, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import Bubbles from "@/components/animations/Bubble";
import WavesAnimation from "@/components/animations/Waves";
import LightBeam from "@/components/animations/LightBeam";

export default function NotFound() {
  const [showSearchAnimation, setShowSearchAnimation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Animation timer
    const timer = setTimeout(() => {
      setShowSearchAnimation(true);
    }, 1500);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
      clearTimeout(timer);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 6,
        stiffness: 60,
        duration: 1.2,
      },
    },
  };

  const errorText = "404";
  const washText = "Wash.io";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-putbir to-birmud overflow-hidden relative">
      {/* Background layer */}
      <div className="absolute inset-0 bg-putbir opacity-40" style={{ zIndex: 0 }} />

      {/* Reusable Animation Components */}
      <Bubbles isMobile={isMobile} />
      <LightBeam />
      <WavesAnimation />

      <div className="relative z-10 max-w-full md:max-w-2xl mx-auto px-4 text-center">
        <div className="relative mb-8 pt-16 md:pt-0">
          {/* Main Content */}
          <div className="relative">
            {/* Washing Machine Animation */}
            <motion.div
              initial={{ scale: 0, x: 100 }}
              animate={{ scale: 1, x: 0 }}
              transition={{
                duration: 1.5,
                type: "spring",
                damping: 10,
              }}
              className={`absolute ${
                isMobile ? "top-1 right-1" : "-top-16 -right-20 md:-right-32"
              } hidden sm:block`}
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    times: [0, 0.33, 0.66, 1],
                  }}
                >
                  <WashingMachine size={isMobile ? 80 : 120} className="text-birtu" />
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    top: "40%",
                    left: "40%",
                    width: "20%",
                    height: "20%",
                    borderRadius: "50%",
                  }}
                  className="border-dashed border-3 border-birmud"
                />
              </div>
            </motion.div>

            {/* Animated Search Icon */}
            <AnimatePresence>
              {showSearchAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: -50, y: -30 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1 }}
                  className={`absolute ${
                    isMobile ? "top-1 left-1" : "-left-16 -top-10 md:-left-24"
                  } hidden sm:block`}
                >
                  <motion.div
                    animate={{ x: [-5, 5, -5], y: [-5, 5, -5] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      times: [0, 0.5, 1],
                    }}
                  >
                    <Search size={isMobile ? 40 : 50} className="text-birtu" strokeWidth={1.5} />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.8, 0.2] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        times: [0, 0.5, 1],
                      }}
                      className="absolute -right-2 -top-2 md:-right-4 md:-top-4"
                    >
                      <Sparkles size={isMobile ? 16 : 24} className="text-oren" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lost Items */}
            <motion.div
              initial={{ opacity: 0, x: -120, y: 50, rotate: -20 }}
              animate={{
                opacity: 1,
                x: isMobile ? -60 : -120,
                y: 50,
                rotate: -20,
              }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute md:-left-24 -left-12 top-20 hidden sm:block"
            >
              <Shirt size={isMobile ? 40 : 54} className="text-oren" strokeWidth={1.5} />
            </motion.div>

            {/* Water Droplets */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                delay: 0.8,
                duration: 2.5,
                repeat: Infinity,
                times: [0, 0.5, 1],
              }}
              className={`absolute ${isMobile ? "top-1 right-20" : "-top-8 left-10"} hidden sm:block`}
            >
              <Droplets size={isMobile ? 30 : 40} className="text-birmud" strokeWidth={1.5} />
            </motion.div>

            {/* 404 Text Animation with enhanced styling */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center items-center"
            >
              {errorText.split("").map((letter, index) => (
                <motion.div key={index} variants={letterVariants} className="relative mx-1 md:mx-2">
                  <span
                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-oren"
                    style={{
                      textShadow: "3px 3px 6px rgba(0, 0, 0, 0.15)",
                      display: "inline-block",
                      filter: "drop-shadow(0 10px 10px rgba(229, 132, 63, 0.3))",
                    }}
                  >
                    {letter}
                  </span>
                  {/* Reflection effect */}
                  <span
                    className="absolute top-full left-0 text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-oren opacity-20"
                    style={{
                      transform: "rotateX(180deg) translateY(97%)",
                      maskImage: "linear-gradient(transparent 40%, white)",
                      WebkitMaskImage: "linear-gradient(transparent 40%, white)",
                    }}
                  >
                    {letter}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* wash.io Text with enhanced styling */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex justify-center items-center mt-2"
            >
              {washText.split("").map((letter, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.2, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
                    index < 4 ? "text-birtu" : "text-oren"
                  }`}
                  style={{
                    filter:
                      index < 4
                        ? "drop-shadow(0 2px 3px rgba(115, 165, 168, 0.4))"
                        : "drop-shadow(0 2px 3px rgba(229, 132, 63, 0.4))",
                    cursor: "default",
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
          </div>
          {/* Alert Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-10 sm:mt-16 mb-6 sm:mb-10 flex flex-col items-center"
          >
            <div className="flex items-center justify-center mb-2 sm:mb-4">
              <AlertTriangle size={isMobile ? 24 : 28} className="text-oren mr-2" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-birtu">Page Not Found</h2>
            </div>
            <p className="text-gray-600 max-w-lg mx-auto text-center text-base sm:text-lg px-4">
              Oops! It seems this item got lost in our laundry system. The page you&apos;re looking for might
              have been misplaced or no longer exists.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex justify-center mt-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-birtu to-[#66979A] text-putih hover:from-oren hover:to-[#D67938] transition-all duration-300 font-medium shadow-lg shadow-birtu/20 hover:shadow-oren/20"
            >
              <Home size={18} />
              <span className="text-base sm:text-lg">Return to Home</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
