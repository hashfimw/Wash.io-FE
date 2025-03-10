"use client";

import React, { useState, useEffect } from "react";
import { User, Mail } from "lucide-react";
import { useEditProfile } from "@/hooks/api/profile/useEditProfile";
import { UserUpdatePayload } from "@/types/profile";

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

  // Update local state when initialValues change
  useEffect(() => {
    setValues({
      fullName: initialValues.fullName || "",
      email: initialValues.email || "",
    });
  }, [initialValues]);

  const { updateProfile, isUpdating } = useEditProfile();

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear errors when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload: UserUpdatePayload = {};

    // Only include changed fields in the payload
    if (values.fullName !== initialValues.fullName) {
      payload.fullName = values.fullName;
    }

    if (values.email !== initialValues.email) {
      payload.email = values.email;
    }

    // Only make the API call if something has changed
    if (Object.keys(payload).length > 0) {
      try {
        const result = await updateProfile(userId, payload);
        // Pass the updated values back to the parent component
        onSaveComplete(values);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      // If nothing changed, still call onSaveComplete with no changes
      onSaveComplete({});
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
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-4 py-2 bg-birtu text-white rounded-md hover:bg-oren transition-colors duration-300 disabled:opacity-50"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;