"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Save, Plus, Trash2 } from "lucide-react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  short_name: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export function PaymentSettingsClient({
  initialData,
}: {
  initialData: Record<string, string>;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  
  // Array state for multiple payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    if (initialData.payment_methods) {
      try { return JSON.parse(initialData.payment_methods); } catch {}
    }
    if (initialData.payment_account_number) {
      return [{
        id: "legacy",
        type: initialData.payment_type || "Cá nhân",
        bank_name: initialData.payment_bank_name || "",
        account_number: initialData.payment_account_number || "",
        account_name: initialData.payment_account_name || "",
      }];
    }
    return [];
  });

  // State for dropdowns mapping method ID to dropdown open state
  const [dropdownsOpen, setDropdownsOpen] = useState<Record<string, boolean>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setBanks(data.data);
        }
      })
      .catch((err) => console.error("Failed to load banks", err));
  }, []);

  const save = async () => {
    setIsSaving(true);
    try {
      // Validate
      for (const method of paymentMethods) {
        if (!method.bank_name || !method.account_name || !method.account_number) {
          toast.error("Vui lòng điền đầy đủ thông tin cho các tài khoản!");
          setIsSaving(false);
          return;
        }
      }

      const result = await updateSettings({
        payment_methods: JSON.stringify(paymentMethods),
      });

      if (result && result.success) {
        toast.success("Đã lưu Phương thức thanh toán");
        router.refresh();
      } else {
        toast.error("Lỗi khi lưu cài đặt");
      }
    } catch (error) {
      toast.error(`Lỗi: ${error instanceof Error ? error.message : "Không thể lưu cài đặt thanh toán"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addMethod = () => {
    setPaymentMethods([...paymentMethods, {
      id: Date.now().toString(),
      type: "Cá nhân",
      bank_name: "",
      account_number: "",
      account_name: ""
    }]);
  };

  const removeMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
  };

  const updateMethod = (id: string, field: keyof PaymentMethod, value: string) => {
    setPaymentMethods(paymentMethods.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <CreditCard className="h-4 w-4 text-blue-500" />
            Cài đặt / Thanh toán
          </div>
          <h1 className="text-[14px] font-light text-slate-950">Cài đặt thanh toán</h1>
        </div>

        <div className="quote-form-actions">
          <button type="button" onClick={() => router.back()} className="quote-action-button quote-action-secondary">
            Quay lại
          </button>
          <button type="button" onClick={save} disabled={isSaving} className="quote-action-button quote-action-primary">
            <Save className="h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <section className="quote-panel">
          <div className="quote-panel-header flex justify-between items-center">
            <div>
              <h2>Thiết lập tài khoản ngân hàng</h2>
              <span>Bạn có thể thêm nhiều tài khoản để khách hàng dễ dàng thanh toán.</span>
            </div>
            <button 
              type="button" 
              onClick={addMethod}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-blue-200"
            >
              <Plus className="w-4 h-4" /> Thêm tài khoản
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            {paymentMethods.length === 0 && (
              <div className="col-span-1 xl:col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                Chưa có tài khoản nào được thiết lập.
              </div>
            )}
            {paymentMethods.map((method, index) => {
              const selectedBank = banks.find(b => b.shortName === method.bank_name || b.name === method.bank_name);
              const term = searchTerms[method.id] || "";
              const filteredBanks = banks.filter(b => 
                b.name.toLowerCase().includes(term.toLowerCase()) || 
                b.shortName.toLowerCase().includes(term.toLowerCase()) ||
                b.code.toLowerCase().includes(term.toLowerCase())
              );
              const isOpen = dropdownsOpen[method.id] || false;

              return (
                <div key={method.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button" 
                      onClick={() => removeMethod(method.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-md"
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-slate-800">Tài khoản {index + 1}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-slate-700">Loại kênh</label>
                      <div className="flex gap-6 h-10 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`type-${method.id}`}
                            checked={method.type === "Cá nhân"} 
                            onChange={() => updateMethod(method.id, "type", "Cá nhân")}
                            className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                          />
                          <span className="text-[14px] text-slate-700">Cá nhân</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`type-${method.id}`}
                            checked={method.type === "Công ty"} 
                            onChange={() => updateMethod(method.id, "type", "Công ty")}
                            className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                          />
                          <span className="text-[14px] text-slate-700">Công ty</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-[13px] font-medium text-slate-700">Ngân hàng</label>
                      
                      <div 
                        className="quote-input flex items-center justify-between cursor-pointer bg-white"
                        onClick={() => setDropdownsOpen({...dropdownsOpen, [method.id]: !isOpen})}
                      >
                        {selectedBank ? (
                          <div className="flex items-center gap-3">
                            <img src={selectedBank.logo} alt={selectedBank.shortName} className="w-6 h-6 object-contain" />
                            <span className="text-sm font-medium text-slate-900">{selectedBank.shortName} <span className="text-slate-500 text-xs ml-1">({selectedBank.code})</span></span>
                          </div>
                        ) : (
                          <span className="text-slate-400">{method.bank_name || "-- Chọn Ngân hàng --"}</span>
                        )}
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>

                      {isOpen && (
                        <div className="absolute top-[70px] z-50 w-full bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col">
                          <div className="p-2 border-b border-slate-100">
                            <input 
                              type="text" 
                              autoFocus
                              placeholder="Tìm kiếm ngân hàng..." 
                              className="w-full quote-input text-sm"
                              value={term}
                              onChange={(e) => setSearchTerms({...searchTerms, [method.id]: e.target.value})}
                            />
                          </div>
                          <div className="overflow-y-auto p-1 max-h-60">
                            {filteredBanks.map(bank => (
                              <div 
                                key={bank.id} 
                                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer rounded-md transition-colors"
                                onClick={() => {
                                  updateMethod(method.id, "bank_name", bank.shortName);
                                  setDropdownsOpen({...dropdownsOpen, [method.id]: false});
                                  setSearchTerms({...searchTerms, [method.id]: ""});
                                }}
                              >
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-md border border-slate-100 p-1">
                                   <img src={bank.logo} alt={bank.shortName} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-sm font-medium text-slate-900 truncate">{bank.shortName} <span className="text-slate-500 text-xs">({bank.code})</span></span>
                                  <span className="text-xs text-slate-500 truncate">{bank.name}</span>
                                </div>
                              </div>
                            ))}
                            {filteredBanks.length === 0 && (
                              <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy ngân hàng</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-slate-700">Số Tài khoản</label>
                      <input 
                        type="text" 
                        className="quote-input"
                        value={method.account_number}
                        onChange={(e) => updateMethod(method.id, "account_number", e.target.value)}
                        placeholder="Ví dụ: 1903939393939"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-slate-700">Tên Chủ tài khoản</label>
                      <input 
                        type="text" 
                        className="quote-input uppercase"
                        value={method.account_name}
                        onChange={(e) => updateMethod(method.id, "account_name", e.target.value.toUpperCase())}
                        placeholder="VÍ DỤ: CTY TNHH ONG VANG"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
