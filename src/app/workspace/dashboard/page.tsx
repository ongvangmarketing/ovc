import type { Metadata } from "next";

import { getWorkspaceDashboard } from "@/app/actions/dashboard";

import { DashboardContainer, WorkspaceDashboard } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Tổng quan",
};

function parseDate(value: string | string[] | undefined, endOfDay = false) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+07:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function DashboardPage({ searchParams }: PageProps<"/workspace/dashboard">) {
  const query = await searchParams;
  const from = parseDate(query.from);
  const to = parseDate(query.to, true);
  const range = from && to && from <= to ? { from, to } : undefined;
  const dashboard = await getWorkspaceDashboard(range);

  return (
    <DashboardContainer>
      <WorkspaceDashboard
        data={dashboard}
        dateFrom={range ? query.from as string : undefined}
        dateTo={range ? query.to as string : undefined}
      />
    </DashboardContainer>
  );
}
