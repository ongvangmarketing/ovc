"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, MapPin, Bus, Utensils, BedDouble, Save, Loader2 } from "lucide-react";
import { saveItineraryDay, deleteItineraryDay } from "./actions";
import { TourItinerary } from "@prisma/client";

export default function ItineraryBuilder({ 
  tourId, 
  initialItineraries 
}: { 
  tourId: string, 
  initialItineraries: TourItinerary[] 
}) {
  const [itineraries, setItineraries] = useState(initialItineraries || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState<any>({});

  const handleEdit = (day: TourItinerary) => {
    setEditingId(day.id);
    setExpandedId(day.id);
    setFormData({
      ...day,
      meals: day.meals || { breakfast: false, lunch: false, dinner: false }
    });
  };

  const handleAddNew = () => {
    const nextDay = itineraries.length > 0 ? Math.max(...itineraries.map(i => i.dayNumber)) + 1 : 1;
    const newId = `new-${Date.now()}`;
    
    const newDay = {
      id: newId,
      tourId,
      dayNumber: nextDay,
      title: "",
      description: "",
      hotelName: "",
      location: "",
      transport: "",
      meals: { breakfast: false, lunch: false, dinner: false },
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setFormData(newDay);
    setEditingId(newId);
    setExpandedId(newId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const dayId = editingId?.startsWith('new-') ? null : editingId;
    
    const res = await saveItineraryDay(tourId, dayId, formData);
    
    if (res.success) {
      alert("Lưu thành công!");
      setEditingId(null);
      window.location.reload(); // Simple reload to get fresh data
    } else {
      alert("Lỗi: " + res.error);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('new-')) {
      setEditingId(null);
      setExpandedId(null);
      return;
    }
    
    if (confirm("Xóa ngày lịch trình này?")) {
      const res = await deleteItineraryDay(tourId, id);
      if (res.success) {
        window.location.reload();
      } else {
        alert("Lỗi: " + res.error);
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[24px] font-medium tracking-tight text-black">Lịch trình chi tiết</h2>
          <p className="text-[14px] text-gray-500">Kéo thả để sắp xếp hoặc chỉnh sửa lịch trình theo ngày.</p>
        </div>
        <button 
          onClick={handleAddNew}
          disabled={editingId !== null}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Thêm ngày
        </button>
      </div>

      <div className="space-y-4">
        {(editingId?.startsWith('new-') ? [...itineraries, formData] : itineraries).map((day) => {
          const isEditing = editingId === day.id;
          const isExpanded = expandedId === day.id || isEditing;

          return (
            <div key={day.id} className="bg-white rounded-xl border border-[#eaeaea] overflow-hidden transition-all shadow-sm">
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => !isEditing && setExpandedId(isExpanded ? null : day.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-[14px] min-w-[70px] text-center">
                    Ngày {isEditing ? formData.dayNumber : day.dayNumber}
                  </div>
                  <div className="font-medium text-[16px] text-black">
                    {isEditing ? formData.title || "Nhập tiêu đề..." : day.title}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {!isEditing && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(day); }}
                        className="text-[13px] text-indigo-600 font-medium hover:underline px-2"
                      >
                        Chỉnh sửa
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(day.id); }}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Content */}
              {isExpanded && (
                <div className="border-t border-[#eaeaea] p-6 bg-gray-50/30">
                  {isEditing ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                          <label className="block text-[12px] font-medium text-gray-500 mb-1 uppercase">Ngày thứ</label>
                          <input 
                            type="number" 
                            min="1"
                            value={formData.dayNumber}
                            onChange={(e) => setFormData({...formData, dayNumber: parseInt(e.target.value)})}
                            className="w-full rounded border border-[#eaeaea] px-3 py-2 text-[14px] outline-none focus:border-black"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[12px] font-medium text-gray-500 mb-1 uppercase">Tiêu đề hành trình</label>
                          <input 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="VD: Khám phá Vịnh Hạ Long"
                            className="w-full rounded border border-[#eaeaea] px-3 py-2 text-[14px] outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[12px] font-medium text-gray-500 mb-1 uppercase">Mô tả hoạt động</label>
                        <textarea 
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Chi tiết lịch trình..."
                          className="w-full rounded border border-[#eaeaea] px-3 py-2 text-[14px] outline-none focus:border-black"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-3 p-4 border border-[#eaeaea] rounded-lg bg-white">
                          <h4 className="text-[13px] font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500" /> Điểm đến</h4>
                          <input 
                            type="text" 
                            value={formData.location || ""}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="Nhập địa điểm..."
                            className="w-full rounded border border-[#eaeaea] px-3 py-2 text-[13px] outline-none focus:border-black"
                          />
                        </div>

                        <div className="flex flex-col gap-3 p-4 border border-[#eaeaea] rounded-lg bg-white">
                          <h4 className="text-[13px] font-semibold flex items-center gap-2"><Bus className="w-4 h-4 text-blue-500" /> Di chuyển</h4>
                          <input 
                            type="text" 
                            value={formData.transport || ""}
                            onChange={(e) => setFormData({...formData, transport: e.target.value})}
                            placeholder="VD: Xe buýt / Máy bay (2 tiếng)"
                            className="w-full rounded border border-[#eaeaea] px-3 py-2 text-[13px] outline-none focus:border-black"
                          />
                        </div>

                        <div className="flex flex-col gap-3 p-4 border border-[#eaeaea] rounded-lg bg-white">
                          <h4 className="text-[13px] font-semibold flex items-center gap-2"><BedDouble className="w-4 h-4 text-purple-500" /> Lưu trú</h4>
                          <input 
                            type="text" 
                            value={formData.hotelName || ""}
                            onChange={(e) => setFormData({...formData, hotelName: e.target.value})}
                            placeholder="VD: Intercontinental 5 Sao"
                            className="w-full rounded border border-[#eaeaea] px-3 py-2 text-[13px] outline-none focus:border-black"
                          />
                        </div>

                        <div className="flex flex-col gap-3 p-4 border border-[#eaeaea] rounded-lg bg-white">
                          <h4 className="text-[13px] font-semibold flex items-center gap-2"><Utensils className="w-4 h-4 text-orange-500" /> Bữa ăn bao gồm</h4>
                          <div className="flex gap-4 mt-1">
                            {['breakfast', 'lunch', 'dinner'].map((meal) => (
                              <label key={meal} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={formData.meals[meal]}
                                  onChange={(e) => setFormData({...formData, meals: {...formData.meals, [meal]: e.target.checked}})}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-[13px] capitalize">{meal === 'breakfast' ? 'Sáng' : meal === 'lunch' ? 'Trưa' : 'Tối'}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          onClick={() => {
                            if (editingId?.startsWith('new-')) {
                              handleDelete(editingId);
                            } else {
                              setEditingId(null);
                            }
                          }}
                          className="px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-[13px] font-medium rounded-full hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Lưu ngày {formData.dayNumber}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[14px] text-gray-700 whitespace-pre-wrap leading-relaxed">{day.description}</p>
                      
                      <div className="flex flex-wrap gap-4 pt-2">
                        {day.location && (
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {day.location}
                          </div>
                        )}
                        {day.transport && (
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                            <Bus className="w-3.5 h-3.5 text-blue-500" /> {day.transport}
                          </div>
                        )}
                        {day.hotelName && (
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                            <BedDouble className="w-3.5 h-3.5 text-purple-500" /> {day.hotelName}
                          </div>
                        )}
                        {day.meals && Object.values(day.meals as any).some(Boolean) && (
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                            <Utensils className="w-3.5 h-3.5 text-orange-500" />
                            {[(day.meals as any).breakfast && 'Sáng', (day.meals as any).lunch && 'Trưa', (day.meals as any).dinner && 'Tối'].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {itineraries.length === 0 && !editingId && (
          <div className="text-center py-12 border-2 border-dashed border-[#eaeaea] rounded-2xl bg-white">
            <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-[15px] font-medium text-black">Chưa có lịch trình</h3>
            <p className="text-[14px] text-gray-500 mt-1 mb-4">Tour này chưa có lịch trình chi tiết.</p>
            <button onClick={handleAddNew} className="bg-black text-white px-5 py-2 rounded-full text-[13px] font-medium hover:bg-gray-800">
              Tạo ngày đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Dummy icon for empty state
function CalendarDays(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
}
