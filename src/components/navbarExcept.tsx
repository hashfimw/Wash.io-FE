"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobileNavbar from "./mobile/mobileNavbar";
import DesktopNavbar from "./desktop/desktopNavbar";

// Path yang tidak menampilkan navbar
const excludePaths = ["/outlet-admin", "/super-admin"];

// Definisi pola rute yang valid dengan regex
const validPathPatterns = [
  /^\/$/, // Halaman utama
  /^\/about\/?$/, // Halaman about
  /^\/contact\/?$/, // Halaman contact
  /^\/outlets\/?$/, // Halaman outlets
  /^\/orders\/?$/, // Halaman orders
  /^\/new-order\/?$/, // Halaman orders
  /^\/payment\/?$/, // Halaman orders
  /^\/forgot-password\/?$/, // Halaman orders
  /^\/register\/?$/, // Halaman register
  /^\/login\/?$/, // Halaman login
  /^\/driver\/?$/, // Halaman shop
  /^\/(\/.*)?$/, // Halaman products dan sub-path nya
  /^\/blog(\/.*)?$/, // Halaman blog dan sub-path nya
  /^\/outlet-admin(\/.*)?$/, // Path admin (sudah ditangani oleh excludePaths)
  /^\/super-admin(\/.*)?$/,
  // Path super admin (sudah ditangani oleh excludePaths)
  // Tambahkan pola lain sesuai kebutuhan
];

export default function NavbarExcept() {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname() || "";

  // Cek apakah path saat ini dimulai dengan salah satu excludePaths
  const isExcludedPath = excludePaths.some((path) => pathname.startsWith(path));

  // Cek apakah path saat ini cocok dengan salah satu pola valid
  const isValidPath = validPathPatterns.some((pattern) =>
    pattern.test(pathname)
  );

  // Sembunyikan navbar jika path dikecualikan atau tidak valid (kemungkinan 404)
  const shouldHideNavbar = isExcludedPath || !isValidPath;

  useEffect(() => {
    // Periksa apakah berjalan di browser sebelum menggunakan window
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Jika saat ini berada di halaman yang seharusnya disembunyikan navbar
  if (shouldHideNavbar) {
    return null;
  }

  // Tampilkan navbar sesuai dengan ukuran layar
  return <div>{isMobile ? <MobileNavbar /> : <DesktopNavbar />}</div>;
}
