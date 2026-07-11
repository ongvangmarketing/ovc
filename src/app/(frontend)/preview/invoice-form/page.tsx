import React from "react";
import { ArrowLeft, Plus, Trash2, Calendar, FileText, ChevronDown } from "lucide-react";

export default function InvoiceFormPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#eaeaea]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-[14px] font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-4 w-px bg-[#eaeaea]"></div>
            <span className="rounded-full bg-gray-50 border border-[#eaeaea] text-gray-600 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">
              Draft
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-[#eaeaea] bg-white px-5 py-2 text-[14px] font-medium text-black hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            <button className="rounded-full bg-black text-white px-5 py-2 text-[14px] font-medium hover:bg-gray-800 transition-colors">
              Send Invoice
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-[48px] md:text-[56px] font-medium tracking-tighter leading-[1.05] text-black">
            Create Invoice
          </h1>
          <p className="text-[16px] text-gray-500 leading-relaxed mt-4 max-w-2xl">
            Create and send professional invoices to your clients. 
            All changes are autosaved as a draft.
          </p>
        </div>

        <div className="space-y-8">
          {/* Settings Card: Invoice Details */}
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">
                Invoice Details
              </h2>
              <p className="text-[14px] text-gray-500 mb-8">
                Basic information about this invoice and payment terms.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    defaultValue="INV-2026-0001"
                    className="w-full border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                    Client
                  </label>
                  <div className="relative">
                    <select className="w-full border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] appearance-none focus:outline-none focus:border-black transition-colors bg-white">
                      <option>Select a client...</option>
                      <option>Acme Corp</option>
                      <option>Global Industries</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                    Issue Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-black transition-colors bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-black transition-colors bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Footer Area */}
            <div className="bg-gray-50/50 border-t border-[#eaeaea] px-6 py-4 md:px-8 flex items-center justify-between">
              <span className="text-[13px] text-gray-500">Invoice prefix can be changed in settings.</span>
            </div>
          </div>

          {/* Settings Card: Line Items */}
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">
                Line Items
              </h2>
              <p className="text-[14px] text-gray-500 mb-8">
                Add products or services you are billing for.
              </p>

              <div className="w-full border border-[#eaeaea] rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 bg-gray-50/50 border-b border-[#eaeaea] p-4 text-[11px] uppercase tracking-widest text-gray-400 font-medium">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>

                {/* Table Row */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#eaeaea] items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Service description"
                      defaultValue="Website Redesign"
                      className="w-full border border-transparent hover:border-[#eaeaea] focus:border-[#eaeaea] rounded-md px-2 py-1.5 text-[14px] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      defaultValue="1"
                      className="w-full border border-transparent hover:border-[#eaeaea] focus:border-[#eaeaea] rounded-md px-2 py-1.5 text-[14px] text-right focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      defaultValue="4500"
                      className="w-full border border-transparent hover:border-[#eaeaea] focus:border-[#eaeaea] rounded-md px-2 py-1.5 text-[14px] text-right focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-4">
                    <span className="text-[14px] text-black font-medium">$4,500.00</span>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Table Row 2 */}
                <div className="grid grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Service description"
                      defaultValue="Monthly Maintenance"
                      className="w-full border border-transparent hover:border-[#eaeaea] focus:border-[#eaeaea] rounded-md px-2 py-1.5 text-[14px] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      defaultValue="3"
                      className="w-full border border-transparent hover:border-[#eaeaea] focus:border-[#eaeaea] rounded-md px-2 py-1.5 text-[14px] text-right focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      defaultValue="200"
                      className="w-full border border-transparent hover:border-[#eaeaea] focus:border-[#eaeaea] rounded-md px-2 py-1.5 text-[14px] text-right focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-4">
                    <span className="text-[14px] text-black font-medium">$600.00</span>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button className="flex items-center gap-2 text-[14px] font-medium text-black hover:text-gray-600 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Line Item
                </button>
              </div>

              {/* Totals Section */}
              <div className="mt-12 flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-4">
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-black">$5,100.00</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px]">
                    <span className="text-gray-500">Tax (10%)</span>
                    <span className="text-black">$510.00</span>
                  </div>
                  <div className="h-px bg-[#eaeaea] w-full my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-[16px] font-medium text-black">Total</span>
                    <span className="text-[24px] font-medium tracking-tight text-black">$5,610.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Card: Notes */}
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-[20px] font-medium tracking-tight text-black mb-1">
                Additional Notes
              </h2>
              <p className="text-[14px] text-gray-500 mb-6">
                Any special instructions or terms for this invoice.
              </p>
              
              <textarea 
                rows={4}
                placeholder="Thank you for your business..."
                className="w-full border border-[#eaeaea] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-black transition-colors"
                defaultValue="Please pay within 15 days of receiving this invoice."
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
