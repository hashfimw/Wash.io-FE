"use client";

import React, { useState, useEffect } from "react";
import MobileNavbar from "../mobile/mobileNavbar";
import DesktopNavbar from "../desktop/desktopNavbar";


export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Periksa apakah berjalan di browser sebelum menggunakan window
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div>{isMobile ? <MobileNavbar /> : <DesktopNavbar />}</div>;
}
