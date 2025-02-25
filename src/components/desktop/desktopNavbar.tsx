import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function DesktopNavbar() {
  const [navbarColor, setNavbarColor] = useState("#E7FAFE");
  const [isShadow, setIsShadow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 50) {
        setNavbarColor("#FFFFFF");
        setIsShadow(true); // Tampilkan shadow
      } else {
        setNavbarColor("#E7FAFE");
        setIsShadow(false); // Hilangkan shadow
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex justify-between items-center p-6 px-16 transition-colors duration-300 ${
        isShadow ? "shadow-sm" : ""
      }`}
      style={{ backgroundColor: navbarColor }}
    >
      <Link href={"/"} className="text-xl font-bold">
        Wash<span className="text-orange-500">io</span>
      </Link>
      <nav className="space-x-6">
        <a href="#" className="hover:text-orange-500">
          Home
        </a>
        <a href="#" className="hover:text-orange-500">
          Services
        </a>
        <a href="#" className="hover:text-orange-500">
          Locations
        </a>
        <a href="#" className="hover:text-orange-500">
          About
        </a>
        <a href="#" className="hover:text-orange-500">
          Contact
        </a>
      </nav>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
        Sign In
      </Button>
    </nav>
  );
}
