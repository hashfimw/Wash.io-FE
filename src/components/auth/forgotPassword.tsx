"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import LaundrySearchBar from "../app/searchbar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";

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
      email: Yup.string().email("Invalid email").required("Email is required"),
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
          description: "Password reset instructions have been sent to your email. ✅" 
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
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen text-center p-4 mb-24">
      <div
        className={`fixed top-0 left-80 right-80 z-50 transition-all ${
          isScrolled ? "bg-transparent" : "bg-transparent py-6"
        }`}
      >
        <div className="hidden md:flex w-50 mx-auto px-4">
          <LaundrySearchBar />
        </div>
      </div>

      <div className="flex flex-col justify-center items-center text-start space-y-10 mt-10 md:mt-44">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-center mb-4">Forgot Password</h2>
          
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium text-lg text-green-800">Email Sent Successfully</h3>
                <p className="text-green-700 mt-1">
                  We`&apos;`ve sent password reset instructions to your email address.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Please check your inbox and follow the link to reset your password. The link is valid for 1 hour.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full p-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-all"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Enter your email address below and we`&apos;`ll send you a link to reset your password.
              </p>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-600">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    className="w-full p-3 border rounded-lg"
                    {...formik.getFieldProps("email")}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm">{formik.errors.email}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className={`w-full p-3 rounded-lg text-white ${
                    loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                  } transition-all`}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Reset Password"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <a href="/login" className="text-blue-500 hover:underline">
                    Back to Sign In
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;