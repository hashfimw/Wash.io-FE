import React, { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";
import Avatar from "../app/avatar";
import { Menu, X } from "lucide-react";
import MobileLaundrySearchBar from "../app/mobileSearchbar";


export default function MobileNavbar() {
  const { isAuth } = useSession();
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
      <div className="flex justify-between items-center p-4">
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
            ash<span className="text-oren">io</span>
          </Link>
        </div>

        {/* Avatar atau Burger Menu */}
        <div className="text-gray-700 font-bold hover:cursor-pointer flex items-center space-x-4">
          <MobileLaundrySearchBar />
          {isOpen ? (
            <X size={24} onClick={toggleMenu} />
          ) : isAuth ? (
            <Avatar />
          ) : (
            <Menu size={24} onClick={toggleMenu} />
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !isAuth && (
        <nav
          id="dropdown-menu"
          className="absolute top-full right-0 w-full bg-white border border-gray-200 rounded-xl shadow-md z-50"
        >
          <ul className="space-y-4 py-5">
            <li className="flex items-center justify-center">
              <Link href={"/"} className="hover:text-orange-500">
                Home
              </Link>
            </li>
            <li className="flex items-center justify-center">
              <Link href={"/outlets"} className="hover:text-orange-500">
                Outlets
              </Link>
            </li>
            <li className="flex items-center justify-center">
              <Link href={"/about"} className="hover:text-orange-500">
                About
              </Link>
            </li>
            <li className="flex items-center justify-center">
              <Link href={"/contact"} className="hover:text-orange-500">
                Contact
              </Link>
            </li>
            <hr className="my-2 border-t" />
            <li className="flex items-center justify-center">
              <Link href={"/register"} className="hover:text-green-800">
                Sign Up
              </Link>
            </li>
            <li className="flex items-center justify-center">
              <Link href={"/login"} className="hover:text-green-800">
                Sign In
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
