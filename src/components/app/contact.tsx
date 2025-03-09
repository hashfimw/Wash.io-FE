  "use client"

  import React, { useEffect, useState } from 'react';
  import LaundrySearchBar from './searchbar';

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
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    
    const [status, setStatus] = useState<StatusState>({
      submitted: false,
      submitting: false,
      info: { error: false, msg: null }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus({
        submitted: false,
        submitting: true,
        info: { error: false, msg: null }
      });
    
      try {
        const response = await fetch(`${base_url}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      
        const text = await response.text(); // Dapatkan teks respons
        console.log("Raw response:", text); // Debugging
      
        const result = JSON.parse(text); // Ubah ke JSON
        console.log("Parsed JSON:", result);
      
        if (response.ok) {
          setStatus({
            submitted: true,
            submitting: false,
            info: { error: false, msg: "Thank you! Your message has been sent successfully." }
          });
          setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } else {
          throw new Error(result.message || "Something went wrong!");
        }
      } catch (error) {
        console.error("Error:", error);
        setStatus({
          submitted: false,
          submitting: false,
          info: { error: true, msg: (error as Error).message }
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-36">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-birtu mb-4">Contact Us</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="bg-birmud rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-birtu mb-6">Get In Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-oren p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-putih">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-birtu">Phone</h3>
                    <p className="mt-1 text-gray-600">(123) 456-7890</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-oren p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-putih">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-birtu">Email</h3>
                    <p className="mt-1 text-gray-600">contact@yourlaundry.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-oren p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-putih">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-birtu">Location</h3>
                    <p className="mt-1 text-gray-600">123 Laundry Street, Clean City</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-oren p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-putih">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-birtu">Business Hours</h3>
                    <p className="mt-1 text-gray-600">Mon - Fri: 8AM - 8PM</p>
                    <p className="text-gray-600">Sat - Sun: 9AM - 6PM</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-birtu mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/" target="_blank" className="bg-birtu p-3 rounded-full text-putih hover:bg-oren transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" className="bg-birtu p-3 rounded-full text-putih hover:bg-oren transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="https://x.com/" target="_blank" className="bg-birtu p-3 rounded-full text-putih hover:bg-oren transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-putih rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-birtu mb-6">Send Us a Message</h2>
              
              {status.info.msg && (
                <div className={`p-4 rounded-md mb-6 ${status.info.error ? 'bg-red-100 text-red-700' : 'bg-birmud text-birtu'}`}>
                  {status.info.msg}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-birtu mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-birtu mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-birtu mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-birtu mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-birtu mb-1">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-birmud rounded-md focus:outline-none focus:ring-2 focus:ring-birtu"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={status.submitting}
                  className={`w-full bg-oren text-putih font-medium py-3 px-6 rounded-md hover:bg-birtu transition-colors duration-300 ${status.submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {status.submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ContactPage;