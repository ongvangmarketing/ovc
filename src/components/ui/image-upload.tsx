"use client";

import { useState, useRef } from "react";
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  name: string;
  defaultValue?: string;
  label: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export function ImageUpload({ name, defaultValue, label, helperText, aspectRatio = "auto" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue?.trim() ? defaultValue : null);
  const [mode, setMode] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước file quá lớn. Vui lòng chọn file dưới 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const aspectClass = aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "h-32";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[14px] font-semibold text-gray-900">{label}</label>
        <div className="flex bg-gray-100/50 p-1 rounded-lg border border-[#eaeaea]">
          <button 
            type="button" 
            onClick={() => setMode("file")}
            className={`px-3 py-1 rounded-md text-[13px] flex items-center gap-1.5 transition-all ${mode === "file" ? "bg-white shadow-sm font-medium text-black" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Upload className="w-3.5 h-3.5" /> File
          </button>
          <button 
            type="button" 
            onClick={() => setMode("url")}
            className={`px-3 py-1 rounded-md text-[13px] flex items-center gap-1.5 transition-all ${mode === "url" ? "bg-white shadow-sm font-medium text-black" : "text-gray-500 hover:text-gray-900"}`}
          >
            <LinkIcon className="w-3.5 h-3.5" /> URL
          </button>
        </div>
      </div>
      
      {/* Hidden input to store the actual value submitted with the form */}
      <input type="hidden" name={name} value={preview || ""} />
      
      <div className={`relative border border-dashed border-[#eaeaea] rounded-xl overflow-hidden group transition-all duration-200 ${!preview ? 'hover:bg-gray-50 hover:border-gray-400 cursor-pointer bg-white' : 'bg-gray-50'} ${aspectClass}`}>
        
        {preview ? (
          <div className="w-full h-full relative group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover" 
              onError={() => setPreview(null)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-[#eaeaea] text-gray-600 p-1.5 rounded-full hover:bg-white hover:text-red-600 hover:border-red-200 shadow-sm transition-all opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : mode === "file" ? (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-10 h-10 bg-white border border-[#eaeaea] rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-[13px] font-medium text-gray-900">Click để chọn ảnh</p>
            <p className="text-[12px] text-gray-500 mt-1">PNG, JPG, GIF tối đa 2MB.</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
             <div className="w-full max-w-sm">
                <input 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  className="w-full h-9 border border-[#eaeaea] rounded-lg px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                  onBlur={(e) => {
                    if (e.target.value.trim()) setPreview(e.target.value.trim());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (e.currentTarget.value.trim()) setPreview(e.currentTarget.value.trim());
                    }
                  }}
                />
                <p className="text-[12px] text-gray-500 mt-2">Dán URL ảnh và nhấn Enter.</p>
             </div>
          </div>
        )}
      </div>
      
      {helperText && <p className="text-[13px] text-gray-500">{helperText}</p>}
    </div>
  );
}
