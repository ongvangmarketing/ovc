import { MembersList } from "@/modules/core/components/role-permission/members-list";
import { getMembers } from "@/actions/members";
import { getRoles } from "@/actions/roles";
import { getDepartments } from "@/actions/departments";

export const metadata = {
  title: "Thành viên | Cài đặt | OVC",
};

export default async function MembersPage() {
  const [members, roles, departments] = await Promise.all([
    getMembers(),
    getRoles(),
    getDepartments()
  ]);

  return (
    <MembersList 
      initialMembers={members} 
      roles={roles} 
      departments={departments} 
    />
  );
}
