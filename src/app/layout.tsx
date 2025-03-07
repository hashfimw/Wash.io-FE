import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import LocationProviderWrapper from "@/components/app/LocationProvider";
import LocationPermissionBanner from "@/components/app/LocationBanner";
import { SessionProvider } from "@/context/useSession";
import { Montserrat } from "next/font/google";
import NavbarExcept from "@/components/navbarExcept";
import FooterExcept from "@/components/footerExcept";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Washio",
  description: "Laundry App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body
        className={`
          ${montserrat.className} antialiased hover:cursor-default`}
      >
        <LocationProviderWrapper>
          <SessionProvider>
            <LocationPermissionBanner />
            <NavbarExcept />
            {children}
            <Toaster />
            <FooterExcept />
          </SessionProvider>
        </LocationProviderWrapper>
      </body>
    </html>
  );
}
