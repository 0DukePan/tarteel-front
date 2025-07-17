"use client";

import { useEffect, useState } from "react";
import { useClassStore } from "@/lib/store/class-store";
import { useRegistrationStore } from "@/lib/store/registration-store";
import { useTeacherStore } from "@/lib/store/teacher-store";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Award, BookOpen, Calendar, Eye, TrendingUp, UserCheck, Users, Download, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RegistrationWithDetails } from "@/lib/types";

export function AdminDashboard() {
  const { registrations, loading: registrationsLoading, fetchRegistrations, updateRegistrationStatus } = useRegistrationStore();
  const { classes, loading: classesLoading, fetchClasses } = useClassStore();
  const { teachers, loading: teachersLoading, fetchTeachers } = useTeacherStore();

  useEffect(() => {
    fetchRegistrations({ page: 1, limit: 100 });
    fetchClasses();
    fetchTeachers();
    console.log("Loading states:", { registrationsLoading, classesLoading, teachersLoading });
  }, [fetchRegistrations, fetchClasses, fetchTeachers]);

  const loading = registrationsLoading || classesLoading || teachersLoading;
  console.log("Combined loading state:", loading);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Filter valid registrations
  const validRegistrations = registrations.filter((r: RegistrationWithDetails) => {
    if (!r.student) {
      console.warn("Invalid registration detected in dashboard:", r);
      return false;
    }
    return true;
  });

  // Log invalid registrations
  if (registrations.length > validRegistrations.length) {
    console.error(`Filtered out ${registrations.length - validRegistrations.length} invalid registrations in dashboard`);
  }

  // Calculate statistics
  const totalRegistrations = validRegistrations.length;
  const pendingRegistrations = validRegistrations.filter((r: RegistrationWithDetails) => r.student.registrationStatus === "pending").length;
  const approvedRegistrations = validRegistrations.filter((r: RegistrationWithDetails) => r.student.registrationStatus === "approved").length;
  const totalClasses = classes.length;
  const totalTeachers = teachers.length;
  const totalCapacity = classes.reduce((sum, cls) => sum + cls.maxStudents, 0);
  const totalEnrolled = classes.reduce((sum, cls) => sum + cls.currentStudents, 0);

  const recentRegistrations = validRegistrations
    .sort((a: RegistrationWithDetails, b: RegistrationWithDetails) => new Date(b.student.createdAt).getTime() - new Date(a.student.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: "Total Registrations",
      value: totalRegistrations,
      subtitle: `${pendingRegistrations} pending approval`,
      icon: UserCheck,
      color: "emerald",
    },
    {
      title: "Active Classes",
      value: totalClasses,
      subtitle: `${totalEnrolled}/${totalCapacity} students enrolled`,
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Teachers",
      value: totalTeachers,
      subtitle: "Active instructors",
      icon: Users,
      color: "purple",
    },
    {
      title: "Approved Students",
      value: approvedRegistrations,
      subtitle: "Currently enrolled",
      icon: Award,
      color: "orange",
    },
  ];

  // Fetch all registrations for PDF
  const fetchAllRegistrations = async (): Promise<RegistrationWithDetails[]> => {
    const allData: RegistrationWithDetails[] = [];
    let page = 1;
    const limit = 100; // Adjust based on your needs

    while (true) {
      const result = await fetchRegistrations({ page, limit, search: "", status: "", classId: "" });
      allData.push(...(result.data.filter((r): r is RegistrationWithDetails => !!r.student) as RegistrationWithDetails[]));
      if (page >= (result.pagination?.pages || 1)) break;
      page++;
    }
    return allData;
  };

  const downloadPDF = async () => {
    try {
      const allData = await fetchAllRegistrations();
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Admin Dashboard Report", 14, 22);

      const tableData = allData.map((reg: RegistrationWithDetails) => [
        `${reg.student.firstName} ${reg.student.lastName}`,
        reg.student.age.toString(),
        new Date(reg.student.dateOfBirth).toLocaleDateString(),
        reg.student.registrationStatus,
        reg.class?.name || "N/A",
        `${reg.parent.fatherFirstName} ${reg.parent.fatherLastName}`,
        reg.parent.fatherEmail,
        reg.parent.fatherPhone,
        reg.teacher?.name || "N/A",
      ]);

      autoTable(doc, {
        head: [
          ["Student Name", "Age", "Date of Birth", "Status", "Class", "Parent Name", "Parent Email", "Parent Phone", "Teacher"],
        ],
        body: tableData,
        startY: 30,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [22, 160, 133], textColor: 255 },
      });

      doc.save("admin_dashboard_report.pdf");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report: " + errorMessage);
    }
  };

  // Alerts
  const hasCapacityIssues = classes.some((cls) => cls.currentStudents >= cls.maxStudents * 0.9);
  const hasManyPending = pendingRegistrations > 10; // Threshold for alert

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back! 👋</h1>
            <p className="text-emerald-100 text-lg">Here's what's happening at your Quran school today</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
              <div className="text-emerald-200">Today</div>
            </div>
            <Calendar className="w-12 h-12 text-emerald-200" />
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center"
              onClick={downloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(hasCapacityIssues || hasManyPending) && (
        <div className="space-y-4">
          {hasCapacityIssues && (
            <Alert variant="destructive" className="rounded-xl border-yellow-200 bg-yellow-50 text-yellow-800">
              <AlertDescription>
                Some classes are nearing full capacity. Please review class assignments.
              </AlertDescription>
            </Alert>
          )}
          {hasManyPending && (
            <Alert variant="destructive" className="rounded-xl border-yellow-200 bg-yellow-50 text-yellow-800">
              <AlertDescription>
                {pendingRegistrations} pending registrations require your attention.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Invalid Data Alert */}
      {registrations.length > validRegistrations.length && (
        <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {registrations.length - validRegistrations.length} invalid registration(s) detected. Please check the console for details and contact support.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm text-gray-500">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg rounded-2xl bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">Recent Registrations</CardTitle>
                <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRegistrations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No registrations yet</p>
                  </div>
                ) : (
                  recentRegistrations.map((registration: RegistrationWithDetails) => (
                    <div
                      key={registration.student.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                          <span className="text-emerald-600 font-bold text-lg">{registration.student.firstName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {registration.student.firstName} {registration.student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Age: {registration.student.age} | Parent: {registration.parent.fatherFirstName}{" "}
                            {registration.parent.fatherLastName}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          registration.student.registrationStatus === "approved"
                            ? "default"
                            : registration.student.registrationStatus === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="rounded-lg px-3 py-1"
                      >
                        {registration.student.registrationStatus}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Utilization */}
        <div>
          <Card className="border-0 shadow-lg rounded-2xl bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Class Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No classes available</p>
                  </div>
                ) : (
                  classes.slice(0, 5).map((cls) => {
                    const utilization = (cls.currentStudents / cls.maxStudents) * 100;
                    return (
                      <div key={cls.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{cls.name}</span>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                            {cls.currentStudents}/{cls.maxStudents}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                utilization >= 90
                                  ? "bg-gradient-to-r from-red-400 to-red-500"
                                  : utilization >= 70
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                  : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                              }`}
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow">{Math.round(utilization)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}