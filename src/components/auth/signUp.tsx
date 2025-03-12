"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import LaundrySearchBar from "../app/searchbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Mail, Loader2, CheckCircle, ArrowRight } from "lucide-react";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const SignUp = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);

  // Formik for email verification
  const formikEmail = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
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
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen p-4">
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
      <div className="container mx-auto pt-32 md:pt-28 lg:pt-36">
        <div className="flex flex-col md:flex-row-reverse justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {/* Right Column - Video (Hidden on small screens) */}
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
                Watch our video to learn how easy it is to get your laundry done
                with our service.
              </p>
            </div>
          </div>

          {/* Left Column - Sign Up Form */}
          <div className="w-full md:w-1/2 lg:w-5/12 max-w-md">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg transition-all hover:shadow-xl border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Join Wash<span className="text-oren">io</span>
                </h2>
                <p className="text-gray-600 mt-1">
                  Create your account in just one step
                </p>
              </div>

              {!emailSubmitted ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1.5" />
                      How it works:
                    </h3>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      1. Enter your email address below
                      <br />
                      2. We&apos;ll send you a verification link
                      <br />
                      3. Click the link to complete your registration
                    </p>
                  </div>

                  <form
                    onSubmit={formikEmail.handleSubmit}
                    className="space-y-5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                          Email Address
                        </label>
                        {formikEmail.touched.email &&
                          formikEmail.errors.email && (
                            <span className="text-xs text-red-500">
                              {formikEmail.errors.email}
                            </span>
                          )}
                      </div>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className={`w-full ${
                          formikEmail.touched.email && formikEmail.errors.email
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        {...formikEmail.getFieldProps("email")}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          Get Verification Link{" "}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Email Sent!
                  </h3>
                  <p className="text-sm text-green-700 mb-4">
                    We&apos;ve sent a verification link to your email address. Please
                    check your inbox and click the link to complete your
                    registration.
                  </p>
                  <p className="text-xs text-green-600">
                    (If you don&apos;t see the email, check your spam folder)
                  </p>
                </div>
              )}

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Sign In
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

export default SignUp;
