import re
import sys

def add_address_to_type(content):
    return re.sub(r'(email\?: string \| null;.*?)(?=\n};)', r'\1\n  address?: string | null;', content, flags=re.DOTALL)

def add_contact_info_block(content):
    # Find the Khách hàng ComboSelect block
    
    # We want to wrap the <ComboSelect label="Khách hàng"... /> in a div and add the info block below it.
    # It's tricky to match the whole ComboSelect block reliably with regex because of nested parens and props.
    # We'll match from `<ComboSelect\s+label="Khách hàng"` up to the next `/>`
    
    pattern = r'(<ComboSelect\s+label="Khách hàng".*?/>)'
    
    replacement = r'''<div>
              \1
              {selectedContact && (
                <div className="mt-2 rounded-md bg-slate-50 p-3 text-[13px] text-slate-600 border border-slate-200 space-y-1">
                  <div className="font-medium text-slate-800">{contactLabel(selectedContact)}</div>
                  {selectedContact.phone && <div><span className="text-slate-400">SĐT:</span> {selectedContact.phone}</div>}
                  {selectedContact.email && <div><span className="text-slate-400">Email:</span> {selectedContact.email}</div>}
                  {selectedContact.address && <div><span className="text-slate-400">Địa chỉ:</span> {selectedContact.address}</div>}
                </div>
              )}
            </div>'''
            
    # Also need to handle targetType in quotation-form-client
    pattern_company = r'(<ComboSelect\s+label="Công ty".*?/>)'
    replacement_company = r'''<div>
                  \1
                  {selectedCompany && (
                    <div className="mt-2 rounded-md bg-slate-50 p-3 text-[13px] text-slate-600 border border-slate-200 space-y-1">
                      <div className="font-medium text-slate-800">{selectedCompany.name}</div>
                      {selectedCompany.phone && <div><span className="text-slate-400">SĐT:</span> {selectedCompany.phone}</div>}
                      {selectedCompany.email && <div><span className="text-slate-400">Email:</span> {selectedCompany.email}</div>}
                      {selectedCompany.address && <div><span className="text-slate-400">Địa chỉ:</span> {selectedCompany.address}</div>}
                    </div>
                  )}
                </div>'''
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Only quotation-form-client has selectedCompany
    if 'selectedCompany' in content:
        content = re.sub(pattern_company, replacement_company, content, flags=re.DOTALL)
        
    return content

files = [
    'src/modules/finance/components/contract-form-client.tsx',
    'src/modules/finance/components/invoice-form-client.tsx',
    'src/modules/finance/components/quotation-form-client.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
        
    # 1. Add address to ContactOption
    content = add_address_to_type(content)
    # 2. Add address to CompanyOption (only in quotation)
    content = re.sub(r'(type CompanyOption = \{.*?)(?=\n\};)', r'\1\n  address?: string | null;\n  phone?: string | null;\n  email?: string | null;', content, flags=re.DOTALL)
    
    # 3. Add contact details block
    content = add_contact_info_block(content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Processed {filepath}")
