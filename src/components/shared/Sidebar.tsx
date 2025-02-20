// src/components/shared/Sidebar.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, ChevronRight, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

export const SidebarContent = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    role === "SUPER_ADMIN"
      ? [
          { title: "Overview", path: "/super-admin/dashboard" },
          {
            title: "Outlets",
            path: "/super-admin/outlets",
            icon: <Store size={18} />,
          },
          { title: "Employees", path: "/super-admin/employees" },
          { title: "Customers", path: "/super-admin/customers" },
          {
            title: "Orders",
            path: "",
            isExpanded: false,
            submenu: [
              { title: "List Orders & Tracking", path: "/super-admin/orders" },
              { title: "Process Orders", path: "/super-admin/orders/process" },
            ],
          },
          { title: "Bypass Requests", path: "/super-admin/bypass" },
          { title: "Reports", path: "/super-admin/reports" },
          { title: "Laundry Item", path: "/super-admin/laundry-item" },
        ]
      : [
          { title: "Overview", path: "/outlet-admin/dashboard" },
          {
            title: "Orders",
            path: "/outlet-admin/orders",
            isExpanded: false,
            submenu: [
              { title: "All Orders", path: "/outlet-admin/orders" },
              { title: "Manage Orders", path: "/outlet-admin/orders/manage" },
              { title: "Order Items", path: "/outlet-admin/orders/items" },
            ],
          },
          { title: "Bypass Requests", path: "/outlet-admin/bypass" },
          { title: "Reports", path: "/outlet-admin/reports" },
          { title: "Customers", path: "/outlet-admin/customers" },
        ]
  );

  const toggleSubmenu = (index: number) => {
    const updatedMenuItems = [...menuItems];
    updatedMenuItems[index].isExpanded = !updatedMenuItems[index].isExpanded;
    setMenuItems(updatedMenuItems);
  };

  const isActive = (path: string) => {
    // Jika path kosong, jangan anggap sebagai active
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
          <div key={item.path}>
            {item.submenu ? (
              <div className="space-y-1">
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => toggleSubmenu(index)}
                >
                  <span>{item.title}</span>
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
                        <Link href={subItem.path}>{subItem.title}</Link>
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
                <Link href={item.path}>{item.title}</Link>
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
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 border-r lg:block rounded-r-2xl bg-birmud shadow-xl">
        <SidebarContent role={role} />
      </aside>
    </>
  );
};
