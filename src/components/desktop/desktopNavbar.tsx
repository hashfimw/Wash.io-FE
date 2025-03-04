"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import Avatar from "../app/avatar";
import { useSession } from "@/hooks/useSession";



export default function DesktopNavbar() {
  const { isAuth } = useSession();
  const [navbarColor, setNavbarColor] = useState("#E7FAFE");
  const [isShadow, setIsShadow] = useState(false);

  // Handle Scroll untuk mengubah warna navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setNavbarColor("#FFFFFF");
        setIsShadow(true);
      } else {
        setNavbarColor("#E7FAFE");
        setIsShadow(false);
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
      {/* Logo */}
      <div className="flex flex-row">
        <Link href={"/"} className="w-[36px] h-[36px] relative bottom-2">
          <Image src={"/washio.png"} alt="washio-logo" fill className="object-cover" />
        </Link>
        <Link href={"/"} className="text-xl font-semibold">
          ash<span className="text-orange-500">io</span>
        </Link>
      </div>

      {/* Navigation & Authentication */}
      <div className="flex space-x-5">
        {isAuth ? (
          <Avatar />
        ) : (
          <>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
              <Link href={"/register"}>Sign Up</Link>
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
              <Link href={"/login"}>Sign In</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
