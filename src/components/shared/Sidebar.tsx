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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";

interface SidebarProps {
  role: "SUPER_ADMIN" | "OUTLET_ADMIN";
}

interface MenuItem {
  title: string;
  path: string;
  submenu?: MenuItem[];
  icon?: React.ReactNode;
  isExpanded?: boolean;
}

// Define menu configurations
const MENU_CONFIG = {
  SUPER_ADMIN: [
    {
      title: "Overview",
      path: "/super-admin/dashboard",
      icon: <FileChartColumnIncreasing size={20} />,
    },
    {
      title: "Outlets",
      path: "/super-admin/outlets",
      icon: <Store size={20} />,
    },
    {
      title: "Employees",
      path: "/super-admin/employees",
      icon: <BriefcaseBusiness size={20} />,
    },
    {
      title: "Customers",
      path: "/super-admin/customers",
      icon: <UsersRound size={20} />,
    },
    {
      title: "Orders",
      path: "",
      icon: <TableOfContents size={20} />,
      submenu: [
        {
          title: "List Orders & Tracking",
          path: "/super-admin/orders",
          icon: <ShoppingBag size={20} />,
        },
        {
          title: "Process Orders",
          path: "/super-admin/orders/process",
          icon: <ShoppingBasket size={20} />,
        },
      ],
    },
    {
      title: "Bypass Requests",
      path: "/super-admin/bypass",
      icon: <GitPullRequest size={20} />,
    },
    {
      title: "Reports",
      path: "/super-admin/reports",
      icon: <ChartColumn size={20} />,
    },
    {
      title: "Laundry Item",
      path: "/super-admin/laundry-item",
      icon: <Shirt size={20} />,
    },
    {
      title: "Attendances",
      path: "/super-admin/attendances",
      icon: <ClipboardCheck size={20} />,
    },
  ],
  OUTLET_ADMIN: [
    {
      title: "Overview",
      path: "/outlet-admin/dashboard",
      icon: <FileChartColumnIncreasing size={20} />,
    },
    {
      title: "Orders",
      path: "",
      icon: <TableOfContents size={20} />,
      submenu: [
        {
          title: "List Orders & Tracking",
          path: "/outlet-admin/orders",
          icon: <ShoppingBag size={20} />,
        },
        {
          title: "Process Orders",
          path: "/outlet-admin/orders/process",
          icon: <ShoppingBasket size={20} />,
        },
      ],
    },
    {
      title: "Bypass Requests",
      path: "/outlet-admin/bypass",
      icon: <GitPullRequest size={20} />,
    },
    {
      title: "Reports",
      path: "/outlet-admin/reports",
      icon: <ChartColumn size={20} />,
    },
    {
      title: "Attendances",
      path: "/outlet-admin/attendances",
      icon: <ClipboardCheck size={20} />,
    },
  ],
};

export const SidebarContent = ({ role }: SidebarProps) => {
  const pathname = usePathname();

  // Use useMemo to prevent unnecessary re-renders
  const initialMenuItems = useMemo(() => {
    const items = MENU_CONFIG[role] || [];
    return items.map((item) => ({
      ...item,
      isExpanded: item.submenu ? false : undefined,
    }));
  }, [role]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);

  const toggleSubmenu = (index: number) => {
    setMenuItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
  };

  const isActive = (path: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="space-y-4">
      <div className="px-6 py-5">
        <h2 className="justify-center items-center flex mb-2 px-2 text-lg font-semibold">
          Washio Laundry
        </h2>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item, index) => (
          <div key={item.path || index}>
            {item.submenu ? (
              <div className="space-y-1">
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => toggleSubmenu(index)}
                >
                  <span className="flex items-center">
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.title}
                  </span>
                  {item.isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </Button>

                {item.isExpanded && (
                  <div className="ml-4 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Button
                        key={subItem.path}
                        asChild
                        variant={
                          pathname === subItem.path ? "secondary" : "ghost"
                        }
                        className="w-full justify-start pl-6 text-sm"
                      >
                        <Link href={subItem.path}>
                          {subItem.icon && (
                            <span className="mr-2">{subItem.icon}</span>
                          )}
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
                className="w-full justify-start"
              >
                <Link href={item.path}>
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.title}
                </Link>
              </Button>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export const Sidebar = ({ role }: SidebarProps) => {
  return (
    <aside className="hidden h-[100%] w-64 border-r lg:block rounded-r-2xl bg-birmud shadow-xl">
      <SidebarContent role={role} />
    </aside>
  );
};
