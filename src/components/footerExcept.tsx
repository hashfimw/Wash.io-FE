"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/app/footer";

// Path yang tidak menampilkan footer
const excludePaths = ["/outlet-admin", "/super-admin", "/dashboard"];

// Definisi pola rute yang valid dengan regex
const validPathPatterns = [
  /^\/$/, // Halaman utama
  /^\/about\/?$/, // Halaman about
  /^\/contact\/?$/, // Halaman contact
  /^\/outlets\/?$/, // Halaman outlets
  /^\/orders\/?$/, // Halaman orders
  /^\/new-order\/?$/, // Halaman create order
  /^\/payment\/?$/, // Halaman payment
  /^\/register\/?$/, // Halaman register
  /^\/login\/?$/, // Halaman login
  /^\/shop\/?$/, // Halaman shop
  /^\/products(\/.*)?$/, // Halaman products dan sub-path nya
  /^\/blog(\/.*)?$/, // Halaman blog dan sub-path nya
  /^\/outlet-admin(\/.*)?$/, // Path admin (sudah ditangani oleh excludePaths)
  /^\/super-admin(\/.*)?$/, // Path super admin (sudah ditangani oleh excludePaths)
  // Tambahkan pola lain sesuai kebutuhan
];

export default function FooterExcept() {
  const pathname = usePathname() || "";

  // Cek apakah path saat ini dimulai dengan salah satu excludePaths
  const isExcludedPath = excludePaths.some((path) => pathname.startsWith(path));

  // Cek apakah path saat ini cocok dengan salah satu pola valid
  const isValidPath = validPathPatterns.some((pattern) =>
    pattern.test(pathname)
  );

  const shouldHideFooter = isExcludedPath || !isValidPath;
  if (shouldHideFooter) {
    return null;
  }
  return <Footer />;
}
