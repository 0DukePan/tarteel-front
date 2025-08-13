
"use client";

import { useClassStore } from "@/lib/store/class-store";
import { useRegistrationStore } from "@/lib/store/registration-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

const registrationSchema = z.object({
  parent: z.object({
    fatherFirstName: z.string().min(2, "Father first name must be at least 2 characters long"),
    fatherLastName: z.string().min(2, "Father last name must be at least 2 characters long"),
    fatherPhone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
    fatherEmail: z.string().email("Please enter a valid email address"),
    motherFirstName: z.string().optional(),
    motherLastName: z.string().optional(),
    motherPhone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number").optional().or(z.literal("")),
    motherEmail: z.string().email("Please enter a valid email address").optional().optional().or(z.literal("")),
  }),
  student: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    classId: z.string().uuid("Please select a valid class"),
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSuccess: (data: { studentId: string; parentId: string }) => void;
  reportError?: (message: string) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const { submitRegistration, loading, error } = useRegistrationStore();
  const { classes, fetchClasses } = useClassStore();
  const [studentAge, setStudentAge] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      student: { classId: "" },
    },
  });

  const dateOfBirth = watch("student.dateOfBirth");
  const selectedClassId = watch("student.classId");

  // Log state for debugging
  useEffect(() => {
    console.log("availableClasses:", classes.filter(
      (cls) => studentAge && studentAge >= cls.ageMin && studentAge <= cls.ageMax && !cls.isFull
    ));
  }, [studentAge, classes, selectedClassId, loading]);

  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setStudentAge(age);
    }
  }, [dateOfBirth]);

  useEffect(() => {
    if (studentAge) {
      fetchClasses(studentAge);
      if (selectedClassId) {
        setValue("student.classId", "");
      }
    }
  }, [studentAge, fetchClasses, setValue]);

  const availableClasses = classes.filter(
    (cls) => studentAge && studentAge >= cls.ageMin && studentAge <= cls.ageMax && !cls.isFull
  );

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      const cleanedData: RegistrationFormData = {
        parent: {
          ...data.parent,
          motherFirstName: data.parent.motherFirstName || undefined,
          motherLastName: data.parent.motherLastName || undefined,
          motherPhone: data.parent.motherPhone || undefined,
          motherEmail: data.parent.motherEmail || undefined,
        },
        student: data.student,
      };
  
      const result = await submitRegistration(cleanedData);
      onSuccess(result);
    } catch (error: any) {
      console.log("Full Error Object:", error); // Add this line
      const apiMessage = error?.message || error?.response?.data?.error || "Something went wrong during registration.";
      console.log("Extracted API Message:", apiMessage); // Add this line
      if (apiMessage.toLowerCase().includes("already registered")) {
        reportError?.("This child is already registered by you.");
      } else {
        reportError?.(apiMessage);
      }
    }
  };
  
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Parent Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fatherFirstName">Father's First Name *</Label>
              <Input
                id="fatherFirstName"
                {...register("parent.fatherFirstName")}
                className={errors.parent?.fatherFirstName ? "border-red-500" : ""}
              />
              {errors.parent?.fatherFirstName && (
                <p className="text-sm text-red-600">{errors.parent.fatherFirstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherLastName">Father's Last Name *</Label>
              <Input
                id="fatherLastName"
                {...register("parent.fatherLastName")}
                className={errors.parent?.fatherLastName ? "border-red-500" : ""}
              />
              {errors.parent?.fatherLastName && (
                <p className="text-sm text-red-600">{errors.parent.fatherLastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherPhone">Father's Phone *</Label>
              <Input
                id="fatherPhone"
                type="tel"
                {...register("parent.fatherPhone")}
                className={errors.parent?.fatherPhone ? "border-red-500" : ""}
              />
              {errors.parent?.fatherPhone && (
                <p className="text-sm text-red-600">{errors.parent.fatherPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherEmail">Father's Email *</Label>
              <Input
                id="fatherEmail"
                type="email"
                {...register("parent.fatherEmail")}
                className={errors.parent?.fatherEmail ? "border-red-500" : ""}
              />
              {errors.parent?.fatherEmail && (
                <p className="text-sm text-red-600">{errors.parent.fatherEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherFirstName">Mother's First Name</Label>
              <Input id="motherFirstName" {...register("parent.motherFirstName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherLastName">Mother's Last Name</Label>
              <Input id="motherLastName" {...register("parent.motherLastName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherPhone">Mother's Phone</Label>
              <Input
                id="motherPhone"
                type="tel"
                {...register("parent.motherPhone")}
                className={errors.parent?.motherPhone ? "border-red-500" : ""}
              />
              {errors.parent?.motherPhone && (
                <p className="text-sm text-red-600">{errors.parent.motherPhone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherEmail">Mother's Email</Label>
              <Input
                id="motherEmail"
                type="email"
                {...register("parent.motherEmail")}
                className={errors.parent?.motherEmail ? "border-red-500" : ""}
              />
              {errors.parent?.motherEmail && (
                <p className="text-sm text-red-600">{errors.parent.motherEmail.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="studentFirstName">Student's First Name *</Label>
              <Input
                id="studentFirstName"
                {...register("student.firstName")}
                className={errors.student?.firstName ? "border-red-500" : ""}
              />
              {errors.student?.firstName && (
                <p className="text-sm text-red-600">{errors.student.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentLastName">Student's Last Name *</Label>
              <Input
                id="studentLastName"
                {...register("student.lastName")}
                className={errors.student?.lastName ? "border-red-500" : ""}
              />
              {errors.student?.lastName && (
                <p className="text-sm text-red-600">{errors.student.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("student.dateOfBirth")}
                className={errors.student?.dateOfBirth ? "border-red-500" : ""}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split("T")[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 14)).toISOString().split("T")[0]}
              />
              {errors.student?.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.student.dateOfBirth.message}</p>
              )}
              {studentAge && (
                <p className="text-sm text-emerald-600 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Student age: {studentAge} years
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Select Class *</Label>
              <Select
                onValueChange={(value) => {
                  setValue("student.classId", value);
                }}
                disabled={!studentAge || availableClasses.length === 0}
                value={selectedClassId}
              >
                <SelectTrigger className={errors.student?.classId ? "border-red-500" : ""}>
                  <SelectValue
                    placeholder={
                      !studentAge
                        ? "Please enter date of birth first"
                        : availableClasses.length === 0
                          ? "No classes available for this age"
                          : "Select a class"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.length === 0 && studentAge && (
                    <SelectItem value="no-classes" disabled>
                      No classes available for age {studentAge}
                    </SelectItem>
                  )}
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.startTime} - {cls.endTime}) - {cls.availableSpots} spots left
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.student?.classId && (
                <p className="text-sm text-red-600">{errors.student.classId.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={loading || !selectedClassId}
          className="bg-emerald-600 hover:bg-emerald-700 px-8"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting Registration...
            </>
          ) : (
            "Submit Registration"
          )}
        </Button>
      </div>
    </form>
  );
}
