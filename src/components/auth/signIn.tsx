"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import LaundrySearchBar from "../app/searchbar";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2, Mail, KeyRound, LogIn,  } from "lucide-react";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const SignIn = () => {
  const router = useRouter();
  const { login } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const response = await fetch(`${base_url}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed");

        console.log("Login response:", data);

        // Save token first
        await login(data.token);

        // Check if data.data exists and has a role property
        if (data.data) {
          // Store user data
          localStorage.setItem("user", JSON.stringify(data.data));

          if (data.data.role === "CUSTOMER") {
            // Only show success toast for confirmed customers
            toast({
              variant: "default",
              title: "Login Successful",
              description: "Welcome back! ✅",
            });

            router.push("/");
          } else if (data.data.role) {
            // If role exists but is not CUSTOMER
            toast({
              variant: "destructive",
              title: "Access Denied",
              description:
                "This application is only accessible to customers. Your session has been terminated for security reasons.",
            });

            // Log out non-customers
            setTimeout(() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }, 100);
          } else {
            // If role property doesn't exist, just redirect without toast
            // This allows the HOC to handle authorization
            router.push("/");
          }
        } else {
          // If user data is missing, just redirect without toast
          // This allows the HOC to handle authorization
          router.push("/");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        toast({
          title: "Login Failed",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Login with Google OAuth
  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (response) => {
      setGoogleLoading(true);

      try {
        const res = await fetch(`${base_url}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: response.code }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Google login failed");

        // Save token & user data to localStorage
        await login(data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        toast({ title: "Google Login Successful", description: "Welcome! ✅" });
        router.push("/");
      } catch (error: any) {
        toast({
          title: "Google Login Failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google Login Failed",
        description: "An error occurred.",
        variant: "destructive",
      });
      setGoogleLoading(false);
    },
  });

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen text-center">
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
      <div className="container mx-auto pt-32 md:pt-28 lg:pt-40 pb-8">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {/* Left Column - Video (Hidden on small screens) */}
          <div className="hidden md:block w-full md:w-1/2 lg:w-5/12">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg transition-all hover:shadow-xl border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
                <div className="w-5 h-5 mr-2" />
                See How Our Laundry Service Works
              </h2>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/AITFo973Jro?autoplay=1&mute=1"
                  title="YouTube Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Watch our video to learn how easy it is to get your laundry done with our service.
              </p>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="w-full md:w-1/2 lg:w-5/12 max-w-md">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg transition-all hover:shadow-xl border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600 mt-1">Sign in to continue to your account</p>
              </div>

              {/* Login Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                      Email Address
                    </label>
                    {formik.touched.email && formik.errors.email && (
                      <span className="text-xs text-red-500">{formik.errors.email}</span>
                    )}
                  </div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    {...formik.getFieldProps("email")}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <KeyRound className="w-4 h-4 mr-1.5 text-gray-400" />
                      Password
                    </label>
                    {formik.touched.password && formik.errors.password && (
                      <span className="text-xs text-red-500">{formik.errors.password}</span>
                    )}
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className={`w-full ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    {...formik.getFieldProps("password")}
                  />
                </div>

                <div className="text-right">
                  <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" /> Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-sm text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Google Sign-in Button */}
              <Button
                onClick={() => handleGoogleLogin()}
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium flex items-center justify-center"
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in with Google...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="20"
                      height="20"
                      className="mr-2"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <a href="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    Sign Up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;