import { RolesList } from "@/modules/core/components/role-permission/roles-list";
import { getRoles } from "@/actions/roles";

export const metadata = {
  title: "Vai trò | Cài đặt | OVC",
};

export default async function RolesPage() {
  const roles = await getRoles();
  return <RolesList initialRoles={roles} />;
}
