import { getAuthTokenServer } from "@/lib/auth-server";
import { AdminDashboard } from "../components/admin/admin-dashboard";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  console.log("🔎 API_URL:", process.env.API_URL);
  console.log("🔎 NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

  const token = await getAuthTokenServer();
  if (!token) {
    return redirect('/admin/login'); 
  }
  return <AdminDashboard/>; 
}
