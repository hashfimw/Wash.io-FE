"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import LaundrySearchBar from "../app/searchbar";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/ui/use-toast"; // 📌 Gunakan toast custom
import { Button } from "../ui/button";

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
      email: Yup.string().email("Invalid email").required("Email is required"),
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

  // 📌 Login dengan Google OAuth
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

        // ✅ Simpan token & data user ke localStorage
        await login(data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        toast({ title: "Google Login Successful", description: "Welcome! ✅" }); // 📌 Toast sukses
        router.push("/");
      } catch (error: any) {
        toast({
          title: "Google Login Failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        }); // 📌 Toast error
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Google Login Failed",
        description: "An error occurred.",
        variant: "destructive",
      }); // 📌 Toast error
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

      <div className="flex flex-col md:flex-row justify-center items-center text-start space-y-10 md:space-y-0 md:space-x-10 mt-10 md:mt-44">
        <div className="hidden md:block w-1/2 p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Commercial Videos</h2>
          <div className="relative w-full aspect-video">
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/AITFo973Jro?autoplay=1&mute=1"
              title="YouTube Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-center mb-4">Sign In</h2>

          {/* 📌 Form Login */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 border rounded-lg"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-600">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border rounded-lg"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              className={`w-full p-3 rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } transition-all`}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center mt-3">
            <a href="/forgot-password" className="text-blue-500 text-sm">
              Forgot Password?
            </a>
          </div>

          <div className="mt-4 text-center">OR</div>

          {/* 📌 Tombol Login dengan Google */}
          <Button
            onClick={() => handleGoogleLogin()}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg text-black ${
              googleLoading ? "bg-gray-400" : "bg-white hover:bg-gray-100"
            } transition-all`}
            disabled={googleLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#4285F4"
                d="M24 9.5c3.52 0 6.59 1.28 9.02 3.39l6.69-6.69C34.85 2.27 29.71 0 24 0 14.78 0 6.84 5.38 2.84 13.26l7.89 6.1C13.15 13.02 18.2 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.07 24.55c0-1.37-.12-2.7-.35-3.99H24v7.56h12.65c-.66 3.22-2.54 5.94-5.32 7.75l7.88 6.1c4.63-4.29 7.34-10.6 7.34-17.42z"
              />
              <path
                fill="#FBBC05"
                d="M10.73 28.54c-.51-1.52-.78-3.12-.78-4.77s.27-3.25.78-4.77l-7.89-6.1C.93 16.01 0 19.91 0 24s.93 7.99 2.84 11.1l7.89-6.1z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.48 0 11.91-2.15 15.88-5.84l-7.88-6.1c-2.22 1.49-5.02 2.37-8 2.37-5.8 0-10.85-3.52-13.27-8.61l-7.89 6.1C6.84 42.62 14.78 48 24 48z"
              />
            </svg>
            {googleLoading ? "Signing In with Google..." : "Sign In with Google"}
          </Button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-blue-500 hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
