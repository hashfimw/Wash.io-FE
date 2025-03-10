import { CustomerGuard } from "@/hoc/CustomerGuard";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        <CustomerGuard>{children}</CustomerGuard>
        {children}
      </GoogleOAuthProvider>
    </div>
  );
}
