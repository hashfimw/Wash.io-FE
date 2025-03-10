"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/hooks/api/auth/useAdminAuth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { user, loading, getCurrentUser, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (user) {
          if (allowedRoles.includes(user.role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            showUnauthorizedToast(user.role);
            logout();
            router.push("/login-admin");
            return;
          }
        } else {
          const currentUser = await getCurrentUser();

          if (!currentUser) {
            setIsAuthorized(false);
            router.push("/login-admin");
            return;
          }

          if (allowedRoles.includes(currentUser.role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            showUnauthorizedToast(currentUser.role);
            logout();
            router.push("/login-admin");
            return;
          }
        }
      } catch (error) {
        console.error("Error in RoleGuard:", error);
        setIsAuthorized(false);
        logout();
        router.push("/login-admin");
      }
    };

    checkUserRole();
  }, [user, pathname]);

  const showUnauthorizedToast = (role: string) => {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: `You do not have access to this page as a ${role}. Your session has been terminated for security reasons.`,
      duration: 5000,
    });
  };

  if (loading || isAuthorized === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verification access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => {
  return <RoleGuard allowedRoles={["SUPER_ADMIN"]}>{children}</RoleGuard>;
};

export const OutletAdminGuard = ({ children }: { children: React.ReactNode }) => {
  return <RoleGuard allowedRoles={["OUTLET_ADMIN"]}>{children}</RoleGuard>;
};

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  return <RoleGuard allowedRoles={["SUPER_ADMIN", "OUTLET_ADMIN"]}>{children}</RoleGuard>;
};
