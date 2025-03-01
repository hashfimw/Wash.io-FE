// src/components/admin/VerificationModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationModalProps {
  onVerify: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ onVerify }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const expectedCode = process.env.NEXT_PUBLIC_ADMIN_CODE;

  useEffect(() => {
    // Cek localStorage untuk penggunaan sebelumnya
    const storedAttempts = localStorage.getItem("verificationAttempts");
    const timestamp = localStorage.getItem("verificationTimestamp");

    if (storedAttempts && timestamp) {
      const attemptsCount = parseInt(storedAttempts);
      const lastAttemptTime = parseInt(timestamp);
      const now = Date.now();

      // Jika sudah lebih dari 1 menit, reset counter
      if (now - lastAttemptTime > 60000) {
        localStorage.removeItem("verificationAttempts");
        localStorage.removeItem("verificationTimestamp");
      } else if (attemptsCount >= 3) {
        // Masih dalam periode cooldown
        setVerificationAttempts(attemptsCount);
      }
    }
  }, []);

  useEffect(() => {
    // Reset attempts after 1 minute of waiting
    if (verificationAttempts >= 3) {
      const timer = setTimeout(() => {
        setVerificationAttempts(0);
        setVerificationError("");
        setIsLoading(false);
        localStorage.removeItem("verificationAttempts");
        localStorage.removeItem("verificationTimestamp");
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, [verificationAttempts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  const handleVerify = () => {
    if (verificationAttempts >= 3) {
      setVerificationError(
        "Too many attempts. Please wait 1 minute before trying again."
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (verificationCode === expectedCode) {
        setVerificationError("");
        localStorage.setItem("adminVerified", "success");
        localStorage.setItem("verifiedAt", Date.now().toString());
        onVerify();
      } else {
        const newAttempts = verificationAttempts + 1;
        setVerificationAttempts(newAttempts);
        localStorage.setItem("verificationAttempts", newAttempts.toString());
        localStorage.setItem("verificationTimestamp", Date.now().toString());

        setVerificationError("Invalid verification code. Please try again.");
        setIsLoading(false);
      }
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      verificationCode &&
      !isLoading &&
      verificationAttempts < 3
    ) {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <Card className="w-[350px] mx-4 bg-putih shadow-2xl border-birmud/30 rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-birtu" />
            <CardTitle className="text-lg font-bold text-birtu">
              Admin Verification
            </CardTitle>
          </div>
          <CardDescription className="text-birtu/70 mt-1">
            Enter admin code to access the admin panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {verificationError && (
              <Alert
                variant="destructive"
                className="bg-red-50 text-red-600 border-red-200 py-2"
              >
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            {verificationAttempts >= 3 ? (
              <div className="text-center py-2 text-birtu/70">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                <p>Please wait 1 minute before trying again</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  type="password"
                  name="verificationCode"
                  placeholder="Enter Admin code"
                  value={verificationCode}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={verificationAttempts >= 3 || isLoading}
                  maxLength={6}
                  autoFocus
                  className="text-center text-lg tracking-widest border-birmud/30 focus:border-birtu focus:ring-birmud bg-putbir/20"
                />

                <Button
                  onClick={handleVerify}
                  disabled={
                    verificationAttempts >= 3 || !verificationCode || isLoading
                  }
                  className="w-full bg-gradient-to-r from-birtu to-birtu/90 hover:from-oren hover:to-oren/90 text-putih font-medium transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationModal;
