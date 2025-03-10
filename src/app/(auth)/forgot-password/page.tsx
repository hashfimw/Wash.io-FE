"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import ForgotPassword from "@/components/auth/forgotPassword";
import Loading from "@/app/loading";

export default function ForgotPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for a minimum of 5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto max-w-full min-h-dvh">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Loading />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ForgotPassword />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
