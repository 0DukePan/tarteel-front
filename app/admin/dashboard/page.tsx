"use client";

import { AdminDashboard } from "@/app/components/admin/admin-dashboard";
import { AdminLayout } from "@/app/components/admin/admin-layout";

export default function DashboardPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
