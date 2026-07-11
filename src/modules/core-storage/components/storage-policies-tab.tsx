"use client";

import React, { useState, useEffect } from "react";
import { Plus, ShieldCheck, Edit, Trash2 } from "lucide-react";
import { getStoragePolicies, getStorageConnections, createStoragePolicy, deleteStoragePolicy, updateStoragePolicy } from "../actions/storage.actions";
import { toast } from "sonner";

export function StoragePoliciesTab({ organizationId }: { organizationId: string }) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    fileCategory: "",
    folderMapping: "",
    connectionId: "",
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, [organizationId]);

  const loadData = async () => {
    try {
      const [polData, connData] = await Promise.all([
        getStoragePolicies(organizationId),
        getStorageConnections(organizationId)
      ]);
      setPolicies(polData);
      setConnections(connData);
      if (connData.length > 0) {
        setFormData(prev => ({ ...prev, connectionId: connData[0].id }));
      }
    } catch (e) {
      toast.error("Lỗi khi tải dữ liệu policies");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.fileCategory || !formData.connectionId) {
      toast.error("Vui lòng điền đủ thông tin");
      return;
    }
    setIsSaving(true);
    try {
      let res;
      if (editId) {
        res = await updateStoragePolicy(organizationId, editId, {
          name: formData.name,
          fileCategory: formData.fileCategory,
          connectionId: formData.connectionId,
          folderMapping: formData.folderMapping,
          isActive: formData.isActive
        });
      } else {
        res = await createStoragePolicy(organizationId, formData);
      }

      if (res.success) {
        toast.success(editId ? "Đã cập nhật chính sách" : "Đã thêm Policy mới");
        setIsAdding(false);
        setEditId(null);
        setFormData({ name: "", fileCategory: "", folderMapping: "", connectionId: connections[0]?.id || "", isActive: true });
        loadData();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi lưu policy");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (policy: any) => {
    setFormData({
      name: policy.name,
      fileCategory: policy.fileCategory,
      connectionId: policy.connectionId,
      folderMapping: policy.folderMapping || "",
      isActive: policy.isActive
    });
    setEditId(policy.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;
    try {
      const res = await deleteStoragePolicy(organizationId, id);
      if (res.success) {
        toast.success("Đã xóa chính sách");
        loadData();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (e: any) {
      toast.error("Lỗi xóa chính sách");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[16px] font-medium text-black">Danh sách Policies</h3>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditId(null);
              setFormData({ name: "", fileCategory: "", folderMapping: "", connectionId: connections[0]?.id || "", isActive: true });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? "Hủy" : "Thêm chính sách"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 border border-[#eaeaea] p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Tên chính sách</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Ví dụ: Lưu hóa đơn"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">File Category</label>
              <select 
                value={formData.fileCategory}
                onChange={e => setFormData({ ...formData, fileCategory: e.target.value })}
                className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              >
                <option value="">-- Chọn phân loại file --</option>
                <option value="GENERAL">Tài liệu chung (General)</option>
                <option value="MAIL_ATTACHMENT">Đính kèm Email (Mail)</option>
                <option value="CHAT_MEDIA">Hình ảnh/Video Chat (Chat)</option>
                <option value="TASK_FILE">Tài liệu công việc (Task)</option>
                <option value="INVOICE">Hóa đơn chứng từ (Finance)</option>
                <option value="LEAD_DOCS">Tài liệu khách hàng (CRM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Ánh xạ Folder (Folder Mapping)</label>
              <input 
                type="text" 
                value={formData.folderMapping}
                onChange={e => setFormData({ ...formData, folderMapping: e.target.value })}
                className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Ví dụ: /Finance/Invoices"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Lưu trữ tại (Connection)</label>
              <select 
                value={formData.connectionId}
                onChange={e => setFormData({ ...formData, connectionId: e.target.value })}
                className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              >
                {connections.length === 0 && <option value="">-- Chưa có Connection --</option>}
                {connections.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.provider})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Lưu chính sách
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-[13px]">Đang tải...</div>
      ) : policies.length === 0 ? (
        <div className="text-center py-12 border border-[#eaeaea] border-dashed rounded-2xl bg-gray-50">
          <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h4 className="text-[14px] font-medium text-black">Chưa có Storage Policy</h4>
          <p className="text-[13px] text-gray-500 mt-1">Định nghĩa nơi lưu trữ theo từng loại file.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-[#eaeaea] rounded-2xl bg-white">
          <table className="min-w-full divide-y divide-[#eaeaea] text-[13px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Tên / Category</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Connection</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Đường dẫn</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea] bg-white">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-black">{p.name}</div>
                    <div className="text-gray-500 text-[12px]">{p.fileCategory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {p.connection?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-[12px]">
                    {p.folderMapping || "/"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400">
                    <button onClick={() => handleEdit(p)} className="hover:text-black mr-3"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
