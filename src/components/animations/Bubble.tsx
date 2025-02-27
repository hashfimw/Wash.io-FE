"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

interface BubblesProps {
  count?: number;
  isMobile?: boolean;
}

const Bubbles: React.FC<BubblesProps> = ({ count = 15, isMobile = false }) => {
  const bubbleCount = isMobile ? Math.floor(count / 2) : count;
  const id = useId();

  // Buat array statis untuk posisi gelembung
  // Ini akan konsisten antara server dan client
  const bubbles = Array.from({ length: bubbleCount }, (_, i) => ({
    id: `${id}-bubble-${i}`,
    width: 8 + ((i * 13) % 12),
    height: 8 + ((i * 13) % 12),
    left: 10 + ((i * 6) % 90),
    top: 90 - ((i * 3) % 40),
    delay: i * 0.3,
    colorIndex: i % 3, // Untuk menentukan warna
  }));

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{
            opacity: 0,
            scale: 0,
            y: 50 + bubble.top,
            x: 0,
          }}
          animate={{
            opacity: [0, 0.7, 0],
            scale: [0, 1, 0.5],
            y: [50 + bubble.top, -100],
            x: [0, (bubble.id.charCodeAt(0) % 10) - 5],
          }}
          transition={{
            duration: 3 + (bubble.id.charCodeAt(0) % 3),
            repeat: Infinity,
            repeatType: "loop",
            delay: bubble.delay,
            times: [0, 0.6, 1],
          }}
          className={`absolute rounded-full ${
            bubble.colorIndex === 0
              ? "bg-oren"
              : bubble.colorIndex === 1
              ? "bg-birtu"
              : "bg-birmud"
          }`}
          style={{
            width: `${bubble.width}px`,
            height: `${bubble.height}px`,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            filter: "blur(1px)",
            boxShadow: "0 0 2px rgba(255, 255, 255, 0.5)",
          }}
        />
      ))}
    </div>
  );
};

export default Bubbles;
