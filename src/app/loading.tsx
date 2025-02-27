"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shirt, WashingMachine, Droplets } from "lucide-react";

// Import reusable animation components
import Bubbles from "@/components/animations/Bubble";
import WavesAnimation from "@/components/animations/Waves";
import LightBeam from "@/components/animations/LightBeam";

const Loading = () => {
  const [showFullContent, setShowFullContent] = useState(false);
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
      setShowFullContent(true);
    }, 5000); // 5 second minimum display time

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
        staggerChildren: 0.4,
        delayChildren: 0.6,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 70,
        duration: 1.2,
      },
    },
  };
  // Main title and subtitle
  const washText = "Wash.io";
  const tagline = "Smart Laundry Solutions";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-putbir to-birmud overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-putbir opacity-40 z-0" />

      {/* Reusable Animation Components */}
      <Bubbles isMobile={isMobile} />
      <WavesAnimation />
      <LightBeam />

      <div className="relative z-10">
        {/* Washing Machine Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            times: [0, 0.33, 0.66, 1],
          }}
          className={`absolute ${
            isMobile ? "-top-20 right-0" : "-top-36 right-0"
          }`}
        >
          <WashingMachine size={isMobile ? 80 : 100} className="text-birtu" />
        </motion.div>

        {/* Shirt Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, y: [0, -10, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
            times: [0, 0.5, 1],
          }}
          className={`absolute ${
            isMobile ? "-top-20 -left-10" : "-top-32 -left-20"
          }`}
        >
          <Shirt size={isMobile ? 50 : 64} className="text-oren" />
        </motion.div>

        {/* Water Droplets */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, y: [0, 5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.8,
            times: [0, 0.5, 1],
          }}
          className="absolute top-0 right-24"
        >
          <Droplets
            size={isMobile ? 32 : 42}
            className="text-birmud"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Main Text Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center items-center"
        >
          {washText.split("").map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className={`text-6xl sm:text-7xl md:text-8xl font-bold ${
                index < 4 ? "text-birtu" : "text-oren"
              }`}
              style={{
                textShadow: "3px 3px 6px rgba(0, 0, 0, 0.15)",
                display: "inline-block",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 1 }}
          className="text-center mt-2 mb-4"
        >
          <span className="text-birtu text-sm sm:text-lg font-medium italic">
            {tagline}
          </span>
        </motion.div>

        {/* Animated Underline */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, delay: 2 }}
          className="h-1.5 bg-gradient-to-r from-birtu to-oren mt-1 rounded-full"
        />

        {/* Loading Text */}
        <motion.div className="mt-6 sm:mt-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="text-center text-base sm:text-lg font-medium text-birtu"
          >
            Loading your fresh laundry experience
          </motion.p>

          {/* Loading Dots */}
          <motion.div className="flex justify-center mt-2 space-x-2">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: dot * 0.3,
                }}
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-oren"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Loading;
