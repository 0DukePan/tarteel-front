"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AdminLayout } from "../components/admin/admin-layout"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Don't wrap login page with AdminLayout to avoid auth loops
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Wrap all other admin pages with AdminLayout
  return <AdminLayout>{children}</AdminLayout>
}