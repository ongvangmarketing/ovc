import { DepartmentsList } from "@/modules/core/components/role-permission/departments-list";
import { getDepartments } from "@/actions/departments";

export const metadata = {
  title: "Sơ đồ tổ chức | Cài đặt | OVC",
};

export default async function DepartmentsPage() {
  const departments = await getDepartments();
  return <DepartmentsList initialData={departments} />;
}
