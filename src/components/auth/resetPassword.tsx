"use client";

import React, { useState, useEffect } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import LaundrySearchBar from "../app/searchbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Loader2, 
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  AlertTriangle,
  LockKeyhole 
} from "lucide-react";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Define validation schema
const ResetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords don't match")
    .required("Please confirm your password"),
});

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Extract token from params - handles both string and array
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token as string;

  // Store token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("resetToken", token);
      setStoredToken(token);
    } else {
      const savedToken = localStorage.getItem("resetToken");
      if (savedToken) {
        setStoredToken(savedToken);
      } else {
        setTokenError("Invalid or expired reset link");
        toast({
          title: "Invalid Reset Link",
          description: "The password reset link is not valid or has expired.",
          variant: "destructive",
        });
      }
    }
  }, [token, toast]);

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to handle redirect on success with countdown
  useEffect(() => {
    if (resetSuccess) {
      // Clean up reset token
      localStorage.removeItem("resetToken");
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Clean up timer on unmount
      return () => {
        clearInterval(countdownInterval);
      };
    }
  }, [resetSuccess, router]);

  const initialValues: FormValues = {
    newPassword: "",
    confirmPassword: "",
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    
    return { 
      strength, 
      label: labels[strength > 0 ? strength - 1 : 0],
      color: colors[strength > 0 ? strength - 1 : 0]
    };
  };

  const handleResetPassword = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${base_url}/auth/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: storedToken,
          newPassword: values.newPassword, 
          confirmPassword: values.confirmPassword
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Password reset failed!");
      }

      // Set success state to trigger redirect
      setResetSuccess(true);
      setSecondsLeft(3);
      
      // Success toast
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Redirecting to login...",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset Failed",
        description: error.message || "An error occurred while resetting your password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Immediate redirect function
  const handleImmediateRedirect = () => {
    router.push("/login");
  };

  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen p-4 md:p-6 lg:p-8">

      {/* Main Content */}
      <div className="container mx-auto pt-16 pb-8 flex justify-center">
        <div className="w-full max-w-md">
          {tokenError ? (
            <div className="p-6 sm:p-8 bg-white shadow-lg rounded-2xl border border-red-200">
              <div className="flex flex-col items-center mb-4">
                <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-center">Invalid Reset Link</h2>
              </div>
              
              <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                The password reset link is not valid or has expired. Please request a new password reset link.
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push('/forgot-password')}
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
                
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="flex-1 py-2.5 text-gray-700 rounded-lg flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
              {resetSuccess ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-800">Password Updated</h2>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                    <p className="text-green-700 text-sm">
                      Your password has been successfully reset.
                    </p>
                  </div>
                  
                  <div className="h-10 w-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-medium">{secondsLeft}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Redirecting to login in {secondsLeft} seconds...
                  </p>
                  
                  <Button
                    onClick={handleImmediateRedirect}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center mt-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Login Now
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <ShieldCheck className="h-7 w-7 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Reset Your Password</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Please create a new secure password
                    </p>
                  </div>

                  <Formik
                    initialValues={initialValues}
                    validationSchema={ResetPasswordSchema}
                    onSubmit={handleResetPassword}
                  >
                    {(props: FormikProps<FormValues>) => {
                      const { handleChange, values, touched, errors } = props;
                      const passwordStrength = getPasswordStrength(values.newPassword);
                      
                      return (
                        <Form className="space-y-5">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <Key className="w-4 h-4 mr-1.5 text-gray-500" />
                              New Password
                            </label>
                            <div className="relative">
                              <Field
                                as={Input}
                                type="password"
                                name="newPassword"
                                placeholder="Enter new password"
                                onChange={handleChange}
                                value={values.newPassword}
                                className={`w-full ${
                                  touched.newPassword && errors.newPassword
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                              />
                              <LockKeyhole className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                            
                            {/* Password strength indicator */}
                            {values.newPassword && (
                              <div className="mt-1">
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${passwordStrength.color}`} 
                                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 flex justify-between">
                                  <span>Password strength:</span> 
                                  <span className={passwordStrength.strength >= 3 ? "text-green-600 font-medium" : "text-amber-600"}>
                                    {passwordStrength.label}
                                  </span>
                                </p>
                              </div>
                            )}
                            
                            {touched.newPassword && errors.newPassword && (
                              <p className="text-red-500 text-xs flex items-center mt-1">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                {errors.newPassword}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1.5 text-gray-500" />
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Field
                                as={Input}
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                onChange={handleChange}
                                value={values.confirmPassword}
                                className={`w-full ${
                                  touched.confirmPassword && errors.confirmPassword
                                    ? "border-red-300 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                              />
                              <LockKeyhole className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                            {touched.confirmPassword && errors.confirmPassword && (
                              <p className="text-red-500 text-xs flex items-center mt-1">
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>
                          
                          <div className="pt-3">
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Key className="w-4 h-4 mr-2" />
                                  Reset Password
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      );
                    }}
                  </Formik>
                  
                  <div className="mt-6 text-center">
                    <Button
                      variant="ghost"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                      onClick={() => router.push("/login")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;