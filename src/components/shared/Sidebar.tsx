// src/components/shared/Sidebar.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Store,
  ChevronDown,
  ChevronRight,
  BriefcaseBusiness,
  UsersRound,
  ShoppingBag,
  GitPullRequest,
  ChartColumn,
  TableOfContents,
  Shirt,
  ShoppingBasket,
  ClipboardCheck,
  FileChartColumnIncreasing,
  Sparkles,
  Bike,
  RotateCw,
  History,
  WashingMachine,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

interface SidebarProps {
  role: "SUPER_ADMIN" | "OUTLET_ADMIN" | "DRIVER" | "WORKER";
  isMobile?: boolean;
}

interface MenuItem {
  title: string;
  path: string;
  submenu?: MenuItem[];
  icon?: React.ReactNode;
  isExpanded?: boolean;
}

// Function to generate menu configurations
const generateMenuConfig = (roleParam: string): MenuItem[] => {
  // Common items for both roles
  const outletAdminItems: MenuItem[] = [
    {
      title: "Overview",
      path: `/dashboard/${roleParam}`,
      icon: <FileChartColumnIncreasing size={20} />,
    },
    {
      title: "Orders",
      path: "",
      icon: <TableOfContents size={20} />,
      submenu: [
        {
          title: "List Orders & Tracking",
          path: `/dashboard/${roleParam}/orders`,
          icon: <ShoppingBag size={20} />,
        },
        {
          title: "Process Orders",
          path: `/dashboard/${roleParam}/orders/process`,
          icon: <ShoppingBasket size={20} />,
        },
      ],
    },
    {
      title: "Bypass Requests",
      path: `/dashboard/${roleParam}/bypass`,
      icon: <GitPullRequest size={20} />,
    },
    {
      title: "Reports",
      path: `/dashboard/${roleParam}/reports`,
      icon: <ChartColumn size={20} />,
    },
    {
      title: "Attendances",
      path: `/dashboard/${roleParam}/attendances`,
      icon: <ClipboardCheck size={20} />,
    },
  ];

  // Super admin specific items
  const superAdminItems: MenuItem[] = [
    {
      title: "Outlets",
      path: `/dashboard/${roleParam}/outlets`,
      icon: <Store size={20} />,
    },
    {
      title: "Employees",
      path: `/dashboard/${roleParam}/employees`,
      icon: <BriefcaseBusiness size={20} />,
    },
    {
      title: "Customers",
      path: `/dashboard/${roleParam}/customers`,
      icon: <UsersRound size={20} />,
    },
    {
      title: "Laundry Item",
      path: `/dashboard/${roleParam}/laundry-item`,
      icon: <Shirt size={20} />,
    },
  ];

  const driverItems: MenuItem[] = [
    {
      title: "Attendances",
      path: `/employee-dashboard/${roleParam}/attendances`,
      icon: <ClipboardCheck size={20} />,
    },
    {
      title: "Transport Jobs",
      path: "",
      icon: <Bike size={20} />,
      submenu: [
        {
          title: "Ongoing Job",
          path: `/employee-dashboard/${roleParam}/ongoing`,
          icon: <RotateCw size={20} />,
        },
        {
          title: "Requests",
          path: `/employee-dashboard/${roleParam}/requests`,
          icon: <TableOfContents size={20} />,
        },
      ],
    },
    {
      title: "Job history",
      path: `/employee-dashboard/${roleParam}/history`,
      icon: <History size={20} />,
    },
  ];

  const workerItems: MenuItem[] = [
    {
      title: "Attendances",
      path: `/employee-dashboard/${roleParam}/attendances`,
      icon: <ClipboardCheck size={20} />,
    },
    {
      title: "Laundry Jobs",
      path: "",
      icon: <WashingMachine size={20} />,
      submenu: [
        {
          title: "Ongoing Job",
          path: `/employee-dashboard/${roleParam}/ongoing`,
          icon: <RotateCw size={20} />,
        },
        {
          title: "Requests",
          path: `/employee-dashboard/${roleParam}/requests`,
          icon: <TableOfContents size={20} />,
        },
      ],
    },
    {
      title: "Job history",
      path: `/employee-dashboard/${roleParam}/history`,
      icon: <History size={20} />,
    },
  ];

  // Convert component role to URL parameter

  return roleParam === "super-admin"
    ? [
        ...outletAdminItems.slice(0, 1),
        ...superAdminItems,
        ...outletAdminItems.slice(1),
      ]
    : roleParam === "outlet-admin"
    ? outletAdminItems
    : roleParam === "driver"
    ? driverItems
    : workerItems;
};

// Map component role formats to URL parameters
const roleToParam = {
  SUPER_ADMIN: "super-admin",
  OUTLET_ADMIN: "outlet-admin",
  DRIVER: "driver",
  WORKER: "worker",
};

export const SidebarContent = ({ role, isMobile = false }: SidebarProps) => {
  const pathname = usePathname();

  // Convert component role to URL parameter
  const roleParam = roleToParam[role];

  // Generate menu based on role parameter
  const menuItems = useMemo(() => {
    const items = generateMenuConfig(roleParam);
    return items.map((item) => ({
      ...item,
      isExpanded: item.submenu
        ? item.submenu.some((sub) => pathname.includes(sub.path))
        : undefined,
    }));
  }, [roleParam, pathname]);

  const [expandedItems, setExpandedItems] = useState<MenuItem[]>(menuItems);

  // Update menu items when role or pathname changes
  useEffect(() => {
    setExpandedItems(menuItems);
  }, [menuItems]);

  const toggleSubmenu = (index: number) => {
    setExpandedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  };
  const isActive = (path: string) => {
    if (!path) return false;

    // Normalisasi path dengan menghapus trailing slash
    const normalizedPathname = pathname.replace(/\/$/, "");
    const normalizedPath = path.replace(/\/$/, "");

    // Kasus khusus untuk Overview
    if (
      normalizedPath.startsWith("/dashboard/") &&
      normalizedPath.split("/").length === 3
    ) {
      return normalizedPathname === normalizedPath;
    }

    return (
      normalizedPathname === normalizedPath ||
      (normalizedPath !== "" &&
        normalizedPathname.startsWith(`${normalizedPath}/`))
    );
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Glass effect background overlay - dihilangkan backdrop-blur untuk mobile */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-putbir via-transparent to-birmud/20 ${
          !isMobile && "backdrop-blur-[2px]"
        } z-0`}
      ></div>

      {/* Dynamic bubble animations - disembunyikan pada mobile */}
      {!isMobile && (
        <>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-oren/10 blur-xl"></div>
          <div className="absolute bottom-20 left-0 w-40 h-40 rounded-full bg-birtu/5 blur-xl"></div>
        </>
      )}

      {/* Top decorative design */}
      <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden z-0">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-birmud/70 to-transparent"></div>
        <svg
          className="absolute top-0 opacity-30"
          width="100%"
          height="100"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 C100,20 200,80 400,30 L400,0 L0,0 Z"
            className="fill-birtu"
          />
          <path
            d="M0,30 C100,60 280,10 400,40 L400,0 L0,0 Z"
            className="fill-oren opacity-20"
          />
        </svg>
      </div>

      {/* Bottom decorative design */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden z-0">
        <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-birmud/40 to-transparent"></div>
        <svg
          className="absolute bottom-0 opacity-20"
          width="100%"
          height="150"
          viewBox="0 0 400 150"
          preserveAspectRatio="none"
        >
          <path
            d="M0,150 C100,50 300,120 400,50 L400,150 L0,150 Z"
            className="fill-birtu"
          />
          <path
            d="M0,150 C150,100 250,130 400,80 L400,150 L0,150 Z"
            className="fill-oren opacity-20"
          />
        </svg>
      </div>

      {/* Logo section with incorporated image - dihilangkan backdrop-blur untuk mobile */}
      <div className="relative px-4 py-6 z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-xl shadow-lg bg-gradient-to-r from-birmud/30 to-birmud p-1.5">
            <div
              className={`bg-putbir/90 ${
                !isMobile && "backdrop-blur-sm"
              } p-3 rounded-lg flex items-center justify-center`}
            >
              <Image
                src="/washio-oren.png"
                alt="Washio Logo"
                width={38}
                height={38}
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex items-center mt-3">
            <h2 className="text-xl font-bold text-oren tracking-wide">
              <span className="text-birtu">Wash</span>
              <span className="text-oren">.io</span>
            </h2>
          </div>
          <h3 className="text-sm font-medium tracking-wide text-birtu/80">
            Laundry
          </h3>

          <div
            className="mt-3 w-32 h-0.5 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(204,245,245,0) 0%, rgba(115,165,168,1) 50%, rgba(229,132,63,1) 75%, rgba(229,132,63,0) 100%)",
            }}
          ></div>
        </div>
      </div>

      {/* Sparkles effect - disembunyikan pada mobile */}
      {!isMobile && (
        <>
          <div className="absolute top-16 right-8 z-5 opacity-60">
            <Sparkles size={16} className="text-oren animate-pulse" />
          </div>
          <div className="absolute top-24 left-6 z-5 opacity-40">
            <Sparkles
              size={12}
              className="text-birtu animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </>
      )}

      {/* Navigation with enhanced styling */}
      <nav className="relative space-y-0.5 px-3 flex-grow z-10 pb-6 mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-birtu/20 scrollbar-track-transparent">
        {expandedItems.map((item, index) => (
          <div key={item.path || index} className="group">
            {item.submenu ? (
              <div className="mb-1">
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`w-full justify-between transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-birmud to-transparent text-birtu font-medium shadow-md"
                      : "hover:bg-birmud/40 hover:translate-x-1"
                  } rounded-lg`}
                  onClick={() => toggleSubmenu(index)}
                >
                  <span className="flex items-center">
                    <span
                      className={`mr-3 p-1.5 rounded-md transition-colors duration-300 ${
                        isActive(item.path)
                          ? "bg-birtu/10 text-oren"
                          : "text-birtu bg-birmud/30 group-hover:bg-birtu/10 group-hover:text-oren"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.title}
                  </span>
                  <span
                    className={`transition-transform duration-300 ${
                      item.isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </Button>

                {item.isExpanded && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-birmud/50 pl-3">
                    {item.submenu.map((subItem) => (
                      <Button
                        key={subItem.path}
                        asChild
                        variant={
                          pathname === subItem.path ? "secondary" : "ghost"
                        }
                        className={`w-full justify-start pl-4 text-sm transition-all duration-300 ${
                          pathname === subItem.path
                            ? "bg-birmud/50 text-birtu font-medium"
                            : "hover:bg-birmud/30 hover:translate-x-1"
                        } rounded-lg`}
                      >
                        <Link href={subItem.path} className="flex items-center">
                          <span
                            className={`mr-2 transition-colors duration-300 ${
                              pathname === subItem.path
                                ? "text-oren"
                                : "text-birtu group-hover:text-oren"
                            }`}
                          >
                            {subItem.icon}
                          </span>
                          {subItem.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Button
                asChild
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-birmud/70 to-transparent text-birtu font-medium shadow-md"
                    : "hover:bg-birmud/40 hover:translate-x-1"
                } rounded-lg mb-1`}
              >
                <Link href={item.path} className="flex items-center">
                  <span
                    className={`mr-3 p-1.5 rounded-md transition-colors duration-300 ${
                      isActive(item.path)
                        ? "bg-birtu/10 text-oren"
                        : "text-birtu bg-birmud/30 group-hover:bg-birtu/10 group-hover:text-oren"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.title}
                </Link>
              </Button>
            )}
          </div>
        ))}
      </nav>

      {/* Version info */}
      <div className="relative px-4 py-2 mt-auto z-10 opacity-70">
        <div className="text-xs text-center text-birtu/60">Washio v1.0</div>
      </div>
    </div>
  );
};

export const Sidebar = ({ role }: SidebarProps) => {
  return (
    <aside className="hidden h-[100%] w-72 border-r lg:block rounded-r-2xl bg-white/70 shadow-xl overflow-hidden relative">
      <SidebarContent role={role} />
    </aside>
  );
};
