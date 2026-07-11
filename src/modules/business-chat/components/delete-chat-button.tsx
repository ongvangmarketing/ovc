"use client";

import { Trash2 } from "lucide-react";
import { deleteConversationAction } from "../actions/chat.actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteChatButtonProps {
  conversationId: string;
}

export function DeleteChatButton({ conversationId }: DeleteChatButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(false);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    const res = await deleteConversationAction(conversationId);
    if (res.success) {
      if (window.location.pathname.includes(conversationId)) {
        router.push("/workspace/chat");
      }
    } else {
      alert(res.error || "Không thể xoá cuộc trò chuyện.");
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <Trash2 
        className={`w-4 h-4 hover:text-red-500 cursor-pointer ${isDeleting ? "opacity-50" : ""}`} 
        onClick={handleOpenModal}
      />

      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl border border-[#eaeaea] w-full max-w-[480px] overflow-hidden transform scale-100 transition-transform p-8 md:p-10 shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-[24px] font-medium tracking-tight text-black">Xác nhận xóa</h3>
              <p className="text-[16px] text-gray-500 mt-4 leading-relaxed">
                Bạn có chắc chắn muốn xoá cuộc trò chuyện này không? Hành động này không thể hoàn tác và mọi dữ liệu tin nhắn sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="mt-10 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                disabled={isDeleting}
                className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[14px] font-medium text-black hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-600 px-6 py-2.5 text-[14px] font-medium text-white hover:bg-red-700 transition-colors"
              >
                {isDeleting ? "Đang xóa..." : "Xóa cuộc trò chuyện"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
