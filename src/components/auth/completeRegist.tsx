"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/components/ui/use-toast";

const CompleteRegister = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const base_url = process.env.NEXT_PUBLIC_BASE_URL_BE;

  useEffect(() => {
    const urlToken = searchParams.get("token");
    
    if (urlToken) {
      setToken(urlToken);
    } else {
      toast({
        title: "Token not found",
        description: "Registration Link is not valid or expired.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const formik = useFormik({
    initialValues: { fullName: "", password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Nama lengkap harus diisi"),
      password: Yup.string()
        .min(6, "Password minimal 6 karakter")
        .required("Password harus diisi"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Password tidak cocok')
        .required('Konfirmasi password harus diisi')
    }),
    onSubmit: async (values) => {
      if (!token) {
        toast({
          title: "Error",
          description: "Token registration not found.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await fetch(`${base_url}/auth/complete-register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            token, 
            fullName: values.fullName, 
            password: values.password 
          }),
        });

        let data;
        const text = await response.text();
        
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { message: "Server response not valid" };
        }

        if (!response.ok) {
          throw new Error(data.message || "Registration failed.");
        }
        
        toast({
          title: "Registration Completed",
          description: "Now you can sign in with this account ✅",
        });
        
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gradient-to-b from-[#E7FAFE] to-white shadow-lg rounded-lg mt-40 border border-red-200">
        <h2 className="text-xl font-semibold text-center mb-4">Link is not Valid</h2>
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">
          Registration link is not valid or expired. Please check your email or get new link.
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full p-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-40 border border-gray-200">
      <h2 className="text-xl font-semibold text-center mb-4">Complete Registration</h2>
      
      <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded">
        Please fill form information below for complete registration.
      </div>
      
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600">Full Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            {...formik.getFieldProps("fullName")}
            placeholder="Enter your fullname"
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <p className="text-red-500 text-sm">{formik.errors.fullName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-600">Password</label>
          <input
            type="password"
            className="w-full p-3 border rounded-lg"
            {...formik.getFieldProps("password")}
            placeholder="Enter your password"
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-600">Confirm Password</label>
          <input
            type="password"
            className="w-full p-3 border rounded-lg"
            {...formik.getFieldProps("confirmPassword")}
            placeholder="Confirm your password"
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-sm">{formik.errors.confirmPassword}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-3 rounded-lg text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Signing Up..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CompleteRegister;
