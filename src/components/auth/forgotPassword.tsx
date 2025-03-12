"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import LaundrySearchBar from "../app/searchbar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Loader2,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const ForgotPassword = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Formik for email submission
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const response = await fetch(`${base_url}/auth/forgotPassword`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Request failed");

        setEmailSent(true);
        toast({
          title: "Email Sent",
          description:
            "Password reset instructions have been sent to your email. ✅",
        });
      } catch (error: any) {
        toast({
          title: "Request Failed",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen">
      <div
        className={`fixed top-0 left-80 right-80 z-50 transition-all ${
          isScrolled ? "bg-transparent" : "bg-transparent py-6"
        }`}
      >
        <div className="hidden md:flex w-50 mx-auto px-4">
          <LaundrySearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto pt-32 md:pt-28 lg:pt-56 p-5 flex justify-center">
        <div className="w-full max-w-md">
          <div className="p-6 sm:p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800">Email Sent</h2>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                  <p className="text-green-700 text-sm">
                    We&apos;ve sent password reset instructions to your email
                    address.
                  </p>
                </div>

                <div className="flex items-start text-left bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-700">
                      Important:
                    </h3>
                    <p className="text-xs text-blue-600 mt-1">
                      The password reset link is valid for 1 hour. If you don&apos;t
                      see the email, please check your spam folder.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center mt-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-600 mt-1">
                    No worries, we&apos;ll send you reset instructions
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-sm">
                      Enter your email address and we&apos;ll send you a link to
                      reset your password.
                    </p>
                  </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-1.5 text-gray-500" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your registered email"
                      className={`w-full ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...formik.getFieldProps("email")}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-xs flex items-center mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                    onClick={() => router.push("/login")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
