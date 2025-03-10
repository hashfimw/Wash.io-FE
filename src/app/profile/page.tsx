"use client"

import ProfilePage from "@/components/app/profile/profile";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Loading from "../loading";

export default function Profile() {
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
            <ProfilePage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

