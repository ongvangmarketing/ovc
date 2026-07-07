"use client";

import React, { useState } from "react";

export default function LeadForm({ binding, design }: { binding: any; design: any }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const layoutClass = design?.layout === "horizontal" ? "flex flex-row gap-4 items-end" : "flex flex-col gap-4";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Add client-side tracking data (UTM, referrer, etc.)
    const searchParams = new URLSearchParams(window.location.search);
    const tracking = {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      referrer: document.referrer,
      device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      url: window.location.href,
    };

    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: binding?.formId || "default", // Should be configured in GrapesJS settings
          fullName: data.name as string,
          email: data.email as string || "",
          phone: data.phone as string,
          utmSource: tracking.utm_source || "Web Builder",
        }),
      });

      if (res.ok) {
        setStatus("success");
        e.currentTarget.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md my-8">
      <h3 className="text-2xl font-bold mb-4 text-center">Contact Us</h3>
      
      {status === "success" ? (
        <div className="p-4 bg-green-100 text-green-700 rounded-md text-center">
          Thank you! We have received your request and will contact you shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={layoutClass}>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name" 
              required 
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              required 
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          {design?.layout !== "horizontal" && (
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input 
                type="email" 
                name="email" 
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          )}
          
          <div className="w-full mt-2">
            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Submitting..." : (design?.button_text || "Submit")}
            </button>
          </div>
          
          {status === "error" && (
            <div className="w-full text-red-500 text-sm mt-2 text-center">
              An error occurred. Please try again.
            </div>
          )}
        </form>
      )}
    </div>
  );
}
