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
import { Menu, User, Settings, LogOut } from "lucide-react";
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
    <div className="relative border-b overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-birtu to-birtu/70 rounded-r-3xl"></div>

      <div className="relative flex h-16 items-center px-4 gap-4 z-10">
        {/* Mobile Sidebar Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="items-center flex justify-center h-16">
              <Button
                variant="ghost"
                className="lg:hidden text-putbir hover:bg-birtu/80 hover:text-white"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 overflow-hidden rounded-r-3xl border-0  shadow-xl"
          >
            <div className="h-full relative rounded-r-3xl overflow-hidden bg-none border-0">
              <SidebarContent role={role} isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Breadcrumb with improved styling */}
        <div className="flex-1">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* User Menu - Improved styling */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full bg-putbir/20 p-0 hover:bg-putbir/30"
            >
              {user.avatar ? (
                <Avatar className="h-9 w-9 border-2 border-putbir/30">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-birtu text-putih text-sm font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-9 w-9 border-2 border-putbir/30">
                  <AvatarFallback className="bg-gradient-to-br from-birtu to-oren/80 text-putih text-sm font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-oren border-2 border-birtu"></span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <User size={16} className="text-birtu" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Settings size={16} className="text-birtu" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-oren cursor-pointer"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
