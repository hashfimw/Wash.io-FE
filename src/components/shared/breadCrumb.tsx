import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const params = useParams();
  const role = params.role as string;
  const admin = !!(role === "super-admin" || role === "outlet-admin");

  const homeLink = admin ? `/dashboard/${role}` : `/employee-dashboard/${role}`;

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

  const lastItem = items.length > 0 ? items[items.length - 1] : null;

  return (
    <nav className="flex items-center text-sm overflow-hidden max-w-full">
      <Link
        href={homeLink}
        className="flex-shrink-0 flex items-center text-slate-800 hover:text-putih transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {!isMobile &&
        items.map((item) => (
          <div key={item.label} className="flex items-center min-w-0">
            <ChevronRight className="h-4 w-4 text-slate-800 flex-shrink-0 mx-1" />

            {item.href ? (
              <Link
                href={item.href}
                className="text-slate-800 hover:text-putih transition-colors font-medium truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800 hover:text-putih font-medium truncate">{item.label}</span>
            )}
          </div>
        ))}

      {isMobile && lastItem && (
        <div className="flex items-center min-w-0">
          <ChevronRight className="h-4 w-4 text-slate-800 flex-shrink-0 mx-1" />

          {lastItem.href ? (
            <Link
              href={lastItem.href}
              className="text-slate-800 hover:text-putih transition-colors font-medium truncate max-w-[200px]"
            >
              {lastItem.label}
            </Link>
          ) : (
            <span className="text-slate-800 hover:text-putih font-medium truncate max-w-[200px]">
              {lastItem.label}
            </span>
          )}
        </div>
      )}
    </nav>
  );
};
