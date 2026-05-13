import React from "react";
import DashboardShell from "@/components/DashboardShell";

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell title="Hotel Check-in Dashboard">{children}</DashboardShell>;
}
