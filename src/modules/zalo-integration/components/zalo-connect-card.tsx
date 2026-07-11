"use client";

import { useEffect, useState } from "react";
import { getZaloAccountsAction, initZaloLoginAction, checkZaloStatusAction, disconnectZaloAction, deleteZaloAccountAction } from "@/modules/zalo-integration/actions/zalo.actions";
import { Loader2, Plus, QrCode } from "lucide-react";
import { toast } from "sonner";

export function ZaloConnectCard() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for new connection
  const [isConnecting, setIsConnecting] = useState(false);
  const [tempId, setTempId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState<string>("INIT");
  const [isMaster, setIsMaster] = useState(false);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await getZaloAccountsAction();
      if (res.success && res.data) {
        setAccounts(res.data);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Lỗi tải danh sách tài khoản Zalo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Poll for QR Status
  useEffect(() => {
    if (!isConnecting || !tempId) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await checkZaloStatusAction(undefined, tempId);
        if (res.success && res.data) {
          setConnectStatus(res.data.status);
          if (res.data.qrCode) setQrCode(res.data.qrCode);
          
          if (res.data.status === "LOGGED_IN") {
            toast.success("Kết nối Zalo thành công!");
            setIsConnecting(false);
            setTempId(null);
            fetchAccounts(); // Refresh
          } else if (res.data.status === "ERROR") {
            toast.error("Kết nối thất bại. Vui lòng thử lại.");
            setIsConnecting(false);
            setTempId(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isConnecting, tempId]);

  const startConnect = async (asMaster: boolean = false) => {
    setIsMaster(asMaster);
    const newTempId = Math.random().toString(36).substring(2, 15);
    setTempId(newTempId);
    setIsConnecting(true);
    setConnectStatus("INIT");
    setQrCode(null);
    
    try {
      const res = await initZaloLoginAction(newTempId, asMaster);
      if (!res.success) {
        throw new Error(res.error);
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi khởi tạo kết nối");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Bạn có chắc muốn gỡ kết nối tài khoản này?")) return;
    try {
      const res = await disconnectZaloAction(id);
      if (res.success) {
        toast.success("Đã gỡ kết nối");
        fetchAccounts();
      } else {
        toast.error(res.error || "Gỡ kết nối thất bại");
      }
    } catch (e: any) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa vĩnh viễn tài khoản này khỏi hệ thống? (Lịch sử chat liên quan có thể bị xóa theo)")) return;
    try {
      const res = await deleteZaloAccountAction(id);
      if (res.success) {
        toast.success("Đã xóa tài khoản");
        fetchAccounts();
      } else {
        toast.error(res.error || "Xóa thất bại");
      }
    } catch (e: any) {
      toast.error("Có lỗi xảy ra");
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400 w-6 h-6" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tài khoản Zalo</h3>
          <p className="text-sm text-gray-500">Quản lý các tài khoản Zalo cá nhân và Hotline.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50" onClick={() => startConnect(false)}>
            <Plus className="w-4 h-4 mr-2" /> Kết nối Zalo Cá nhân
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700" onClick={() => startConnect(true)}>
            <QrCode className="w-4 h-4 mr-2" /> Kết nối Zalo Hotline (Master)
          </button>
        </div>
      </div>

      {isConnecting && (
        <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
          <h4 className="font-medium text-gray-900">
            {connectStatus === "WAITING_FOR_SCAN" ? "Quét mã QR bằng ứng dụng Zalo" : 
             connectStatus === "SCANNED" ? "📱 Đã quét QR, chờ xác nhận..." : "Đang khởi tạo..."}
          </h4>
          
          {qrCode ? (
            <img src={qrCode} alt="QR Code" className="w-48 h-48 border border-gray-200 rounded-xl" />
          ) : (
            <div className="w-48 h-48 border border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          
          <button className="px-4 py-2 bg-transparent text-gray-500 hover:text-gray-700 text-sm font-medium" onClick={() => setIsConnecting(false)}>Hủy</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col gap-4 ${acc.isMaster ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {acc.avatar ? (
                  <img src={acc.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-gray-500 font-medium">{acc.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{acc.name}</p>
                    {acc.isMaster && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">MASTER / HOTLINE</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">SĐT: {acc.phone || "Không xác định"}</p>
                  <p className="text-xs text-gray-500">Sở hữu: {acc.owner?.name || "Hệ thống"}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${acc.status === "CONNECTED" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {acc.status === "CONNECTED" ? "Đang kết nối" : "Mất kết nối"}
                </span>
                
                {acc.status === "CONNECTED" ? (
                  <button onClick={() => handleDisconnect(acc.id)} className="text-xs text-amber-600 hover:underline">
                    Gỡ kết nối
                  </button>
                ) : (
                  <button onClick={() => handleDelete(acc.id)} className="text-xs text-red-600 hover:underline">
                    Xóa tài khoản
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {accounts.length === 0 && !isConnecting && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 mb-2">Chưa có tài khoản Zalo nào được kết nối.</p>
            <p className="text-sm text-gray-400">Kết nối Zalo cá nhân của nhân viên hoặc Zalo tổng đài để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
