"use client";

import React, { useEffect, useState } from "react";
import LaundrySearchBar from "./searchbar";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const base_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface StatusInfo {
  error: boolean;
  msg: string | null;
}

interface StatusState {
  submitted: boolean;
  submitting: boolean;
  info: StatusInfo;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<StatusState>({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({
      submitted: false,
      submitting: true,
      info: { error: false, msg: null },
    });

    try {
      const response = await fetch(`${base_url}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      console.log("Raw response:", text);

      const result = JSON.parse(text);
      console.log("Parsed JSON:", result);

      if (response.ok) {
        setStatus({
          submitted: true,
          submitting: false,
          info: {
            error: false,
            msg: "Thank you! Your message has been sent successfully.",
          },
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(result.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus({
        submitted: false,
        submitting: false,
        info: { error: true, msg: (error as Error).message },
      });
    }
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Contact info items
  const contactItems = [
    {
      icon: <Phone size={24} />,
      title: "Phone",
      content: "+62 812 3456 7890",
    },
    {
      icon: <Mail size={24} />,
      title: "Email",
      content: "hello@washio.com",
    },
    {
      icon: <MapPin size={24} />,
      title: "Location",
      content: "Clean Laundry St. 123, South Jakarta, 12345",
    },
    {
      icon: <Clock size={24} />,
      title: "Business Hours",
      content: ["24 Hours"],
    },
  ];

  // Social media links
  const socialLinks = [
    {
      icon: <Facebook size={20} />,
      url: "https://www.facebook.com/",
      label: "Facebook",
    },
    {
      icon: <Instagram size={20} />,
      url: "https://www.instagram.com/",
      label: "Instagram",
    },
    {
      icon: <Twitter size={20} />,
      url: "https://x.com/",
      label: "Twitter",
    },
  ];
  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white min-h-screen text-start p-4 mb-24">
      {/* Navbar Sticky dengan Search Bar */}
      <div
        className={`fixed top-0 left-80 right-80 z-50 transition-all ${
          isScrolled ? "bg-transparent" : "bg-transparent py-6"
        }`}
      >
        <div className="hidden md:flex w-50 mx-auto px-4">
          <LaundrySearchBar />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32">
        {/* Header with decorative elements */}
        <div className="text-center mb-8 sm:mb-12 relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-birtu mb-4 relative inline-block">
            Contact Us
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-oren rounded-full"></div>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Have questions about our services? Need to schedule a pickup? We&apos;re
            here to help! Reach out through any of the methods below.
          </p>
        </div>

        {/* Contact content in grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* Contact Info Card */}
          <div className="bg-birmud rounded-lg shadow-lg p-5 sm:p-6 md:p-8 border-t-4 border-oren transform transition-all hover:shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-birtu mb-6 flex items-center">
              <span className="bg-oren text-white p-1 rounded mr-2 inline-flex">
                <Mail size={20} />
              </span>
              Get In Touch
            </h2>

            <div className="space-y-5 sm:space-y-6">
              {contactItems.map((item, index) => (
                <div key={index} className="flex items-start group">
                  <div className="flex-shrink-0 bg-oren p-2 sm:p-3 rounded-full text-putih group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base sm:text-lg font-medium text-birtu">
                      {item.title}
                    </h3>
                    {Array.isArray(item.content) ? (
                      item.content.map((line, i) => (
                        <p
                          key={i}
                          className="text-sm sm:text-base text-gray-600"
                        >
                          {line}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm sm:text-base text-gray-600">
                        {item.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social media links */}
            <div className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-medium text-birtu mb-3 sm:mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-3 sm:space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    aria-label={social.label}
                    className="bg-birtu p-2 sm:p-3 rounded-full text-putih hover:bg-oren transform hover:scale-110 transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-putih rounded-lg shadow-lg p-5 sm:p-6 md:p-8 border-t-4 border-birtu transform transition-all hover:shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold text-birtu mb-6 flex items-center">
              <span className="bg-birtu text-white p-1 rounded mr-2 inline-flex">
                <Send size={20} />
              </span>
              Send Us a Message
            </h2>

            {/* Status message */}
            {status.info.msg && (
              <div
                className={`p-4 rounded-md mb-6 flex items-center ${
                  status.info.error
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {status.info.error ? (
                  <AlertCircle className="mr-2 flex-shrink-0" size={20} />
                ) : (
                  <CheckCircle className="mr-2 flex-shrink-0" size={20} />
                )}
                <span>{status.info.msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="form-group">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-birtu mb-1"
                  >
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu text-sm sm:text-base transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-birtu mb-1"
                  >
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu text-sm sm:text-base transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="form-group">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-birtu mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu text-sm sm:text-base transition-all"
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-birtu mb-1"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu text-sm sm:text-base transition-all"
                    placeholder="Service Inquiry"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-birtu mb-1"
                >
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu text-sm sm:text-base resize-none transition-all"
                  placeholder="How can we help you today?"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status.submitting}
                className={`w-full bg-oren text-putih font-medium py-2.5 sm:py-3 px-6 rounded-md hover:bg-birtu transition-all duration-300 flex items-center justify-center ${
                  status.submitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-lg transform hover:-translate-y-1"
                }`}
              >
                {status.submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ or Additional Info Section */}
        <div className="mt-12 sm:mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-birtu">
              Frequently Asked Questions
            </h2>
            <div className="w-20 h-1 bg-oren mx-auto mt-2 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-birtu mb-2">
                  How quickly can I get my laundry done?
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Our standard service is 24-48 hours, but we also offer express
                  service with same-day turnaround for an additional fee.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
