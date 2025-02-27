"use client";

import React from "react";
import { motion } from "framer-motion";

interface LightBeamProps {
  opacity?: number;
  maxWidth?: string;
}

const LightBeam: React.FC<LightBeamProps> = ({
  opacity = 0.3,
  maxWidth = "md",
}) => {
  return (
    <motion.div
      initial={{ opacity: opacity }} // Mulai langsung dengan opacity yang diinginkan
      animate={{ opacity: [opacity, opacity / 2, opacity] }} // Berpulsa antara nilai opacity
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
        times: [0, 0.5, 1],
        delay: 0, // Tidak ada delay
      }}
      className={`absolute top-0 left-1/2 w-full max-w-${maxWidth} h-screen`}
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
        transform: "translateX(-50%)",
        zIndex: 1,
      }}
    />
  );
};

export default LightBeam;
