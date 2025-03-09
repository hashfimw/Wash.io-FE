import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CSSWave from "../animations/Waves";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-putbir to-birmud/20 text-birtu w-full relative">
      <div className="container mx-auto px-4 py-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6">
          <div className="col-span-1 md:col-span-1">
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-4">
                <Image src="/washio-oren.png" alt="Wash.io Logo" width={40} height={40} className="mr-2" />
                <span className="text-oren font-semibold text-xl">ash.io</span>
              </div>
              <p className="text-sm mb-4">
                Modern laundry service with premium quality for your clothes. Fast, clean, and reliable.
              </p>
            </div>
          </div>
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-oren">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>Washing</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>Ironing</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>Packing</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>Pickup & Delivery</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-oren">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>Careers</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>FAQ</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="group flex items-center hover:text-oren transition-colors text-sm">
                  <ChevronRight
                    size={14}
                    className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-oren"
                  />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-oren">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mt-1 mr-2 flex-shrink-0 text-oren" />
                <span className="text-sm">Clean Laundry St. 123, South Jakarta, 12345</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0 text-oren" />
                <span className="text-sm">+62 812 3456 7890</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0 text-oren" />
                <span className="text-sm">hello@wash.io</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Follow Us</h4>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-birtu hover:bg-oren hover:text-putih"
                >
                  <Instagram size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-birtu hover:bg-oren hover:text-putih"
                >
                  <Facebook size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-birtu hover:bg-oren hover:text-putih"
                >
                  <Twitter size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full absolute left-0 right-0 bottom-0" style={{ height: "200px" }}>
          <CSSWave height={200} />
        </div>
        <div className="relative font-regular">
          <div className="text-xs text-center text-birtu hover:text-oren">
            Developed with <span className="text-oren">♥</span> in Indonesia
          </div>
          <p className="text-sm text-center text-birtu mt-2 hover:text-oren">
            &copy; 2025 Wash.io. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
