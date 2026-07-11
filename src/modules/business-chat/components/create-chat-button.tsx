"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createDirectChatAction, getOrCreateEntityChatAction, createZaloChatAction, getConnectedZaloAccountsAction } from "../actions/chat.actions";
import { searchChatTargetsAction } from "../actions/search.actions";

export function CreateChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{users: any[], projects: any[], zaloFriends?: any[]}>({ users: [], projects: [], zaloFriends: [] });
  const [zaloAccounts, setZaloAccounts] = useState<any[]>([]);
  const [selectedZaloAccountId, setSelectedZaloAccountId] = useState<string>("");
  
  const router = useRouter();

  // Lấy danh sách Zalo Account
  useEffect(() => {
    if (isOpen) {
      getConnectedZaloAccountsAction().then(res => {
        if (res.success && res.accounts && res.accounts.length > 0) {
          setZaloAccounts(res.accounts);
          setSelectedZaloAccountId(res.accounts[0].id);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchChatTargetsAction(searchQuery, selectedZaloAccountId).then(setResults).catch(console.error);
      } else {
        setResults({ users: [], projects: [], zaloFriends: [] });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedZaloAccountId]);

  const handleCreateDirectChat = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await createDirectChatAction(userId);
      if (!res.success || !res.conversation) {
        throw new Error(res.error || "Không thể tạo cuộc trò chuyện");
      }
      setIsOpen(false);
      setSearchQuery("");
      router.push(`/workspace/chat/${res.conversation.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Lỗi khi tạo chat", error);
      alert(error.message || "Không thể tạo cuộc trò chuyện.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProjectChat = async (projectId: string, projectName: string) => {
    setIsLoading(true);
    try {
      const res = await getOrCreateEntityChatAction("PROJECT", projectId, `Dự án: ${projectName}`);
      if (!res.success || !res.conversation) {
        throw new Error(res.error || "Không thể tạo cuộc trò chuyện");
      }
      setIsOpen(false);
      setSearchQuery("");
      router.push(`/workspace/chat/${res.conversation.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Lỗi khi tạo chat", error);
      alert(error.message || "Không thể tạo cuộc trò chuyện.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateZaloChat = async (zaloId: string, name: string, avatar: string) => {
    setIsLoading(true);
    try {
      const res = await createZaloChatAction(zaloId, name, avatar, selectedZaloAccountId);
      if (!res.success || !res.conversation) {
        throw new Error(res.error || "Không thể tạo cuộc trò chuyện");
      }
      setIsOpen(false);
      setSearchQuery("");
      router.push(`/workspace/chat/${res.conversation.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Lỗi khi tạo chat zalo", error);
      alert(error.message || "Không thể tạo cuộc trò chuyện Zalo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-gray-900 transition-colors"
        title="Tạo cuộc trò chuyện mới"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title và Nút đóng */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Cuộc trò chuyện mới</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Zalo Account Selector */}
            {zaloAccounts.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gửi từ Zalo:</label>
                <select
                  value={selectedZaloAccountId}
                  onChange={(e) => setSelectedZaloAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {zaloAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ô tìm kiếm */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
                placeholder="Tìm nhân viên, dự án hoặc Bạn bè Zalo..."
                className="w-full bg-transparent border-none outline-none text-[15px]"
              />
              {isLoading && (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto p-2">
              {searchQuery.trim().length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Nhập tên để tìm kiếm
                </div>
              ) : results.users.length === 0 && results.projects.length === 0 && (!results.zaloFriends || results.zaloFriends.length === 0) ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Không tìm thấy kết quả phù hợp
                </div>
              ) : (
                <>
                  {/* Danh sách User */}
                  {results.users.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Nhân viên
                      </div>
                      <div className="space-y-1">
                        {results.users.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleCreateDirectChat(u.id)}
                            disabled={isLoading}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                              {u.image ? (
                                <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium">{u.name?.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{u.name}</div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Danh sách Dự án */}
                  {results.projects.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Dự án
                      </div>
                      <div className="space-y-1">
                        {results.projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleCreateProjectChat(p.id, p.name)}
                            disabled={isLoading}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                          >
                            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{p.name}</div>
                              <div className="text-xs text-gray-500">Group chat</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Danh sách Bạn bè Zalo */}
                  {results.zaloFriends && results.zaloFriends.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Bạn bè Zalo (Demo)
                      </div>
                      <div className="space-y-1">
                        {results.zaloFriends.map((z) => (
                          <button
                            key={z.id}
                            onClick={() => handleCreateZaloChat(z.id, z.name, z.avatar)}
                            disabled={isLoading}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0 border border-blue-200">
                              {z.avatar ? (
                                <img src={z.avatar} alt={z.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium text-blue-600">{z.name?.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{z.name}</div>
                              <div className="text-xs text-blue-600 font-medium">Khách hàng Zalo</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
