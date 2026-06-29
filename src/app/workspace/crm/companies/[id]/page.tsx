import { getCompanyById } from "@/app/actions/crm";
import { CompanyDetailClient } from "./company-detail-client";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Chi tiết Khách hàng Doanh nghiệp | Ong Vàng",
};

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await getCompanyById(params.id);
  
  if (!company) {
    notFound();
  }

  return <CompanyDetailClient company={company} />;
}
