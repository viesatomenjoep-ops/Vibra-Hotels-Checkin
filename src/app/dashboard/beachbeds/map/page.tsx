"use client";

import React from 'react';
import AdminMapEditor from '@/components/beachbeds/AdminMapEditor';
import DashboardShell from '@/components/DashboardShell';

export default function AdminMapPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-stone-50">
        <AdminMapEditor />
      </div>
    </DashboardShell>
  );
}
