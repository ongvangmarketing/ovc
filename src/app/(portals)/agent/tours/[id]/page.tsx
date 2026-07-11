import { redirect } from "next/navigation";

export default async function TourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/agent/tours/${id}/overview`);
}
