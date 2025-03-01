"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/api/auth/useEmployeeAuth";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { user, loading, getCurrentUser, logout } = useAuth();
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
            // Hapus token jika role tidak sesuai
            logout();
            // Redirect ke halaman login
            router.push("/login-employee");
            return;
          }
        } else {
          const currentUser = await getCurrentUser();

          if (!currentUser) {
            setIsAuthorized(false);
            router.push("/login-employee");
            return;
          }

          if (allowedRoles.includes(currentUser.role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            showUnauthorizedToast(currentUser.role);
            // Hapus token jika role tidak sesuai
            logout();
            // Redirect ke halaman login
            router.push("/login-employee");
            return;
          }
        }
      } catch (error) {
        console.error("Error in RoleGuard:", error);
        setIsAuthorized(false);
        // Hapus token jika terjadi error
        logout();
        router.push("/login-employee");
      }
    };

    checkUserRole();
  }, [user, pathname]);

  const showUnauthorizedToast = (role: string) => {
    toast({
      variant: "destructive",
      title: "Unauthorized Access",
      description: `You do not have access to this page as ${role}. Your session has been terminated for security reasons.`,
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

export const DriverGuard = ({ children }: { children: React.ReactNode }) => {
  return <RoleGuard allowedRoles={["DRIVER"]}>{children}</RoleGuard>;
};

export const WorkerGuard = ({ children }: { children: React.ReactNode }) => {
  return <RoleGuard allowedRoles={["WORKER"]}>{children}</RoleGuard>;
};

export const EmployeeGuard = ({ children }: { children: React.ReactNode }) => {
  return <RoleGuard allowedRoles={["DRIVER", "WORKER"]}>{children}</RoleGuard>;
};
