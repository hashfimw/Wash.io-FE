"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, AlertTriangle } from "lucide-react";
import { useEditProfile } from "@/hooks/api/profile/useEditProfile";
import { UserUpdatePayload } from "@/types/profile";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ProfileEditFormProps {
  userId: number;
  initialValues: {
    fullName: string;
    email: string;
  };
  onSaveComplete: (updatedData: {fullName?: string; email?: string}) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  userId,
  initialValues,
  onSaveComplete,
}) => {
  const [values, setValues] = useState({
    fullName: initialValues.fullName || "",
    email: initialValues.email || "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  });

  const [verificationSent, setVerificationSent] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  // Update local state when initialValues change
  useEffect(() => {
    setValues({
      fullName: initialValues.fullName || "",
      email: initialValues.email || "",
    });
  }, [initialValues]);

  // Check if email was changed
  useEffect(() => {
    if (initialValues.email !== values.email) {
      setEmailChanged(true);
    } else {
      setEmailChanged(false);
    }
  }, [values.email, initialValues.email]);

  const { updateProfile, isUpdating } = useEditProfile();

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Reset verification sent status when email changes again
    if (field === "email" && verificationSent) {
      setVerificationSent(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { fullName: "", email: "" };
    let isValid = true;

    // Validate name
    if (!values.fullName.trim()) {
      newErrors.fullName = "Name is required";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(values.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const sendVerificationEmail = async () => {
    if (!validateForm()) return;

    try {
      // Send verification email API call - matching your existing endpoint
      const response = await fetch(`${base_url}/auth/request-email-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newEmail: values.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationSent(true);
      } else {
        setErrors((prev) => ({ ...prev, email: result.message || "Failed to send verification email" }));
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      setErrors((prev) => ({ ...prev, email: "Error sending verification email" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload: UserUpdatePayload = {};

    // Only include fullName in the payload as email requires verification
    if (values.fullName !== initialValues.fullName) {
      payload.fullName = values.fullName;
    }

    // If email has changed, request verification first
    if (values.email !== initialValues.email) {
      await sendVerificationEmail();
      
      // Update only the name if changed
      if (Object.keys(payload).length > 0) {
        try {
          const result = await updateProfile(userId, payload);
          // Pass only the updated name back to the parent component
          onSaveComplete({ fullName: values.fullName });
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
      return;
    }

    // If nothing changed in either field
    if (Object.keys(payload).length === 0) {
      onSaveComplete({});
      return;
    }

    // Update only the name if changed
    try {
      const result = await updateProfile(userId, payload);
      onSaveComplete(payload);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-6">
      <div className="space-y-10">
        <div className="relative mb-6">
          <label
            htmlFor="fullName"
            className={`absolute transition-all duration-300 ${
              values.fullName.length > 0
                ? "transform -translate-y-7 text-xs font-medium"
                : "transform translate-y-2.5 text-gray-500"
            }`}
          >
            Full Name<span className="text-red-500 ml-1">*</span>
          </label>

          <div className="flex items-center">
            <div
              className={`absolute left-3 text-gray-500 transition-colors duration-300 ${
                errors.fullName ? "text-red-500" : ""
              }`}
            >
              <User className="h-4 w-4" />
            </div>

            <input
              id="fullName"
              type="text"
              value={values.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              onBlur={() => validateForm()}
              placeholder="Enter your full name"
              className={`block w-full px-4 py-2.5 pl-10 border rounded-md bg-white/50 transition-all duration-300 focus:ring-2 focus:ring-opacity-50 focus:outline-none
                ${
                  errors.fullName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-birtu focus:ring-birtu/20"
                }`}
            />
          </div>

          {errors.fullName && (
            <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div className="relative mb-6">
          <label
            htmlFor="email"
            className={`absolute transition-all duration-300 ${
              values.email.length > 0
                ? "transform -translate-y-7 text-xs font-medium"
                : "transform translate-y-2.5 text-gray-500"
            }`}
          >
            Email Address<span className="text-red-500 ml-1">*</span>
          </label>

          <div className="flex items-center">
            <div
              className={`absolute left-3 text-gray-500 transition-colors duration-300 ${
                errors.email ? "text-red-500" : ""
              }`}
            >
              <Mail className="h-4 w-4" />
            </div>

            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => validateForm()}
              placeholder="Enter your email address"
              className={`block w-full px-4 py-2.5 pl-10 border rounded-md bg-white/50 transition-all duration-300 focus:ring-2 focus:ring-opacity-50 focus:outline-none
                ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-birtu focus:ring-birtu/20"
                }`}
            />
          </div>

          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
          )}
          
          {emailChanged && !errors.email && (
            <p className="mt-1.5 text-xs text-amber-500 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Email change requires verification
            </p>
          )}
          
          {verificationSent && (
            <p className="mt-1.5 text-xs text-green-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verification email sent to {values.email}! Please check your inbox.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-4 py-2 bg-birtu text-white rounded-md hover:bg-oren transition-colors duration-300 disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : emailChanged && !verificationSent ? "Save & Verify Email" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;