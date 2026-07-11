"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon, LinkIcon } from "lucide-react";

interface MultiImageUploadProps {
  name: string;
  defaultValue?: string[]; // Array of image URLs
  label: string;
  helperText?: string;
}

export function MultiImageUpload({ name, defaultValue = [], label, helperText }: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(defaultValue);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let tooLarge = false;
    const newImages: string[] = [];
    
    let processed = 0;
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        tooLarge = true;
        processed++;
        checkDone();
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
        }
        processed++;
        checkDone();
      };
      reader.readAsDataURL(file);
    });
    
    function checkDone() {
      if (processed === files.length) {
        if (tooLarge) alert("Một số file quá lớn (>2MB) đã bị bỏ qua.");
        if (newImages.length > 0) {
          setImages(prev => [...prev, ...newImages]);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      setImages(prev => [...prev, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 rounded-xl p-0 bg-transparent">
      <div className="flex flex-col gap-1">
        <label className="text-[14px] font-semibold text-gray-900">{label}</label>
        {helperText && <p className="text-[13px] text-gray-500">{helperText}</p>}
      </div>
      
      {/* Hidden input to submit JSON array */}
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-video border border-[#eaeaea] rounded-xl overflow-hidden group bg-white shadow-sm">
            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-[#eaeaea] text-gray-600 p-1.5 rounded-full hover:bg-white hover:text-red-600 hover:border-red-200 shadow-sm transition-all opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video border border-dashed border-[#eaeaea] bg-white hover:bg-gray-50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group"
        >
          <div className="w-8 h-8 bg-white border border-[#eaeaea] rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Upload className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-[13px] font-medium text-gray-900">Tải ảnh lên</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      <div className="pt-2 flex items-center gap-3">
        <div className="relative flex-1">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <LinkIcon className="h-4 w-4 text-gray-400" />
           </div>
           <input 
             type="url" 
             placeholder="Hoặc dán URL ảnh vào đây..."
             value={urlInput}
             onChange={e => setUrlInput(e.target.value)}
             onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
             className="w-full pl-9 pr-3 h-10 bg-white border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors shadow-sm"
           />
        </div>
        <button 
          type="button" 
          onClick={addUrl}
          className="h-10 px-5 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          Thêm
        </button>
      </div>
    </div>
  );
}
