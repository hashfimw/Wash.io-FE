import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/app/navbar";
import Footer from "@/components/app/footer";
import LocationProviderWrapper from "@/components/app/LocationProvider";
import LocationPermissionBanner from "@/components/app/LocationBanner";
import { SessionProvider } from "@/context/useSession";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocationProviderWrapper>
          <SessionProvider>
            <Navbar />
            <LocationPermissionBanner />
            {children}
            <Toaster />
            <Footer />
          </SessionProvider>
        </LocationProviderWrapper>
      </body>
    </html>
  );
}
