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
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex bg-gray-100 p-0.5 rounded text-[11px]">
          <button 
            type="button" 
            onClick={() => setMode("file")}
            className={`px-2 py-1 rounded flex items-center gap-1 ${mode === "file" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            <Upload className="w-3 h-3" /> File
          </button>
          <button 
            type="button" 
            onClick={() => setMode("url")}
            className={`px-2 py-1 rounded flex items-center gap-1 ${mode === "url" ? "bg-white shadow-sm font-medium" : "text-gray-500"}`}
          >
            <LinkIcon className="w-3 h-3" /> URL
          </button>
        </div>
      </div>
      
      {/* Hidden input to store the actual value submitted with the form */}
      <input type="hidden" name={name} value={preview || ""} />
      
      <div className={`relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 group transition-colors ${!preview ? 'hover:bg-gray-100 hover:border-gray-400 cursor-pointer' : ''} ${aspectClass}`}>
        
        {preview ? (
          <div className="w-full h-full relative">
            <img src={preview} alt="Preview" className="w-full h-full object-contain bg-white" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 shadow-sm transition-transform active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : mode === "file" ? (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">Click để chọn ảnh</p>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">PNG, JPG, GIF tối đa 2MB. Sẽ được nén dạng Base64.</p>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onBlur={(e) => {
                    if (e.target.value) setPreview(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setPreview(e.currentTarget.value);
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">Dán URL ảnh và nhấn Enter hoặc Click ra ngoài.</p>
             </div>
          </div>
        )}
      </div>
      
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
