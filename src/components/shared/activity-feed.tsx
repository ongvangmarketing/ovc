"use client";

import { formatRelative } from "@/lib/utils/format";
import { stringToColor, getInitials } from "@/lib/utils/format";
import { motion, type Variants } from "framer-motion";

const activities = [
  {
    id: "1",
    user: "Nguyễn Văn A",
    action: "tạo hóa đơn",
    target: "INV-2026-084",
    time: new Date(Date.now() - 5 * 60 * 1000),
    type: "invoice",
  },
  {
    id: "2",
    user: "Trần Thị B",
    action: "thêm liên hệ",
    target: "Lê Văn Cường",
    time: new Date(Date.now() - 18 * 60 * 1000),
    type: "contact",
  },
  {
    id: "3",
    user: "Phạm Văn C",
    action: "hoàn thành task",
    target: "Thiết kế UI màn Dashboard",
    time: new Date(Date.now() - 45 * 60 * 1000),
    type: "task",
  },
  {
    id: "4",
    user: "Lê Thị D",
    action: "gửi báo giá",
    target: "QUO-2026-031",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "quotation",
  },
  {
    id: "5",
    user: "Hoàng Văn E",
    action: "cập nhật deal",
    target: "Hệ thống ERP ABC Corp",
    time: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: "deal",
  },
  {
    id: "6",
    user: "Ngô Thị F",
    action: "ghi nhận thanh toán",
    target: "₫ 45,000,000",
    time: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: "payment",
  }
];

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.4 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300 } }
};

export function ActivityFeed() {
  return (
    <div className="card-base bg-white/40 backdrop-blur-xl border border-white/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full min-h-[400px] flex flex-col rounded-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Hoạt Động Gần Đây</h3>
        <p className="text-sm text-gray-500 font-medium">Nhật ký hoạt động của team</p>
      </div>

      <motion.div 
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto pr-4 space-y-5 custom-scrollbar relative"
      >
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-transparent -z-10" />
        
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            variants={itemVariants}
            whileHover={{ x: 5 }}
            className="flex items-start gap-4 group"
          >
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-4 ring-white transition-transform group-hover:scale-110"
                style={{ backgroundColor: stringToColor(activity.user) }}
              >
                {getInitials(activity.user)}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm leading-tight text-gray-800">
                <span className="font-bold text-gray-900">{activity.user}</span>{" "}
                <span className="text-gray-500">{activity.action}</span>{" "}
                <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-blue-100 transition-colors">
                  {activity.target}
                </span>
              </p>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {formatRelative(activity.time)}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
