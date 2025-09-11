import { getAuthTokenServer } from "@/lib/auth-server";
import { AdminDashboard } from "../components/admin/admin-dashboard";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const token = await getAuthTokenServer();
  if (!token) {
    redirect('/admin/login'); 
  }
  return <AdminDashboard/>; 
}
