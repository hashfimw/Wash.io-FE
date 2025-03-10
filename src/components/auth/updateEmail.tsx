"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function UpdateEmailPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  useEffect(() => {
    const verifyEmailUpdate = async () => {
      try {
        const response = await fetch(`${base_url}/auth/update-email/${token}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setTimeout(() => {
            router.push("/profile");
          }, 3000);
        } else {
          setStatus("error");
        }

        setMessage(data.message);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred during email update verification.");
      }
    };

    if (token) {
      verifyEmailUpdate();
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center">
              <Clock className="h-16 w-16 text-yellow-500 mb-4 animate-pulse" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Verifying Email Update...
              </h2>
              <p className="text-gray-600">
                Please wait while we process your request.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Email Updated Successfully!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-gray-500 text-sm">
                Redirecting to profile page in 3 seconds...
              </p>
              <Link href="/profile" className="mt-4">
                <button className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-300">
                  Go to Profile Now
                </button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Email Update Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex flex-col md:flex-row gap-4">
                <Link href="/profile">
                  <button className="w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-300">
                    Back to Profile
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="w-full px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors duration-300">
                    Try Again Later
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
