"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminAuth } from "@/hooks/api/auth/useAdminAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VerificationModal from "@/components/admin/verficationModal";
import CSSWave from "@/components/animations/Waves";
import BackgroundIcons from "@/components/admin/backgroundLoginAdmin";

function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }

  const secure = process.env.NODE_ENV === "production" ? "; secure" : "";

  document.cookie = name + "=" + (value || "") + expires + "; path=/" + secure + "; samesite=strict";
}

const LoginPage = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showVerificationModal, setShowVerificationModal] = useState(true);

  const { login, loading, error } = useAdminAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const isVerified = localStorage.getItem("adminVerified") === "true";
    const verifiedAt = localStorage.getItem("verifiedAt");

    if (isVerified && verifiedAt) {
      const verificationTime = parseInt(verifiedAt);
      const now = Date.now();
      if (now - verificationTime < 3600000) {
        setShowVerificationModal(false);
      } else {
        localStorage.removeItem("adminVerified");
        localStorage.removeItem("verifiedAt");
      }
    }
  }, []);

  const handleVerified = () => {
    setShowVerificationModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await login(credentials);

      if (response?.data?.user) {
        if (response.data.token) {
          setCookie("token", response.data.token, 1);
        }

        const { role } = response.data.user;
        const rolePathParam = role === "SUPER_ADMIN" ? "super-admin" : "outlet-admin";
        router.push(`dashboard/${rolePathParam}`);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-putbir to-birmud/30">
      <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden z-0">
        <svg
          className="absolute top-0 opacity-20"
          width="100%"
          height="120"
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
        >
          <path d="M0,50 C100,20 200,80 400,30 L400,0 L0,0 Z" className="fill-birtu" />
          <path d="M0,30 C100,60 280,10 400,40 L400,0 L0,0 Z" className="fill-oren opacity-20" />
        </svg>
      </div>
      <BackgroundIcons opacity={0.07} />
      {showVerificationModal && <VerificationModal onVerify={handleVerified} />}
      <Card className="w-full max-w-md mx-4 bg-putih/95 backdrop-blur-sm shadow-xl border-birmud/30 z-10 rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-birtu via-birmud to-oren"></div>
        <CardHeader className="space-y-3 pb-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-birmud to-birmud/50 p-1 w-16 h-16 flex items-center justify-center">
              <div className="rounded-full bg-putih flex items-center justify-center w-full h-full">
                <Image
                  src="/washio-oren.png"
                  alt="Washio Logo"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-birtu mt-2">
            <span className="text-birtu">Wash</span>
            <span className="text-oren">.io</span>
            <span className="text-birtu"> Admin</span>
          </CardTitle>
          <CardDescription className="text-center text-birtu/70">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-3 pr-3 py-2 border-birmud/30 focus:border-birtu focus:ring-birmud bg-putbir/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-3 pr-3 py-2 border-birmud/30 focus:border-birtu focus:ring-birmud bg-putbir/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-birtu to-birtu/90 hover:from-oren hover:to-oren/90 text-putih font-medium transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-xs text-birtu/60 pt-0">
          Wash.io Laundry Management System v1.0
        </CardFooter>
      </Card>
      <CSSWave />
    </div>
  );
};

export default LoginPage;
