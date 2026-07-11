"use client";

import React, { useState, useEffect } from "react";
import { Plus, Server, Edit, Trash2 } from "lucide-react";
import { getStorageConnections, createStorageConnection, deleteStorageConnection, updateStorageConnection } from "../actions/storage.actions";
import { toast } from "sonner";
import { StorageProviderType } from "@prisma/client";

export function StorageConnectionsTab({ organizationId }: { organizationId: string }) {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    provider: "LOCAL" as StorageProviderType,
    rootFolder: "",
    credentials: ""
  });

  const [s3Creds, setS3Creds] = useState({
    endpoint: "",
    region: "auto",
    bucket: "",
    accessKeyId: "",
    secretAccessKey: ""
  });

  useEffect(() => {
    loadConnections();
  }, [organizationId]);

  const loadConnections = async () => {
    try {
      const data = await getStorageConnections(organizationId);
      setConnections(data);
    } catch (e) {
      toast.error("Lỗi khi tải kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên kết nối");
      return;
    }

    if (formData.provider === "GOOGLE_DRIVE") {
      // Chuyển hướng sang OAuth
      window.location.href = `/api/auth/google-drive?name=${encodeURIComponent(formData.name)}&rootFolder=${encodeURIComponent(formData.rootFolder)}&organizationId=${organizationId}`;
      return;
    }

    // Logic cho LocalProvider...
    setIsSaving(true);
    try {
      let res: any;
      let credentialsData = {};
      if (formData.provider === "S3" || formData.provider === "R2") {
        credentialsData = s3Creds;
      }

      if (editId) {
        res = await updateStorageConnection(organizationId, editId, {
          name: formData.name,
          provider: formData.provider,
          rootFolder: formData.rootFolder,
          credentials: JSON.stringify(credentialsData)
        });
      } else {
        res = await createStorageConnection(organizationId, {
          name: formData.name,
          provider: formData.provider,
          rootFolder: formData.rootFolder,
          credentials: JSON.stringify(credentialsData)
        });
      }

      if (res.success) {
        toast.success(editId ? "Đã cập nhật kết nối" : "Đã thêm Connection mới");
        setIsAdding(false);
        setEditId(null);
        setFormData({ name: "", provider: "LOCAL", rootFolder: "", credentials: "" });
        setS3Creds({ endpoint: "", region: "auto", bucket: "", accessKeyId: "", secretAccessKey: "" });
        loadConnections();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi lưu connection");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (conn: any) => {
    setFormData({
      name: conn.name,
      provider: conn.provider as StorageProviderType,
      rootFolder: conn.rootFolder || "",
      credentials: ""
    });

    if (conn.provider === "S3" || conn.provider === "R2") {
      try {
        const parsed = JSON.parse(conn.credentials || "{}");
        setS3Creds({
          endpoint: parsed.endpoint || "",
          region: parsed.region || "auto",
          bucket: parsed.bucket || "",
          accessKeyId: parsed.accessKeyId || "",
          secretAccessKey: parsed.secretAccessKey || ""
        });
      } catch(e) {}
    } else {
      setS3Creds({ endpoint: "", region: "auto", bucket: "", accessKeyId: "", secretAccessKey: "" });
    }

    setEditId(conn.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa kết nối này? Mọi File liên quan có thể bị lỗi.")) return;
    try {
      const res = await deleteStorageConnection(organizationId, id);
      if (res.success) {
        toast.success("Đã xóa kết nối");
        loadConnections();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (e: any) {
      toast.error("Lỗi xóa kết nối");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[16px] font-medium text-black">Danh sách Connections</h3>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (isAdding) {
              setEditId(null);
              setFormData({ name: "", provider: "LOCAL", rootFolder: "", credentials: "" });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? "Hủy" : "Thêm kết nối"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 border border-[#eaeaea] p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Tên kết nối</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Ví dụ: Google Drive Kế Toán"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Provider</label>
              <select 
                value={formData.provider}
                onChange={e => setFormData({ ...formData, provider: e.target.value as StorageProviderType })}
                className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              >
                <option value="LOCAL">Máy chủ Local</option>
                <option value="GOOGLE_DRIVE">Google Drive</option>
                <option value="R2">Cloudflare R2</option>
                <option value="S3">Amazon S3</option>
              </select>
            </div>
          </div>


          {(formData.provider === "S3" || formData.provider === "R2") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Endpoint URL</label>
                <input 
                  type="text" 
                  value={s3Creds.endpoint}
                  onChange={e => setS3Creds({ ...s3Creds, endpoint: e.target.value })}
                  className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="VD: https://<account_id>.r2.cloudflarestorage.com"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Region</label>
                <input 
                  type="text" 
                  value={s3Creds.region}
                  onChange={e => setS3Creds({ ...s3Creds, region: e.target.value })}
                  className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="auto"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Bucket Name</label>
                <input 
                  type="text" 
                  value={s3Creds.bucket}
                  onChange={e => setS3Creds({ ...s3Creds, bucket: e.target.value })}
                  className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Tên bucket"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Access Key ID</label>
                <input 
                  type="text" 
                  value={s3Creds.accessKeyId}
                  onChange={e => setS3Creds({ ...s3Creds, accessKeyId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Nhập Access Key"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Secret Access Key</label>
                <input 
                  type="password" 
                  value={s3Creds.secretAccessKey}
                  onChange={e => setS3Creds({ ...s3Creds, secretAccessKey: e.target.value })}
                  className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Nhập Secret Key"
                />
              </div>
            </div>
          )}

          {formData.provider !== "GOOGLE_DRIVE" && formData.provider !== "LOCAL" && formData.provider !== "S3" && formData.provider !== "R2" && (
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Cấu hình thêm (nếu có)</label>
              <textarea 
                value={formData.credentials}
                onChange={e => setFormData({ ...formData, credentials: e.target.value })}
                className="w-full px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black h-24"
                placeholder='Cấu hình bổ sung...'
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 text-[13px] font-medium rounded-lg transition-colors flex gap-2 items-center ${
                isSaving ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {formData.provider === "GOOGLE_DRIVE" ? (
                <>Đăng nhập Google</>
              ) : (
                isSaving ? "Đang xử lý..." : "Lưu kết nối"
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-[13px]">Đang tải...</div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 border border-[#eaeaea] border-dashed rounded-2xl bg-gray-50">
          <Server className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h4 className="text-[14px] font-medium text-black">Chưa có kết nối nào</h4>
          <p className="text-[13px] text-gray-500 mt-1">Vui lòng thêm Storage Connection để bắt đầu lưu trữ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn) => (
            <div key={conn.id} className="border border-[#eaeaea] rounded-2xl p-5 bg-white hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-medium text-black">{conn.name}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 mt-1">
                      {conn.provider}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 text-gray-400">
                  <button onClick={() => handleEdit(conn)} className="hover:text-black"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(conn.id)} className="hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#eaeaea] flex items-center justify-between text-[12px]">
                <div className="space-y-1 text-gray-500">
                  <div>Root: {conn.rootFolder || "Mặc định"}</div>
                  <div>Kết nối lúc: {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(conn.createdAt))}</div>
                </div>
                <span className={conn.status === "ACTIVE" ? "text-green-600 font-medium" : "text-gray-500"}>
                  {conn.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
