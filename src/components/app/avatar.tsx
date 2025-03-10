"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";
import { LogOut, ShoppingCartIcon, UserRoundPen } from "lucide-react";

export default function Avatar() {
  const { isAuth, user, logout, updateSessionUser } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // Update local avatar state when user changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user?.avatar]);

  // Check for updated avatar in localStorage on mount and focus
  useEffect(() => {
    const checkForUpdatedAvatar = () => {
      try {
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          if (userData.avatar && userData.avatar !== avatarUrl) {
            setAvatarUrl(userData.avatar);
            // Update session user if needed
            if (updateSessionUser) {
              updateSessionUser(userData);
            }
          }
        }
      } catch (error) {
        console.error("Error checking for updated avatar:", error);
      }
    };

    // Check on mount
    checkForUpdatedAvatar();

    // Check when window gets focus (user comes back from another tab/page)
    window.addEventListener('focus', checkForUpdatedAvatar);
    
    return () => {
      window.removeEventListener('focus', checkForUpdatedAvatar);
    };
  }, [avatarUrl, updateSessionUser]);

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

  // Debug user setelah login Google
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
      router.push("/login");
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
              src={avatarUrl || user.avatar || "/default-user-avatar.png"}
              alt="User Avatar"
              fill
              className="rounded-full border-2 border-gray-900 object-cover"
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
          className="absolute top-full right-0 w-[350px] lg:w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-md z-50"
        >
          {/* Mobile: Semua menu tersedia */}
          <ul className="py-2 lg:hidden">
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-oren"
              >
                Home
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/outlets")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-oren"
              >
                Outlets
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/about")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-oren"
              >
                About
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/contact")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-oren"
              >
                Contact
              </button>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={() => navigateTo("/profile")}
                className="block w-full text-center px-4 py-2 text-sm text-black hover:text-oren"
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
            <li className="px-4 py-2">
              <button
                onClick={() => navigateTo("/profile")}
                className="flex items-center w-full text-sm text-black hover:text-oren"
              >
                <UserRoundPen className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </button>
            </li>
            <li className="px-4 py-2">
              <button
                onClick={() => navigateTo("/orders")}
                className="flex items-center w-full text-sm text-black hover:text-oren"
              >
                <ShoppingCartIcon className="mr-2 h-4 w-4" />
                <span>Orders</span>
              </button>
            </li>
            <hr className="my-2 border-t" />
            <li className="px-4 py-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center w-full text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <span>{isLoggingOut ? "Logging Out..." : "Logout"}</span>
                <LogOut className="ml-2 h-4 w-4" />
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}