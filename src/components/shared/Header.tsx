"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "./breadCrumb";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import { useAuth } from "@/hooks/api/auth/useAdminAuth";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  breadcrumbItems: {
    label: string;
    href?: string;
  }[];
  role: "SUPER_ADMIN" | "OUTLET_ADMIN";
}

export const Header = ({ user, breadcrumbItems, role }: HeaderProps) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="border-b bg-birtu rounded-r-2xl">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile Sidebar Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="items-center flex justify-center h-16">
              <Button variant="ghost" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 rounded-r-2xl">
            <SidebarContent role={role} />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb */}
        <div className="flex-1">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
