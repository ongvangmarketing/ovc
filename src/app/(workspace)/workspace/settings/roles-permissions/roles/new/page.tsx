import { RoleForm } from "@/modules/core/components/role-permission/role-form";
import { getAvailablePermissions } from "@/actions/roles";

export const metadata = {
  title: "Tạo Vai trò mới | Cài đặt | OVC",
};

export default async function CreateRolePage() {
  const permissions = await getAvailablePermissions();
  
  return <RoleForm isEdit={false} availablePermissions={permissions} />;
}
