"use client";
import { useTeacherStore } from "@/lib/store/teacher-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Award, BookOpen, Edit, GraduationCap, Mail, Phone, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useAuthStore } from "@/lib/store/auth-store";

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
  specialization: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;
export function TeachersManagement() {
  const { teachers, loading, error, fetchTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } = useTeacherStore();
  const { admin } = useAuthStore();
  const isSuperAdmin = admin?.role === "super_admin";
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  });

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    if (editingTeacher) {
      setValue("name", editingTeacher.name);
      setValue("email", editingTeacher.email);
      setValue("phone", editingTeacher.phone);
      setValue("specialization", editingTeacher.specialization || "");
    }
  }, [editingTeacher, setValue]);

  const onSubmit = async (data: TeacherFormData) => {
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, data);
      } else {
        await createTeacher(data);
      }
      setIsDialogOpen(false);
      setEditingTeacher(null);
      reset();
      fetchTeachers();
    } catch (error) {
      console.log("failed to save teacher", error);
    }
  };

  const handleEdit = (teacher: any) => {
    if (isSuperAdmin) {
      setEditingTeacher(teacher);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (isSuperAdmin && confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteTeacher(teacherId);
        fetchTeachers();
      } catch (error) {
        console.error("Failed to delete teacher", error);
      }
    }
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTeacher(null);
    reset();
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Teacher Management</h1>
                <p className="text-purple-100 text-lg">Manage your qualified Islamic instructors</p>
              </div>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
                disabled={!isSuperAdmin}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 bg-purple-100 rounded-xl mr-3">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.name ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
                      }`}
                      placeholder="e.g., Dr. Ahmed Hassan"
                      disabled={!isSuperAdmin}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
                      }`}
                      placeholder="teacher@quranschool.com"
                      disabled={!isSuperAdmin}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.phone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-purple-500"
                      }`}
                      placeholder="+1 (555) 123-4567"
                      disabled={!isSuperAdmin}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="specialization" className="text-sm font-semibold text-gray-700">
                      Specialization & Qualifications
                    </Label>
                    <Textarea
                      id="specialization"
                      {...register("specialization")}
                      placeholder="e.g., Quran Recitation & Tajweed, Arabic Language, Islamic Studies, Hafiz-e-Quran"
                      rows={4}
                      className="rounded-xl border-2 border-gray-200 focus:border-purple-500 transition-all duration-200"
                      disabled={!isSuperAdmin}
                    />
                    <p className="text-xs text-gray-500">
                      Optional: Describe the teacher's areas of expertise and qualifications
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="rounded-xl px-6 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={!isSuperAdmin}
                  >
                    {editingTeacher ? "Update Teacher" : "Add Teacher"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teachers Found</h3>
                <p className="text-gray-500 mb-6">Start building your teaching team</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6"
                  disabled={!isSuperAdmin}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Teacher
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          teachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">{teacher.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {teacher.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Award className="w-4 h-4 mr-1" />
                      Islamic Instructor
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{teacher.email}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{teacher.phone}</p>
                      <p className="text-xs text-gray-500">Phone Number</p>
                    </div>
                  </div>

                  {teacher.specialization && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-start space-x-2">
                        <BookOpen className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-purple-800 mb-1">Specialization</p>
                          <p className="text-sm text-purple-700 leading-relaxed">{teacher.specialization}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Classes Assigned</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">{teacher.classCount || 0}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(teacher)}
                    className="flex-1 rounded-xl hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                    disabled={!isSuperAdmin}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(teacher.id)}
                    disabled={!isSuperAdmin || (teacher.classCount || 0) > 0}
                    className="flex-1 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {(teacher.classCount || 0) > 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg text-center">
                    Cannot delete: Teacher is assigned to {teacher.classCount} class(es)
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}