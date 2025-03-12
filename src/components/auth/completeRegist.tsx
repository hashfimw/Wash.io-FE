"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Loader2, 
  UserCircle, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2,
  Home
} from "lucide-react";

const CompleteRegister = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

  // Password strength indicator logic
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const labels = ["Lemah", "Cukup", "Baik", "Kuat"];
    const colors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    
    return { 
      strength, 
      label: labels[strength > 0 ? strength - 1 : 0],
      color: colors[strength > 0 ? strength - 1 : 0]
    };
  };
  
  const passwordStrength = getPasswordStrength(formik.values.password);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E7FAFE] to-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-xl border border-red-200">
          <div className="flex flex-col items-center mb-4">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-center">Link Tidak Valid</h2>
          </div>
          
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
            Link registrasi tidak valid atau sudah kadaluarsa. Silakan periksa email Anda atau dapatkan link baru.
          </div>
          
          <Button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E7FAFE] to-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-xl font-semibold text-center">Selesaikan Registrasi</h2>
          </div>
          
          <div className="mb-5 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
            Silakan isi informasi dibawah untuk menyelesaikan registrasi.
          </div>
          
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <UserCircle className="w-4 h-4 mr-1.5 text-gray-500" />
                Nama Lengkap
              </label>
              <Input
                type="text"
                className={`w-full ${
                  formik.touched.fullName && formik.errors.fullName
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                {...formik.getFieldProps("fullName")}
                placeholder="Masukkan nama lengkap"
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="text-red-500 text-xs flex items-center mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {formik.errors.fullName}
                </p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <KeyRound className="w-4 h-4 mr-1.5 text-gray-500" />
                Password
              </label>
              <Input
                type="password"
                className={`w-full ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                {...formik.getFieldProps("password")}
                placeholder="Masukkan password"
              />
              
              {/* Password strength indicator */}
              {formik.values.password && (
                <div className="mt-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color}`} 
                      style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>Kekuatan password:</span> 
                    <span className={passwordStrength.strength >= 3 ? "text-green-600 font-medium" : "text-amber-600"}>
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}
              
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs flex items-center mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {formik.errors.password}
                </p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-gray-500" />
                Konfirmasi Password
              </label>
              <Input
                type="password"
                className={`w-full ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                {...formik.getFieldProps("confirmPassword")}
                placeholder="Konfirmasi password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs flex items-center mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mendaftar...
                </>
              ) : (
                "Selesaikan Registrasi"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            Sudah punya akun? <a href="/login" className="text-blue-600 hover:underline font-medium">Masuk</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegister;