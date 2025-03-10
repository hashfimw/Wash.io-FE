"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type CustomerGuardProps = {
  children: React.ReactNode;
};

export const CustomerGuard = ({ children }: CustomerGuardProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState<boolean>(false);
  const { isAuth, user, loading, checkSession, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Show success toast when customer login is successful
  const showSuccessToast = () => {
    toast({
      title: "Login Successful",
      description: "Welcome back! You've successfully logged in as a Customer.",
      duration: 4000,
    });
    setHasShownSuccessToast(true);
  };

  // Show unauthorized toast when role is not CUSTOMER
  const showUnauthorizedToast = (role: string) => {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: `This page is only accessible to customers`,
      duration: 5000,
    });
  };

  // Force a session check when the component mounts
  useEffect(() => {
    if (!loading && !isAuth) {
      checkSession();
    }
  }, [checkSession, isAuth, loading]);

  // Check if user has proper role when auth state or user data changes
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // If loading, wait for it
        if (loading) return;

        // If not authenticated, redirect to login
        if (!isAuth) {
          setIsAuthorized(false);
          router.push("/login");
          return;
        }

        // If authenticated but no user data, wait for it
        if (!user) return;

        // Check if user is a CUSTOMER
        if (user.role === "CUSTOMER") {
          setIsAuthorized(true);
          // Show success toast only once after successful authentication
          if (!hasShownSuccessToast) {
            showSuccessToast();
          }
        } else {
          setIsAuthorized(false);
          showUnauthorizedToast(user.role);
          // Logout if role is not CUSTOMER
          logout();
          // Redirect to login page
          router.push("/login");
        }
      } catch (error) {
        console.error("Error in CustomerGuard:", error);
        setIsAuthorized(false);
        logout();
        router.push("/login");
      }
    };

    checkUserRole();
  }, [isAuth, user, loading, pathname, router, logout, hasShownSuccessToast]);

  // Show loading state
  if (loading || isAuthorized === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  // Don't render anything if not authorized
  if (!isAuthorized) {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
};
