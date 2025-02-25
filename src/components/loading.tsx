"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shirt, WashingMachine, Droplets } from "lucide-react";

const Loading = () => {
  const colors = {
    biruMuda: "#CCF5F5",
    biruTua: "#73A5A8",
    oren: "#E5843F",
    putih: "#FCFCFC",
    putihBiru: "#EEFDFF",
  };

  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFullContent(true);
    }, 5000);

    return () => clearTimeout(timer);
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

  const bubbleVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: [0, 1.2, 1],
      transition: {
        duration: 1.2,
        times: [0, 0.8, 1],
      },
    },
  };

  // Main title and subtitle
  const washText = "Wash.io";
  const tagline = "Smart Laundry Solutions";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#EEFDFF] to-[#CCF5F5]">
      <div className="relative">
        {/* Background Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0.05, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#E5843F] opacity-10 blur-2xl" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-[#73A5A8] opacity-10 blur-2xl" />
        </motion.div>

        {/* Washing Machine Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute -top-36 right-0"
        >
          <WashingMachine size={100} color={colors.biruTua} />
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
          }}
          className="absolute -top-32 -left-20"
        >
          <Shirt size={64} color={colors.oren} />
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
          }}
          className="absolute top-0 right-24"
        >
          <Droplets size={42} color={colors.biruMuda} strokeWidth={1.5} />
        </motion.div>

        {/* Bubbles */}
        <div className="absolute -top-20 left-0 right-0 flex justify-around">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              variants={bubbleVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.3 }}
              style={{
                width: `${15 + Math.random() * 25}px`,
                height: `${15 + Math.random() * 25}px`,
                borderRadius: "50%",
                background: `rgba(204, 245, 245, ${0.5 + Math.random() * 0.5})`,
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                position: "absolute",
                left: `${i * 15}%`,
                top: `${Math.random() * 80}px`,
              }}
            />
          ))}
        </div>

        {/* Main Text Animation - ENLARGED */}
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
              className={`text-8xl font-bold ${
                index < 4 ? "text-[#73A5A8]" : "text-[#E5843F]"
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
          <span className="text-[#73A5A8] text-lg font-medium italic">
            {tagline}
          </span>
        </motion.div>

        {/* Animated Underline */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, delay: 2 }}
          className="h-1.5 bg-gradient-to-r from-[#73A5A8] to-[#E5843F] mt-1 rounded-full"
        />

        {/* Loading Text */}
        <motion.div className="mt-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="text-center text-lg font-medium text-[#73A5A8]"
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
                className="w-3 h-3 rounded-full bg-[#E5843F]"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Loading;
