"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";

export default function Avatar() {
  const { isAuth, user, logout } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Perbaikan: Debug user setelah login Google
  useEffect(() => {
    console.log("🔹 Avatar component - User data:", user);
  }, [user]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    toast.success("You have been logged out successfully.", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });

    logout();

    setTimeout(() => {
      router.push("/login"); // 🔥 Gunakan router.push() agar tidak reload penuh
    }, 1000);
  }, [logout, router]);

  const navigateTo = (path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  if (!isAuth || !user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <ToastContainer />

      {/* Avatar and User Info */}
      <div className="flex space-x-3 items-center">
        <button
          onClick={toggleDropdown}
          className="focus:outline-none"
          aria-expanded={isDropdownOpen}
          aria-controls="dropdown-menu"
        >
          <div className="w-9 h-9 relative">
            <Image
              src={user.avatar || "/default-user-avatar.png"}
              alt="User Avatar"
              layout="fill"
              className="rounded-full border-2 border-teal-700 object-cover"
            />
          </div>
        </button>
        <div className="flex flex-col">
          <h1 className="text-xs hidden md:block font-semibold">
            {user.fullName || "CUSTOMER"}
          </h1>
          <h1 className="text-xs hidden md:block">{user.email}</h1>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          id="dropdown-menu"
          className="absolute top-full right-0 w-[400px] lg:w-52 mt-2 bg-white border border-gray-200 rounded-xl shadow-md z-50"
        >
          {/* Mobile: Semua menu tersedia */}
          <ul className="py-2 lg:hidden">
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-teal-700"
              >
                Home
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/outlets")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-teal-700"
              >
                Outlets
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/about")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-teal-700"
              >
                About
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/contact")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-teal-700"
              >
                Contact
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/user/profile")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-teal-700"
              >
                Profile
              </button>
            </li>
            <hr className="my-2 border-t" />
            <li className="flex items-center justify-center">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-center px-4 py-2 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {isLoggingOut ? "Logging Out..." : "Logout"}
              </button>
            </li>
          </ul>

          {/* Desktop: Hanya Profile & Logout */}
          <ul className="py-2 hidden lg:block">
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/user/profile")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-teal-700"
              >
                Profile
              </button>
            </li>
            <hr className="my-2 border-t" />
            <li className="flex items-center justify-center">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-center px-4 py-2 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {isLoggingOut ? "Logging Out..." : "Logout"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
