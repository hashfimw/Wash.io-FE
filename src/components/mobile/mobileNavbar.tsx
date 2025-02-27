import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [navbarColor, setNavbarColor] = useState("#E7FAFE");
  const [hasShadow, setHasShadow] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 50) {
        setNavbarColor("#FFFFFF"); // Warna putih
        setHasShadow(true); // Tampilkan shadow
      } else {
        setNavbarColor("#E7FAFE");
        setHasShadow(false); // Hilangkan shadow
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        hasShadow ? "shadow-sm" : ""
      }`}
      style={{ backgroundColor: navbarColor }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 px-8">
        <div className="flex flex-row">
          <Link href={"/"} className="w-[36px] h-[36px] relative bottom-2">
            <Image
              src={"/washio-oren.png"}
              alt="washio-logo"
              layout="fill"
              className="object-cover"
            />
          </Link>
          <Link href={"/"} className="text-xl font-semibold">
            ash<span className="text-orange-500">io</span>
          </Link>
        </div>
        <div
          className="text-gray-700 font-bold hover:cursor-pointer"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <nav className="flex flex-col text-center space-y-4 bg-gray-100 p-6 text-gray-700">
          <Link href={"/"} className="hover:text-orange-500">
            Home
          </Link>
          <Link href={"/"} className="hover:text-orange-500">
            Services
          </Link>
          <Link href={"/"} className="hover:text-orange-500">
            Locations
          </Link>
          <Link href={"/"} className="hover:text-orange-500">
            About
          </Link>
          <Link href={"/"} className="hover:text-orange-500">
            Contact
          </Link>
          <Link href={"/"} className="hover:text-orange-500">
            Sign In
          </Link>
        </nav>
      )}
    </div>
  );
}
