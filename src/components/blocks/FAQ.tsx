"use client";

import React, { useState } from "react";

export default function FAQ({ design }: { design: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = design?.faqs || [
    { q: "What is your return policy?", a: "We offer a 30-day money-back guarantee on all our products. If you are not satisfied with your purchase, you can return it for a full refund, no questions asked." },
    { q: "How long does shipping take?", a: "Usually 3-5 business days for domestic orders and 7-14 days for international orders. Tracking numbers are provided within 24 hours of purchase." },
    { q: "Do you offer international shipping?", a: "Yes, we ship to over 50 countries worldwide. Shipping costs will apply, and will be added at checkout." },
    { q: "Can I cancel my subscription?", a: "Yes, you can cancel your subscription at any time from your account settings. You will retain access to the platform until the end of your billing period." },
    { q: "Is there a free trial available?", a: "Absolutely! We offer a 14-day free trial on all our premium plans so you can test all the features before making a commitment." },
  ];

  return (
    <div className="w-full py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
            {design?.title || "Frequently asked questions"}
          </h2>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Reach out to our <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">customer support</a> team.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq: any, i: number) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-200 bg-blue-50/40 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full px-6 py-6 flex justify-between items-center focus:outline-none"
                >
                  <span className={`text-left font-semibold text-lg ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
                    {faq.q}
                  </span>
                  <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className={`h-6 w-6 ${isOpen ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-base text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
