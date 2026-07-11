"use client";

import React, { useState, useEffect } from "react";
import { PenLine } from "lucide-react";
import { MailSidebar } from "./mail-sidebar";
import { MailList } from "./mail-list";
import { MailDetail } from "./mail-detail";
import { MailCompose } from "./mail-compose";
import { getWorkspaceMessages, syncMailboxAction, markEmailAsReadAction, bulkMarkEmailAsReadAction, bulkMarkEmailAsUnreadAction, bulkDeleteEmailAction } from "../actions/mail.actions";
import { toast } from "sonner";

export function MailClient({ organizationId, user, mailboxes }: { organizationId: string; user: any; mailboxes: any[] }) {
  const [activeMailbox, setActiveMailbox] = useState(mailboxes[0]?.id || "");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  
  const [composeData, setComposeData] = useState<{
    mode: "compose" | "reply" | "reply-all" | "forward";
    originalEmail?: any;
  } | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch messages
  const loadMessages = async (showLoading = true) => {
    if (!activeMailbox) return;
    if (showLoading) setLoadingMessages(true);
    try {
      const msgs = await getWorkspaceMessages(activeMailbox, activeFolder);
      setMessages(msgs);
      setSelectedEmailIds([]);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeMailbox, activeFolder]);

  const handleSync = async () => {
    if (!activeMailbox) return;
    
    setIsSyncing(true);
    toast.info("Đang đồng bộ email từ máy chủ IMAP...");
    
    try {
      const result = await syncMailboxAction(activeMailbox);
      if (result && result.success) {
        toast.success(`Đồng bộ thành công! Kéo về ${result.syncedCount} email mới.`);
        // Reload messages silent
        await loadMessages(false);
      } else {
        toast.error(`Đồng bộ thất bại: ${result?.error || "Lỗi không xác định"}`);
      }
    } catch (error: any) {
      toast.error(`Lỗi hệ thống: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectEmail = async (email: any) => {
    setSelectedEmail(email);
    if (email.unread) {
      // Optimistic update local state
      setMessages(prev => prev.map(m => m.id === email.id ? { ...m, unread: false } : m));
      try {
        await markEmailAsReadAction(email.id);
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedEmailIds.length === messages.length && messages.length > 0) {
      setSelectedEmailIds([]);
    } else {
      setSelectedEmailIds(messages.map(m => m.id));
    }
  };

  const toggleSelectEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmailIds(prev => 
      prev.includes(id) ? prev.filter(emailId => emailId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (actionType: "read" | "unread" | "delete") => {
    if (selectedEmailIds.length === 0) return;
    
    // Optimistic Update
    if (actionType === "read") {
      setMessages(prev => prev.map(m => selectedEmailIds.includes(m.id) ? { ...m, unread: false } : m));
    } else if (actionType === "unread") {
      setMessages(prev => prev.map(m => selectedEmailIds.includes(m.id) ? { ...m, unread: true } : m));
    } else if (actionType === "delete") {
      setMessages(prev => prev.filter(m => !selectedEmailIds.includes(m.id)));
    }

    const count = selectedEmailIds.length;
    const idsToProcess = [...selectedEmailIds];
    setSelectedEmailIds([]);

    try {
      if (actionType === "read") {
        await bulkMarkEmailAsReadAction(idsToProcess);
        toast.success(`Đã đánh dấu ${count} email đã đọc`);
      } else if (actionType === "unread") {
        await bulkMarkEmailAsUnreadAction(idsToProcess);
        toast.success(`Đã đánh dấu ${count} email chưa đọc`);
      } else if (actionType === "delete") {
        await bulkDeleteEmailAction(idsToProcess);
        toast.success(`Đã xóa ${count} email`);
      }
    } catch (err: any) {
      toast.error(`Lỗi thao tác: ${err.message}`);
      await loadMessages(false);
    }
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          setComposeData({ mode: "compose" });
          break;
        // Other shortcuts can be handled here
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-white overflow-hidden text-black font-sans selection:bg-black selection:text-white relative">
      {/* Cột 1: Sidebar */}
      <div className={`w-[260px] flex-shrink-0 border-r border-[#eaeaea] bg-[#FAFAFA] flex-col ${isMobileSidebarOpen ? 'flex absolute inset-y-0 left-0 z-50 shadow-2xl' : 'hidden md:flex'}`}>
        <MailSidebar 
          mailboxes={mailboxes} 
          activeMailbox={activeMailbox} 
          setActiveMailbox={(val) => { setActiveMailbox(val); setIsMobileSidebarOpen(false); }}
          activeFolder={activeFolder}
          setActiveFolder={(val) => { setActiveFolder(val); setIsMobileSidebarOpen(false); }}
          onCompose={() => { setComposeData({ mode: "compose" }); setIsMobileSidebarOpen(false); }}
          onSync={handleSync}
          isSyncing={isSyncing}
        />
      </div>

      {/* Backdrop cho mobile */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Cột 2: Email List */}
      <div className={`w-full lg:w-[360px] flex-shrink-0 border-r border-[#eaeaea] bg-white flex-col ${selectedEmail ? 'hidden lg:flex' : 'flex'}`}>
        <MailList 
          activeMailbox={activeMailbox}
          activeFolder={activeFolder}
          messages={messages}
          loading={loadingMessages}
          selectedEmail={selectedEmail}
          setSelectedEmail={handleSelectEmail}
          selectedEmailIds={selectedEmailIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelectEmail={toggleSelectEmail}
          handleBulkAction={handleBulkAction}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* Cột 3: Email Detail */}
      <div className={`flex-1 bg-white flex-col min-w-0 ${!selectedEmail ? 'hidden lg:flex' : 'flex'}`}>
        <MailDetail 
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onReply={() => setComposeData({ mode: "reply", originalEmail: selectedEmail })}
          onReplyAll={() => setComposeData({ mode: "reply-all", originalEmail: selectedEmail })}
          onForward={() => setComposeData({ mode: "forward", originalEmail: selectedEmail })}
        />
      </div>

      {/* Soạn Mail */}
      {composeData && (
        <MailCompose 
          onClose={() => setComposeData(null)}
          mailboxes={mailboxes}
          activeMailbox={activeMailbox}
          composeData={composeData}
        />
      )}

      {/* Nút Tạo mới email trên mobile (FAB) */}
      {!composeData && !selectedEmail && (
        <button
          onClick={() => setComposeData({ mode: "compose" })}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-black text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
        >
          <PenLine className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
