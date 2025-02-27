// src/components/shared/Breadcrumb.tsx
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi viewport mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Tentukan berapa item yang akan ditampilkan dalam mode mobile
  const visibleItems =
    isMobile && items.length > 2 ? [items[0], items[items.length - 1]] : items;

  return (
    <nav className="flex items-center space-x-1 text-sm">
      <Link
        href="/"
        className="flex items-center text-slate-800 hover:text-putih transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {isMobile && items.length > 2 && (
        <div className="flex items-center">
          <ChevronRight className="h-4 w-4 text-slate-800" />
          <span className="ml-1 text-slate-800">...</span>
        </div>
      )}

      {visibleItems.map((item, index) => {
        // Jika dalam mode mobile dan ini adalah item terakhir setelah ellipsis
        const isLastMobileItem = isMobile && items.length > 2 && index === 1;

        return (
          <div key={item.label} className="flex items-center">
            {(!isMobile || index > 0 || items.length <= 2) && (
              <ChevronRight className="h-4 w-4 text-slate-800" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className={`ml-1 hover:text-putih transition-colors ${
                  isLastMobileItem
                    ? "text-slate-800 font-medium"
                    : "text-slate-800 font-medium"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-slate-800 hover:text-putih font-medium">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
