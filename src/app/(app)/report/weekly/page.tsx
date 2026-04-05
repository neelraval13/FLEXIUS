// src/app/(app)/report/weekly/page.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { generateWeeklyReport } from "@/lib/weekly-report";
import WeeklyReportView from "@/components/report/weekly-report-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Report",
};

const WeeklyReportPage: React.FC = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const report = await generateWeeklyReport(session.user.id);

  return <WeeklyReportView report={report} />;
};

export default WeeklyReportPage;
