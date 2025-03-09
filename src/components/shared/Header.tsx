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
import { Menu, User, Settings, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import { useAdminAuth } from "@/hooks/api/auth/useAdminAuth";
import { useEffect, useState } from "react";
import NotificationModal from "../notification/NotificationModal";
import { useNotification } from "@/hooks/api/notifications/useNotification";

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
  role: "SUPER_ADMIN" | "OUTLET_ADMIN" | "DRIVER" | "WORKER";
}

export const Header = ({ user, breadcrumbItems, role }: HeaderProps) => {
  const { logout } = useAdminAuth();
  const [isNotificationModalOpen, setNotificaionModalOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { getUnreadCount } = useNotification();

  const fetchUnreadCount = async () => {
    const response = await getUnreadCount();
    setUnreadCount(response.data);
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [isNotificationModalOpen]);

  const handleOpen = () => {
    setNotificaionModalOpen(true);
  };

  const handleClose = () => {
    setNotificaionModalOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative border-b overflow-hidden rounded-r-3xl">
      <div className="absolute inset-0 bg-gradient-to-b from-birtu to-birtu/70 rounded-r-3xl"></div>
      <div className="relative flex h-16 items-center px-4 gap-4 z-10">
        {/* Mobile Sidebar Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="items-center flex justify-center h-16">
              <Button variant="ghost" className="lg:hidden text-putbir hover:bg-birtu/80 hover:text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 overflow-hidden rounded-r-3xl border-0  shadow-xl">
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
            <Button variant="ghost" className="relative size-10 rounded-full bg-putbir/20 p-0 hover:bg-putbir/30">
              {/* <div className={`${unreadCount ? "block" : "hidden"} absolute size-[38px] animate-spin duration-3000 rounded-full bg-gradient-to-r from-oren via-orange-400 to-orange-300`}></div> */}
              <Avatar className="size-9 border-2 border-putbir/30">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} />
                ) : (
                  <AvatarFallback className="bg-birtu text-putih text-sm font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              <span
                className={` ${
                  unreadCount
                    ? "absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-oren border-2 border-birtu animate-pulse duration-1000"
                    : "hidden"
                } `}
              ></span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpen} className="z-0 group relative flex items-center cursor-pointer justify-between">
              <div
                className={`${
                  unreadCount
                    ? "-z-10 left-0 absolute size-full bg-oren/30 rounded-sm pointer-events-none animate-pulse group-hover:animate-none group-hover:bg-oren/50 group-hover:brightness-110 transition"
                    : "hidden"
                }`}
              ></div>
              <div className="flex items-center gap-2">
                <Bell size={16} className={`${unreadCount ? "text-oren" : "text-birtu"}`} />
                <span>Notifications</span>
              </div>
              <div
                className={`${
                  unreadCount
                    ? "bg-oren/85 px-2 text-sm font-semibold rounded-full text-white ring-oren ring-inset ring-2 brightness-105 group-hover:brightness-100 transition pointer-events-none"
                    : "hidden"
                }`}
              >
                {unreadCount}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <User size={16} className="text-birtu" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Settings size={16} className="text-birtu" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-oren cursor-pointer">
              <LogOut size={16} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NotificationModal open={isNotificationModalOpen} onClose={handleClose} />
    </div>
  );
};
