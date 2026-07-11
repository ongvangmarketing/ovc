import { ShieldCheck, Users, KeyRound, Database, Activity } from "lucide-react";

export default function RolesPermissionsDashboardClient() {
  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
              Tổ chức & Phân quyền lõi
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Role & Permission Center,</span>{" "}
            <span className="text-gray-400">quản trị bảo mật toàn diện.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Quản lý sơ đồ tổ chức, phân quyền chi tiết đến từng action, và giới hạn truy cập theo tài nguyên cho toàn bộ hệ thống OVC Business Platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 mb-6">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-[18px] font-medium text-black mb-2">Thành viên & Tổ chức</h3>
            <p className="text-[14px] text-gray-500">
              Quản lý danh sách thành viên, sơ đồ phòng ban (Departments) và các nhóm làm việc (Teams).
            </p>
          </div>

          <div className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 mb-6">
              <KeyRound className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-[18px] font-medium text-black mb-2">Vai trò & Quyền hạn</h3>
            <p className="text-[14px] text-gray-500">
              Thiết lập các Role, ma trận quyền hạn (Permissions) và phạm vi dữ liệu (Data Scope).
            </p>
          </div>

          <div className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mb-6">
              <Database className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-[18px] font-medium text-black mb-2">Tài nguyên (Resources)</h3>
            <p className="text-[14px] text-gray-500">
              Cấp quyền truy cập cho từng tài nguyên cụ thể (Mail Account, Project, File, v.v.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
