"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import LaundrySearchBar from "../app/searchbar";
import { Button } from "../ui/button";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const SignUp = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);

  // 📌 Formik untuk verifikasi email
  const formikEmail = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        const response = await fetch(`${base_url}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: values.email }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to send email");

        toast({
          title: "Verification Email Sent",
          description: "Check your inbox to verify your email! ✅",
        });
        setEmailSubmitted(true);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
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

      <div className="flex flex-col md:flex-row justify-center items-center text-start space-y-10 md:space-y-0 md:space-x-10 mt-10 md:mt-44">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold text-center mb-4">Sign Up</h2>
          {!emailSubmitted ? (
            <form onSubmit={formikEmail.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border rounded-lg"
                  {...formikEmail.getFieldProps("email")}
                />
                {formikEmail.touched.email && formikEmail.errors.email && (
                  <p className="text-red-500 text-sm">
                    {formikEmail.errors.email}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full p-3 rounded-lg text-white ${
                  isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                } transition-all`}
              >
                {isLoading ? "Sending..." : "Verify Email"}
              </Button>
            </form>
          ) : (
            <p className="text-green-600 text-center">
              Check your email for verification link! ✅
            </p>
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-500 hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default SignUp;
