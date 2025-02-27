// HOCs/RoleGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/api/auth/useAdminAuth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
        // Check if user is already loaded
        if (user) {
          if (allowedRoles.includes(user.role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            showUnauthorizedToast(user.role);
            redirectBasedOnRole(user.role);
          }
        } else {
          // Try to get the current user
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
            redirectBasedOnRole(currentUser.role);
          }
        }
      } catch (error) {
        console.error("Error in RoleGuard:", error);
        setIsAuthorized(false);
        router.push("/login-admin");
      }
    };

    checkUserRole();
  }, [user, pathname]);

  const showUnauthorizedToast = (role: string) => {
    toast({
      variant: "destructive",
      title: "Akses Ditolak",
      description: `Anda tidak memiliki akses ke halaman ini sebagai ${role}.`,
    });
  };

  const redirectBasedOnRole = (role: string) => {
    const rolePathParam =
      role === "SUPER_ADMIN" ? "super-admin" : "outlet-admin";
    router.push(`/dashboard/${rolePathParam}`);
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
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
};

export const SuperAdminGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <RoleGuard allowedRoles={["SUPER_ADMIN"]}>{children}</RoleGuard>;
};

export const OutletAdminGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <RoleGuard allowedRoles={["OUTLET_ADMIN"]}>{children}</RoleGuard>;
};

// You can also create an AdminGuard that allows both roles
export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN", "OUTLET_ADMIN"]}>
      {children}
    </RoleGuard>
  );
};
