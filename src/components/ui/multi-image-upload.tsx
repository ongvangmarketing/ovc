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
    <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-800">{label}</label>
        {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
      
      {/* Hidden input to submit JSON array */}
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-video border border-gray-200 rounded-lg overflow-hidden group bg-white shadow-sm">
            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-blue-600"
        >
          <Upload className="w-6 h-6 mb-2 opacity-70" />
          <span className="text-sm font-medium">Tải ảnh lên</span>
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
      
      <div className="pt-2 flex items-center gap-2">
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
             className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
        </div>
        <button 
          type="button" 
          onClick={addUrl}
          className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors"
        >
          Thêm
        </button>
      </div>
    </div>
  );
}
