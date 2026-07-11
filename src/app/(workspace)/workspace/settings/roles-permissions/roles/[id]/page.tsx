import { RoleForm } from "@/modules/core/components/role-permission/role-form";
import { getRole, getAvailablePermissions } from "@/actions/roles";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Sửa Vai trò | Cài đặt | OVC",
};

export default async function EditRolePage({ params }: { params: { id: string } }) {
  const [role, permissions] = await Promise.all([
    getRole(params.id),
    getAvailablePermissions()
  ]);

  if (!role) {
    return notFound();
  }

  const initialData = {
    name: role.name,
    code: role.code,
    description: role.description || "",
    priority: role.priority,
    dataScope: role.dataScope,
    status: role.status,
    parentId: role.parentId || "",
    permissionActions: role.permissionActions,
  };

  return <RoleForm isEdit={true} roleId={role.id} initialData={initialData} availablePermissions={permissions} />;
}
