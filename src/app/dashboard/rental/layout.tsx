import React from "react";
import DashboardShell from "@/components/DashboardShell";

export default function RentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell title="Verhuur Dashboard">{children}</DashboardShell>;
}
