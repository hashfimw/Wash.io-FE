"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import LaundrySearchBar from "../app/searchbar";
import { useSession } from "@/hooks/useSession";
import { useToast } from "@/components/ui/use-toast"; // 📌 Gunakan toast custom

const base_url_be = process.env.NEXT_PUBLIC_BASE_URL_BE;

const SignIn = () => {
  const router = useRouter();
  const { login } = useSession();
  const { toast } = useToast(); // 📌 Gunakan sistem toast baru
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 📌 Formik untuk login dengan email dan password
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const response = await fetch(`${base_url_be}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed");

        // ✅ Simpan token & data user ke localStorage
        await login(data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        toast({ title: "Login Successful", description: "Welcome back! ✅" }); // 📌 Toast sukses
        router.push("/");
      } catch (error: any) {
        toast({ title: "Login Failed", description: error.message || "Something went wrong.", variant: "destructive" }); // 📌 Toast error
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
        const res = await fetch(`${base_url_be}/auth/google`, {
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
        toast({ title: "Google Login Failed", description: error.message || "Please try again.", variant: "destructive" }); // 📌 Toast error
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast({ title: "Google Login Failed", description: "An error occurred.", variant: "destructive" }); // 📌 Toast error
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
      <div className={`fixed top-0 left-80 right-80 z-50 transition-all ${isScrolled ? "bg-transparent" : "bg-transparent py-6"}`}>
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
              {formik.touched.email && formik.errors.email && <p className="text-red-500 text-sm">{formik.errors.email}</p>}
            </div>
            <div>
              <label className="block text-gray-600">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 border rounded-lg"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && <p className="text-red-500 text-sm">{formik.errors.password}</p>}
            </div>
            <button
              type="submit"
              className={`w-full p-3 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} transition-all`}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-3">
            <a href="/forgot-password" className="text-blue-500 text-sm">Forgot Password?</a>
          </div>
          
          <div className="mt-4 text-center">OR</div>
          
          {/* 📌 Tombol Login dengan Google */}
          <button
            onClick={() => handleGoogleLogin()}
            className={`w-full p-3 rounded-lg text-white ${googleLoading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"} transition-all`}
            disabled={googleLoading}
          >
            {googleLoading ? "Signing In with Google..." : "Sign In with Google"}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
