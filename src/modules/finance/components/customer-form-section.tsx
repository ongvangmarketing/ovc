import { ComboSelectModal as ComboSelect } from "@/components/ui/combo-select-modal";

import { cn } from "@/lib/utils/cn";

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[14px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export type CustomerFormSectionProps = {
  customerInitial: React.ReactNode;
  customerDisplayName: string;
  customerMeta: string[];
  
  targetType: "company" | "contact" | "lead";
  setTargetType: (type: "company" | "contact" | "lead") => void;

  assignees?: any[];
  assigneeId?: string;
  setAssigneeId?: (id: string) => void;

  companyId?: string;
  companySearch?: string;
  selectedCompany?: any;
  companyName: string;
  setCompanySearch?: (v: string) => void;
  handleCompanyChange?: (id: string) => void;
  setCompanyName: (v: string) => void;
  filteredCompanies?: any[];
  
  representativeName: string;
  setRepresentativeName: (v: string) => void;
  representativeTitle: string;
  setRepresentativeTitle: (v: string) => void;
  companyTaxCode: string;
  setCompanyTaxCode: (v: string) => void;

  contactId?: string;
  customerSearch?: string;
  selectedContact?: any;
  contactName: string;
  setCustomerSearch?: (v: string) => void;
  handleContactChange?: (id: string) => void;
  setContactName: (v: string) => void;
  filteredContacts?: any[];

  contactPhone: string;
  setContactPhone: (v: string) => void;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  contactAddress: string;
  setContactAddress: (v: string) => void;
  contactIdentityNumber?: string;
  setContactIdentityNumber?: (v: string) => void;
};

export function CustomerFormSection(props: CustomerFormSectionProps) {
  const {
    customerInitial, customerDisplayName, customerMeta,
    targetType, setTargetType,
    assignees, assigneeId, setAssigneeId,
    companyId, companySearch, selectedCompany, companyName, setCompanySearch, handleCompanyChange, setCompanyName, filteredCompanies,
    representativeName, setRepresentativeName, representativeTitle, setRepresentativeTitle, companyTaxCode, setCompanyTaxCode,
    contactId, customerSearch, selectedContact, contactName, setCustomerSearch, handleContactChange, setContactName, filteredContacts,
    contactPhone, setContactPhone, contactEmail, setContactEmail, contactAddress, setContactAddress, contactIdentityNumber, setContactIdentityNumber
  } = props;

  return (
    <section className="mb-8 rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
      <div className="mb-5 flex flex-col gap-2">
        <h2 className="m-0 text-[24px] font-medium tracking-tight text-black">Thông tin khách hàng</h2>
      </div>

      <div className="mb-6 flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-[16px] font-medium text-white shadow-sm">
          {customerInitial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-medium tracking-tight text-black">{customerDisplayName}</div>
          {customerMeta.length || contactAddress ? (
            <div className="mt-1 flex flex-col gap-0.5">
              {customerMeta.length > 0 && (
                <div className="truncate text-[13px] text-gray-500">
                  {customerMeta.join(" · ")}
                </div>
              )}
              {contactAddress && (
                <div className="text-[13px] text-gray-500">
                  {contactAddress}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-1 text-[13px] text-gray-400">Chưa có thông tin liên hệ.</div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <Field label="Đối tượng">
            <select className="min-h-[46px] w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
              <option value="company">Công ty</option>
              <option value="contact">Cá nhân</option>
              <option value="lead">Lead</option>
            </select>
          </Field>
          {typeof assignees !== 'undefined' && setAssigneeId && (
            <Field label="Người phụ trách">
              <ComboSelect
                label="Người phụ trách"
                value={assigneeId || ""}
                search=""
                selectedTitle={assignees.find((a: any) => a.id === assigneeId)?.name}
                onSearchChange={() => {}}
                placeholder="Gõ tên người phụ trách..."
                options={assignees}
                getTitle={(a: any) => a.name}
                onSelect={setAssigneeId}
                allowEmpty
              />
            </Field>
          )}
        </div>

        {targetType === "company" ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <div className="md:col-span-2">
                {typeof filteredCompanies !== 'undefined' && setCompanySearch && handleCompanyChange ? (
                  <Field label="Tên công ty">
                    <ComboSelect
                      label="Tên công ty"
                      value={companyId || ""}
                      search={companySearch || ""}
                      selectedTitle={selectedCompany?.name || companyName}
                      onSearchChange={setCompanySearch}
                      placeholder="Gõ tên công ty..."
                      options={filteredCompanies}
                      getTitle={(c: any) => c.name}
                      getSubtitle={(c: any) => c.taxCode || ""}
                      onSelect={handleCompanyChange}
                      allowEmpty
                    />
                  </Field>
                ) : (
                  <Field label="Tên công ty">
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Tên công ty" />
                  </Field>
                )}
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <Field label="Người đại diện">
                <input value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Tên người đại diện..." />
              </Field>
              <Field label="Chức danh">
                <input value={representativeTitle} onChange={(e) => setRepresentativeTitle(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Ví dụ: Giám đốc..." />
              </Field>
            </div>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <Field label="Mã số thuế">
                <input value={companyTaxCode} onChange={(e) => setCompanyTaxCode(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Nhập MST..." />
              </Field>
              <Field label="Số điện thoại">
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="09xxxx..." />
              </Field>
            </div>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <Field label="Email">
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="email@..." />
              </Field>
              <Field label="Địa chỉ">
                <input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Số nhà, đường..." />
              </Field>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              {typeof filteredContacts !== 'undefined' && setCustomerSearch && handleContactChange ? (
                <Field label="Tên khách hàng">
                  <ComboSelect
                    label="Tên khách hàng"
                    value={contactId || ""}
                    search={customerSearch || ""}
                    selectedTitle={selectedContact?.name || contactName}
                    onSearchChange={setCustomerSearch}
                    placeholder="Gõ tên khách hàng..."
                    options={filteredContacts}
                    getTitle={(c: any) => c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim()}
                    getSubtitle={(c: any) => c.email || ""}
                    onSelect={handleContactChange}
                    allowEmpty
                  />
                </Field>
              ) : (
                <Field label="Tên khách hàng">
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Tên khách hàng" />
                </Field>
              )}
              {setContactIdentityNumber ? (
                <Field label="CCCD/CMND">
                  <input value={contactIdentityNumber || ""} onChange={(e) => setContactIdentityNumber(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Số CCCD..." />
                </Field>
              ) : (
                <div />
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <Field label="Số điện thoại">
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="09xxxx..." />
              </Field>
              <Field label="Email">
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="email@..." />
              </Field>
            </div>
            <div className="grid gap-6 md:grid-cols-1 items-start">
              <Field label="Địa chỉ">
                <input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[14px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Số nhà, đường..." />
              </Field>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
