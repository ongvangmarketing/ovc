import { ZaloConnectCard } from "@/modules/zalo-integration/components/zalo-connect-card";
import Link from "next/link";

export default async function ChatSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "general" } = await searchParams;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cài đặt Chat</h1>
        <p className="text-gray-500 mt-1">Quản lý các thiết lập Business Chat.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="?tab=general"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === "general"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Cài đặt chung
          </Link>
          <Link
            href="?tab=zalo"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              tab === "zalo"
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Đăng nhập Zalo
          </Link>
        </nav>
      </div>

      <div className="pt-4">
        {tab === "general" && (
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500">
            Chưa có cấu hình chung nào.
          </div>
        )}
        {tab === "zalo" && (
          <ZaloConnectCard />
        )}
      </div>
    </div>
  );
}
