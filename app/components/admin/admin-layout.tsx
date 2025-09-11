"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { Menu, Users, BookOpen, UserCheck, LogOut, Bell, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../../lib/store/auth-store";
import { LoadingSpinner } from "../../components/ui/loading-spinner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { admin, logout, loading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("AdminLayout: Auth check failed", error);
      }
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && !loading && !admin && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [admin, loading, pathname, router, isInitialized]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, color: "emerald" },
    { name: "Registrations", href: "/admin/registrations", icon: UserCheck, color: "blue" },
    { name: "Classes", href: "/admin/classes", icon: BookOpen, color: "purple" },
    { name: "Teachers", href: "/admin/teachers", icon: Users, color: "orange" },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} bg-white`}>
      <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-white">
            <h1 className="text-lg font-bold">Quran School</h1>
            <p className="text-xs text-emerald-100">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? `bg-gradient-to-r from-${item.color}-100 to-${item.color}-50 text-${item.color}-700 shadow-lg`
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <div
                className={`p-2 rounded-lg mr-3 ${
                  isActive ? `bg-${item.color}-200` : "bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? `text-${item.color}-600` : "text-gray-500"}`} />
              </div>
              {item.name}
              {isActive && <div className={`ml-auto w-2 h-2 bg-${item.color}-500 rounded-full`}></div>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
            <span className="text-emerald-600 font-bold">{admin.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{admin.username}</p>
            <p className="text-xs text-gray-500 capitalize">{admin.role}</p>
          </div>
          <Bell className="w-4 h-4 text-gray-400" />
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 shadow-lg">
          <Sidebar />
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 lg:hidden shadow-sm">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-xl">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <Bell className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-sm">{admin.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
