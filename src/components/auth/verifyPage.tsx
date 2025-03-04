"use client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const base_url = process.env.NEXT_PUBLIC_BASE_URL_BE;

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Coba dapatkan token dari beberapa sumber yang mungkin
  const tokenFromPath = params.token as string;
  const tokenFromQuery = searchParams.get("token");
  const token = tokenFromPath || tokenFromQuery;
  
  console.log("Token from URL:", token);

  const onVerify = useCallback(async () => {
    if (!token) {
      console.error("No token found in URL!");
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "No verification token found in URL.",
      });
      setIsLoading(false);
      return;
    }
    
    console.log(`Verifying with URL: ${base_url}/auth/verify/${token}`);
    
    try {
      const res = await fetch(`${base_url}/auth/verify/${token}`, {
        method: "PATCH",
        next: { revalidate: 0 },
      });
      
      const text = await res.text();
      let result;
      
      try {
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Error parsing response:", e);
        throw new Error("Invalid server response");
      }
      
      console.log("Verification response:", result);
      
      if (!res.ok) throw new Error(result.message || "Verification failed.");
      
      toast({
        variant: "default",
        title: "Verification Successful",
        description: result.message || "Your account has been verified!",
      });
      
      // Forward token to complete-regist page
      router.push(`/complete-regist?token=${encodeURIComponent(token)}`);
    } catch (err: any) {
      console.error("Verification failed:", err);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: err.message || "Something went wrong.",
      });
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [token, router, toast]);

  useEffect(() => {
    if (token) {
      onVerify();
    } else {
      setIsLoading(false);
    }
  }, [token, onVerify]);

  return (
    <div className="flex flex-col justify-center min-h-screen items-center p-4">
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-700">Verifying your account...</p>
        </>
      ) : !token ? (
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">No verification token found</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <p className="text-lg text-gray-700">Redirecting to complete registration...</p>
      )}
    </div>
  );
}