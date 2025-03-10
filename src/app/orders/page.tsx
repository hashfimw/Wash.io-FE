"use client"

import OrderList from "@/components/orders/landing-page/ordersPage";
import React, { useEffect, useState } from "react";
import Loading from "../loading";
import { AnimatePresence, motion } from "framer-motion";

export default function Orders() {
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
            <OrderList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
