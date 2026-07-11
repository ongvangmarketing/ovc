"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getOrganizationUsersAction, transferChatAction } from "../actions/chat.actions";
import { X } from "lucide-react";

export function TransferChatModal({
  isOpen,
  onClose,
  conversationId,
}: {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      getOrganizationUsersAction()
        .then((res) => {
          if (res.success && res.users) {
            setUsers(res.users);
          }
        })
        .finally(() => setFetching(false));
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    if (!selectedUserId) {
      toast.error("Vui lòng chọn nhân viên để chuyển giao.");
      return;
    }
    setLoading(true);
    try {
      const res = await transferChatAction(conversationId, selectedUserId);
      if (res.success) {
        toast.success("Chuyển giao thành công!");
        onClose();
        window.location.reload(); 
      } else {
        toast.error(res.error || "Lỗi khi chuyển giao.");
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">Chuyển giao khách hàng</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
            Chọn một nhân viên khác để chuyển giao quyền chăm sóc khách hàng này. Sau khi chuyển, bạn sẽ không thể nhắn tin được nữa.
          </p>
          
          {fetching ? (
            <p className="text-sm text-gray-500 animate-pulse">Đang tải danh sách nhân viên...</p>
          ) : (
            <select
              className="w-full border border-gray-200 rounded-lg p-2.5 text-[14px] text-gray-900 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all cursor-pointer"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Chọn nhân viên --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-gray-50/80 border-t border-gray-100">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 text-[14px] font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleTransfer} 
            disabled={loading || !selectedUserId}
            className="px-4 py-2 text-[14px] font-medium text-white bg-black hover:bg-gray-800 shadow-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Chuyển giao"}
          </button>
        </div>
      </div>
    </div>
  );
}
