"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";
import { LogOut, ShoppingCartIcon, UserRoundPen, Menu, Home, MapPin, Info, Mail } from "lucide-react";

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

  // Menu items shared between mobile and desktop
  const commonMenuItems = [
    { label: "Profile", icon: <UserRoundPen size={16} />, path: "/profile" },
    { label: "Orders", icon: <ShoppingCartIcon size={16} />, path: "/orders" },
  ];

  // Additional menu items for mobile only
  const mobileOnlyMenuItems = [
    { label: "Home", icon: <Home size={16} />, path: "/" },
    { label: "Outlets", icon: <MapPin size={16} />, path: "/outlets" },
    { label: "About", icon: <Info size={16} />, path: "/about" },
    { label: "Contact", icon: <Mail size={16} />, path: "/contact" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <ToastContainer />

      {/* Avatar Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isDropdownOpen}
        aria-controls="dropdown-menu"
      >
        <div className="w-10 h-10 sm:w-9 sm:h-9 relative">
          <Image
            src={avatarUrl || user.avatar || "/default-user-avatar.png"}
            alt="User Avatar"
            fill
            className="rounded-full border-2 border-gray-900 object-cover"
          />
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-xs font-semibold truncate max-w-[120px]">
            {user.fullName || "CUSTOMER"}
          </span>
          <span className="text-xs truncate max-w-full">{user.email}</span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          id="dropdown-menu"
          className="absolute top-full right-0 w-64 md:w-52 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {/* User info at top of dropdown (only visible on mobile) */}
          <div className="md:hidden px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative flex-shrink-0">
                <Image
                  src={avatarUrl || user.avatar || "/default-user-avatar.png"}
                  alt="User Avatar"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName || "CUSTOMER"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Items */}
          <div className="md:hidden py-1">
            {mobileOnlyMenuItems.map((item, index) => (
              <button
                key={`mobile-${index}`}
                onClick={() => navigateTo(item.path)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="w-5 mr-2 text-gray-500">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-1"></div>
          </div>

          {/* Common Menu Items (both mobile and desktop) */}
          <div className="py-1">
            {commonMenuItems.map((item, index) => (
              <button
                key={`common-${index}`}
                onClick={() => navigateTo(item.path)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="w-5 mr-2 text-gray-500">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout (always visible) */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-between w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <span>{isLoggingOut ? "Logging Out..." : "Logout"}</span>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}