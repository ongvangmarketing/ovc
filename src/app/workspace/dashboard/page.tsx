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

function parsePeriod(value: string | string[] | undefined) {
  return typeof value === "string" && ["7d", "30d", "3m", "6m", "12m"].includes(value)
    ? value as "7d" | "30d" | "3m" | "6m" | "12m"
    : "6m";
}

function dateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFromPeriod(period: "7d" | "30d" | "3m" | "6m" | "12m") {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  if (period.endsWith("d")) {
    from.setDate(from.getDate() - Number(period.replace("d", "")) + 1);
  } else {
    from.setMonth(from.getMonth() - Number(period.replace("m", "")) + 1);
    from.setDate(1);
  }

  return { from, to };
}

export default async function DashboardPage({ searchParams }: PageProps<"/workspace/dashboard">) {
  const query = await searchParams;
  const period = parsePeriod(query.period);
  const from = parseDate(query.from);
  const to = parseDate(query.to, true);
  const customRange = from && to && from <= to ? { from, to } : undefined;
  const range = customRange ?? rangeFromPeriod(period);
  const dashboard = await getWorkspaceDashboard(range);

  return (
    <DashboardContainer>
      <WorkspaceDashboard
        data={dashboard}
        dateFrom={customRange ? query.from as string : dateValue(range.from)}
        dateTo={customRange ? query.to as string : dateValue(range.to)}
        period={period}
      />
    </DashboardContainer>
  );
}
