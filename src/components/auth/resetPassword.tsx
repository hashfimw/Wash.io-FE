"use client";

import React, { useState, useEffect } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LaundrySearchBar from "../app/searchbar";
import { Button } from "../ui/button";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Define validation schema
const ResetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(5, "Password is too short")
    .required("New Password required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Password not match")
    .required("Confirm password required."),
});

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);

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
        toast.error("Link reset not valid. Redirect to login...", {
          position: "top-right",
          autoClose: 3000,
          onClose: () => router.push("/login"),
        });
      }
    }
  }, [token, router]);

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to handle redirect on success
  useEffect(() => {
    if (resetSuccess) {
      // Clean up reset token
      localStorage.removeItem("resetToken");
      
      // Set a timer for redirection (3 seconds)
      const timer = window.setTimeout(() => {
        router.push("/login");
      }, 3000);
      
      setRedirectTimer(timer);
      
      // Clean up timer on unmount
      return () => {
        if (redirectTimer) window.clearTimeout(redirectTimer);
      };
    }
  }, [resetSuccess, router]);

  const initialValues: FormValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const handleResetPassword = async (values: FormValues) => {
    try {
      setIsLoading(true);
      console.log("Sending reset request with token:", storedToken);
      
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
        throw new Error(data.message || "Reset Password is failed!");
      }

      // Set success state to trigger redirect
      setResetSuccess(true);
      
      // Success toast with Indonesian message
      toast.success("Reset Password successful! Redirect to login...", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Terjadi kesalahan", {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Custom input field component
  const InputField = ({
    label,
    name,
    type = "text",
    placeholder,
    errors,
    touched,
    handleChange,
    value,
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder: string;
    errors: any;
    touched: any;
    handleChange: any;
    value: any;
  }) => (
    <div>
      <label className="block text-gray-600">{label}</label>
      <Field
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {touched[name] && errors[name] && (
        <p className="text-red-500 text-sm">{errors[name]}</p>
      )}
    </div>
  );

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
          <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
          
          {resetSuccess ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium text-lg text-green-800">Password already updated.</h3>
                <p className="text-green-700 mt-1">
                  Your reset password is success.
                </p>
                <p className="text-green-700 mt-3">
                  Redirect to login in 3s...
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full p-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-all"
              >
                Login
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Please fill reset password form here : 
              </p>

              <Formik
                initialValues={initialValues}
                validationSchema={ResetPasswordSchema}
                onSubmit={handleResetPassword}
              >
                {(props: FormikProps<FormValues>) => {
                  const { handleChange, values, touched, errors } = props;
                  return (
                    <Form className="space-y-4">
                      <InputField
                        label="New Password"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        errors={errors}
                        touched={touched}
                        handleChange={handleChange}
                        value={values.newPassword}
                      />
                      
                      <InputField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        errors={errors}
                        touched={touched}
                        handleChange={handleChange}
                        value={values.confirmPassword}
                      />
                      
                      <Button
                        type="submit"
                        className={`w-full p-3 rounded-lg text-white ${
                          isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                        } transition-all`}
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Reset Password"}
                      </Button>
                    </Form>
                  );
                }}
              </Formik>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;