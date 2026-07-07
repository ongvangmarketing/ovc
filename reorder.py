import re
import sys

def extract_sections(content):
    # Find the form opening tag
    form_match = re.search(r'<form\b[^>]*>', content)
    if not form_match:
        return content
    form_start = form_match.end()
    
    # Find the form closing tag (assumes it's the last </form>)
    form_end = content.rfind('</form>')
    if form_end == -1:
        return content

    before_form = content[:form_start]
    after_form = content[form_end:]
    
    form_content = content[form_start:form_end]
    
    # Simple parsing to extract sections.
    # We will split by <section className="quote-panel
    parts = re.split(r'(?=<section className="quote-panel)', form_content)
    
    # Now we have parts. 
    sections = {}
    other_parts = []
    
    for part in parts:
        if part.strip() == '':
            continue
        if part.startswith('<section className="quote-panel'):
            # Determine the type of section by checking the h2 tag inside
            if '<h2>Thông tin chung</h2>' in part:
                sections['ThongTinChung'] = part
            elif '<h2>Khách hàng' in part:
                sections['KhachHang'] = part
            elif '<h2>Tệp đính kèm</h2>' in part:
                sections['TepDinhKem'] = part
            elif '<h2>Kênh thanh toán</h2>' in part:
                sections['KenhThanhToan'] = part
            elif 'Nội dung công việc' in part:
                sections['NoiDungCongViec'] = part
            elif '<h2>Kế hoạch thanh toán</h2>' in part:
                sections['KeHoachThanhToan'] = part
            elif '<h2>Thanh toán</h2>' in part:
                sections['ThanhToan'] = part
            elif '<h2>Nội dung chi tiết</h2>' in part:
                sections['NoiDungChiTiet'] = part
            else:
                other_parts.append(part)
        elif part.startswith('{mode === "edit" ? (\n          <section className="quote-panel">\n            <div className="quote-panel-header">\n              <h2>Thanh toán</h2>'):
            sections['ThanhToan'] = part
        else:
            if 'Thanh toán</h2>' in part and 'mode === "edit"' in part:
                sections['ThanhToan'] = part
            else:
                other_parts.append(part)
                
    return sections, before_form, after_form, other_parts

def process_file(filepath, layout):
    with open(filepath, 'r') as f:
        content = f.read()

    # For quotation, fix the form class first
    content = content.replace('<form id="quotation-form" onSubmit={handleSubmit} className="space-y-5">', '<form id="quotation-form" onSubmit={handleSubmit} className="quote-form-grid">')
    
    # Also fix quotation's ThongTinChung section class to include sidebar
    if 'quotation-form-client.tsx' in filepath:
        content = content.replace('<section className="quote-panel">\n            <div className="quote-panel-header">\n              <h2>Thông tin chung</h2>', '<section className="quote-panel quote-payment-sidebar">\n            <div className="quote-panel-header">\n              <h2>Thông tin chung</h2>')
        # Change md:grid-cols-4 to grid-cols-2 and md:col-span-3 to col-span-2 in ThongTinChung
        content = content.replace('md:grid-cols-4', 'grid-cols-2').replace('md:col-span-3', 'col-span-2')

    result = extract_sections(content)
    if isinstance(result, str):
        print(f"Could not parse {filepath}")
        return
        
    sections, before_form, after_form, other_parts = result
    
    # Reassemble based on layout
    new_form_content = ""
    for sec_name in layout:
        if sec_name in sections:
            new_form_content += sections[sec_name]
            
    # append other parts that we might have missed just in case (e.g., whitespace or unrelated JSX inside form)
    for p in other_parts:
        if p.strip() != '':
            new_form_content += p
            
    new_content = before_form + new_form_content + after_form
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Processed {filepath}")

layout = [
    'ThongTinChung',
    'KhachHang',
    'KenhThanhToan',
    'NoiDungCongViec',
    'KeHoachThanhToan',
    'ThanhToan',
    'TepDinhKem',
    'NoiDungChiTiet'
]

process_file('src/modules/finance/components/contract-form-client.tsx', layout)
process_file('src/modules/finance/components/invoice-form-client.tsx', layout)
process_file('src/modules/finance/components/quotation-form-client.tsx', layout)

