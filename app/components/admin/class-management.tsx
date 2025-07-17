"use client";

import { useClassStore } from "@/lib/store/class-store";
import { useTeacherStore } from "@/lib/store/teacher-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  Edit,
  GraduationCap,
  PercentIcon,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import toast from "react-hot-toast";
import { ClassWithDetails } from "@/lib/types";
import { useAuthStore } from "@/lib/store/auth-store";

const classSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters long"),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),
  ageMin: z.number().min(5).max(14),
  ageMax: z.number().min(5).max(14),
  maxStudents: z.number().min(1).max(50),
  teacherId: z.string().optional(),
});

// Helper function to normalize time format
const normalizeTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

type ClassFormData = z.infer<typeof classSchema>;

export function ClassManagement() {
  const { classes, loading, error, createClass, updateClass, deleteClass, fetchClasses } = useClassStore();
  const { teachers, fetchTeachers } = useTeacherStore();
  const { admin } = useAuthStore();
  const isSuperAdmin = admin?.role === "super_admin";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  const ageMin = watch("ageMin");
  const ageMax = watch("ageMax");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithDetails | null>(null);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, [fetchClasses, fetchTeachers]);

  useEffect(() => {
    if (editingClass) {
      setValue("name", editingClass.name);
      setValue("startTime", normalizeTime(editingClass.startTime)); // Normalize time
      setValue("endTime", normalizeTime(editingClass.endTime)); // Normalize time
      setValue("ageMin", editingClass.ageMin);
      setValue("ageMax", editingClass.ageMax);
      setValue("maxStudents", editingClass.maxStudents);
      setValue("teacherId", editingClass.teacherId || "");
    } else {
      reset(); // Clear form when not editing
    }
  }, [editingClass, setValue, reset]);

  const onSubmit = async (data: ClassFormData) => {
    if (!isSuperAdmin) return;
    try {
      if (data.ageMin > data.ageMax) {
        toast.error("Minimum age cannot be greater than maximum age");
        return;
      }
      const classData = {
        ...data,
        startTime: normalizeTime(data.startTime), // Normalize before sending
        endTime: normalizeTime(data.endTime), // Normalize before sending
        teacherId: data.teacherId || undefined,
      };
      if (editingClass) {
        await updateClass(editingClass.id, classData);
        toast.success("Class updated successfully");
      } else {
        await createClass(classData);
        toast.success("Class created successfully");
      }
      handleDialogClose();
      fetchClasses(); // Refresh the class list after update/create
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save class";
      console.error("Failed to save class", error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!isSuperAdmin || confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass(classId);
        toast.success("Class deleted successfully");
        fetchClasses(); // Refresh the class list after deletion
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete class";
        console.error("Failed to delete class", error);
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (classItem: ClassWithDetails) => {
    if (isSuperAdmin) {
      setEditingClass(classItem);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingClass(null);
    reset();
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "from-red-400 to-red-500";
    if (percentage >= 70) return "from-yellow-400 to-yellow-500";
    return "from-green-400 to-green-500";
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white/20 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Class Management</h1>
                <p className="text-blue-100 text-lg">Organize and manage your Quran classes</p>
              </div>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
                disabled={!isSuperAdmin}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-xl mr-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  {editingClass ? "Edit Class" : "Create New Class"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                      Class Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.name ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      }`}
                      placeholder="e.g., Beginner Quran Reading"
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
                    <Label htmlFor="startTime" className="text-sm font-semibold text-gray-700">
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...register("startTime")}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.startTime
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                      disabled={!isSuperAdmin}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm font-semibold text-gray-700">
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      {...register("endTime")}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.endTime ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      }`}
                      disabled={!isSuperAdmin}
                    />
                    {errors.endTime && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.endTime.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageMin" className="text-sm font-semibold text-gray-700">
                      Minimum Age
                    </Label>
                    <Input
                      id="ageMin"
                      type="number"
                      min="5"
                      max="14"
                      {...register("ageMin", { valueAsNumber: true })}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.ageMin ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      }`}
                      disabled={!isSuperAdmin}
                    />
                    {errors.ageMin && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.ageMin.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageMax" className="text-sm font-semibold text-gray-700">
                      Maximum Age
                    </Label>
                    <Input
                      id="ageMax"
                      type="number"
                      min="5"
                      max="14"
                      {...register("ageMax", { valueAsNumber: true })}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.ageMax ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                      }`}
                      disabled={!isSuperAdmin}
                    />
                    {errors.ageMax && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.ageMax.message}
                      </p>
                    )}
                    {ageMin && ageMax && ageMin > ageMax && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Maximum age must be greater than minimum age
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStudents" className="text-sm font-semibold text-gray-700">
                      Maximum Students
                    </Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      min="1"
                      max="50"
                      {...register("maxStudents", { valueAsNumber: true })}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        errors.maxStudents
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                      disabled={!isSuperAdmin}
                    />
                    {errors.maxStudents && (
                      <p className="text-sm text-red-600 flex items-center mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.maxStudents.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherId" className="text-sm font-semibold text-gray-700">
                      Assign Teacher (Optional)
                    </Label>
                    <Select onValueChange={(value) => setValue("teacherId", value)} disabled={!isSuperAdmin}>
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500">
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No teacher assigned</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="w-4 h-4 text-blue-500" />
                              <span>{teacher.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={!isSuperAdmin}
                  >
                    {editingClass ? "Update Class" : "Create Class"}
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

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Found</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first class</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6"
                  disabled={!isSuperAdmin}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Class
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          classes.map((classItem) => {
            const utilization = (classItem.currentStudents / classItem.maxStudents) * 100;
            return (
              <Card
                key={classItem.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {classItem.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Ages {classItem.ageMin}-{classItem.ageMax} years
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {classItem.startTime} - {classItem.endTime}
                        </div>
                        <div className="text-xs text-gray-500">Class Time</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {classItem.currentStudents}/{classItem.maxStudents}
                        </div>
                        <div className="text-xs text-gray-500">Students</div>
                      </div>
                    </div>
                  </div>

                  {classItem.teacher && (
                    <div className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-xl">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{classItem.teacher.name}</div>
                        <div className="text-xs text-emerald-600">Assigned Teacher</div>
                      </div>
                    </div>
                  )}

                  {/* Utilization Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Class Utilization</span>
                      <span className="text-sm text-gray-500">{Math.round(utilization)}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${getUtilizationColor(
                            utilization,
                          )}`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(classItem)}
                      className="flex-1 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      disabled={!isSuperAdmin}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(classItem.id)}
                      disabled={!isSuperAdmin || classItem.currentStudents > 0}
                      className="flex-1 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}