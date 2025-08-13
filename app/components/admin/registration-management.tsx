'use client';

import { useEffect, useState } from 'react';
import { useClassStore } from '@/lib/store/class-store';
import { useRegistrationStore } from '@/lib/store/registration-store';
import { Badge } from '../ui/badge';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Mail,
  Phone,
  Search,
  User,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { RegistrationWithDetails, ClassWithDetails } from '@/lib/types';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth-store';

export function RegistrationsManagement() {
  const { registrations, error, loading, fetchRegistrations, updateRegistrationStatus, updateRegistrationClass, pagination } = useRegistrationStore();
  const { classes, fetchClasses } = useClassStore();
  const { admin } = useAuthStore();
  const isSuperAdmin = admin?.role === 'super_admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithDetails | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classUpdateError, setClassUpdateError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchRegistrations({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: statusFilter === 'all' ? '' : statusFilter,
      classId: classFilter === 'all' ? '' : classFilter,
    });
    ('Fetched registrations:', registrations); // Debug log
  }, [currentPage, searchTerm, statusFilter, classFilter, fetchRegistrations]);

  const handleStatusUpdate = async (studentId: string, status: string) => {
    if (!isSuperAdmin) return;
    try {
      await updateRegistrationStatus(studentId, status);
      await fetchRegistrations({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        classId: classFilter === 'all' ? '' : classFilter,
      });
      toast.success(`Registration status updated to ${status}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update registration status';
      console.error('Failed to update registration status', error);
      toast.error(errorMessage);
    }
  };

  const handleClassUpdate = async (studentId: string) => {
    if (!isSuperAdmin) return;
    setClassUpdateError(null);
    try {
      await updateRegistrationClass(studentId, selectedClassId);
      await fetchRegistrations({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter,
        classId: classFilter === 'all' ? '' : classFilter,
      });
      setSelectedRegistration((prev) =>
        prev
          ? {
              ...prev,
              student: { ...prev.student, classId: selectedClassId },
              class: classes.find((c) => c.id === selectedClassId) || null,
            }
          : null
      );
      toast.success('Class assignment updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update class assignment';
      setClassUpdateError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300 rounded-lg px-2 sm:px-3 py-1">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 rounded-lg px-2 sm:px-3 py-1">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 rounded-lg px-2 sm:px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusStats = () => {
    const validRegistrations = registrations.filter((r) => r.student);
    const pending = validRegistrations.filter((r) => r.student.registrationStatus === 'pending').length;
    const approved = validRegistrations.filter((r) => r.student.registrationStatus === 'approved').length;
    const rejected = validRegistrations.filter((r) => r.student.registrationStatus === 'rejected').length;
    return { pending, approved, rejected, validRegistrations };
  };

  const { pending, approved, rejected, validRegistrations } = getStatusStats();

  const getAvailableClasses = (age: number) => {
    return (classes as ClassWithDetails[]).filter(
      (cls) => cls.ageMin <= age && cls.ageMax >= age && cls.currentStudents < cls.maxStudents
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                <UserCheck className="w-6 sm:w-8 h-6 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Registration Management</h1>
                <p className="text-sm sm:text-base lg:text-lg text-emerald-100">Review and manage student applications</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4 sm:space-x-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{pending}</div>
              <div className="text-emerald-200 text-xs sm:text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{approved}</div>
              <div className="text-emerald-200 text-xs sm:text-sm">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{rejected}</div>
              <div className="text-emerald-200 text-xs sm:text-sm">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            <div className="p-1 sm:p-2 bg-blue-100 rounded-xl mr-2 sm:mr-3">
              <Filter className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
            </div>
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Search Students</label>
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Class Filter</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {(classes as ClassWithDetails[]).map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Invalid Data Alert */}
      {registrations.length > validRegistrations.length && (
        <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {registrations.length - validRegistrations.length} invalid registration(s) detected. Please check the console for details and contact support.
          </AlertDescription>
        </Alert>
      )}

      {/* Registrations Table */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            Student Registrations ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : validRegistrations.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <UserCheck className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">No Registrations Found</h3>
              <p className="text-sm sm:text-base text-gray-500">No valid student registrations match your current filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm">Student</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm">Parent Contact</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm">Class</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validRegistrations.map((registration) => {
                      if (!registration.student) {
                        console.warn('Invalid registration in table render:', registration);
                        return null; // Skip rendering invalid registration
                      }
                      return (
                        <TableRow key={registration.student.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                          <TableCell className="py-2 sm:py-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                <span className="text-emerald-600 font-bold text-sm sm:text-lg">
                                  {registration.student.firstName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                  {registration.student.firstName} {registration.student.lastName}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Age: {registration.student.age} | DOB: {formatDate(registration.student.dateOfBirth.toString())}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 sm:py-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {registration.parent.fatherFirstName} {registration.parent.fatherLastName}
                              </p>
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Mail className="w-3 h-3 mr-1" />
                                {registration.parent.fatherEmail}
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {registration.parent.fatherPhone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 sm:py-4">
                            {registration.class ? (
                              <div className="p-1 sm:p-2 bg-blue-50 rounded-lg">
                                <p className="font-medium text-blue-900 text-xs sm:text-sm">{registration.class.name}</p>
                                <p className="text-xs text-blue-600">
                                  {registration.class.startTime} - {registration.class.endTime}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs sm:text-sm">No class assigned</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 sm:py-4">{getStatusBadge(registration.student.registrationStatus)}</TableCell>
                          <TableCell className="py-2 sm:py-4">
                            <div className="text-xs sm:text-sm text-gray-600">{formatDate(registration.student.createdAt.toString())}</div>
                          </TableCell>
                          <TableCell className="py-2 sm:py-4">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRegistration(registration);
                                      setSelectedClassId(registration.student.classId || null);
                                      setClassUpdateError(null);
                                    }}
                                    className="rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  >
                                    <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md sm:max-w-2xl lg:max-w-3xl rounded-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                                      <div className="p-1 sm:p-2 bg-emerald-100 rounded-xl mr-2 sm:mr-3">
                                        <User className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600" />
                                      </div>
                                      Registration Details
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedRegistration && (
                                    <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <Card className="border border-gray-200 rounded-xl">
                                          <CardHeader className="pb-2 sm:pb-3">
                                            <CardTitle className="text-md sm:text-lg lg:text-xl text-gray-900 flex items-center">
                                              <User className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2 text-blue-600" />
                                              Student Information
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-2 sm:space-y-3">
                                            <div>
                                              <label className="text-xs sm:text-sm font-medium text-gray-600">Full Name</label>
                                              <p className="text-gray-900 font-medium text-sm sm:text-base">
                                                {selectedRegistration.student.firstName} {selectedRegistration.student.lastName}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs sm:text-sm font-medium text-gray-600">Age</label>
                                              <p className="text-gray-900 text-sm sm:text-base">{selectedRegistration.student.age} years old</p>
                                            </div>
                                            <div>
                                              <label className="text-xs sm:text-sm font-medium text-gray-600">Date of Birth</label>
                                              <p className="text-gray-900 text-sm sm:text-base">
                                                {formatDate(selectedRegistration.student.dateOfBirth.toString())}
                                              </p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                        <Card className="border border-gray-200 rounded-xl">
                                          <CardHeader className="pb-2 sm:pb-3">
                                            <CardTitle className="text-md sm:text-lg lg:text-xl text-gray-900 flex items-center">
                                              <Users className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2 text-emerald-600" />
                                              Parent Information
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-2 sm:space-y-3">
                                            <div>
                                              <label className="text-xs sm:text-sm font-medium text-gray-600">Father's Name</label>
                                              <p className="text-gray-900 font-medium text-sm sm:text-base">
                                                {selectedRegistration.parent.fatherFirstName} {selectedRegistration.parent.fatherLastName}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs sm:text-sm font-medium text-gray-600">Email</label>
                                              <p className="text-gray-900 text-sm sm:text-base">{selectedRegistration.parent.fatherEmail}</p>
                                            </div>
                                            <div>
                                              <label className="text-xs sm:text-sm font-medium text-gray-600">Phone</label>
                                              <p className="text-gray-900 text-sm sm:text-base">{selectedRegistration.parent.fatherPhone}</p>
                                            </div>
                                            {selectedRegistration.parent.motherFirstName && (
                                              <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Mother's Name</label>
                                                <p className="text-gray-900 text-sm sm:text-base">
                                                  {selectedRegistration.parent.motherFirstName} {selectedRegistration.parent.motherLastName}
                                                </p>
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      </div>
                                      <Card className="border border-gray-200 rounded-xl">
                                        <CardHeader className="pb-2 sm:pb-3">
                                          <CardTitle className="text-md sm:text-lg lg:text-xl text-gray-900 flex items-center">
                                            <BookOpen className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                                            Class Assignment
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 sm:space-y-4">
                                          <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Assigned Class</label>
                                            <Select
                                              value={selectedClassId || 'none'}
                                              onValueChange={(value) => setSelectedClassId(value === 'none' ? null : value)}
                                              disabled={!isSuperAdmin}
                                            >
                                              <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500">
                                                <SelectValue placeholder="Select a class" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="none">No Class Assigned</SelectItem>
                                                {getAvailableClasses(selectedRegistration.student.age).map((cls) => (
                                                  <SelectItem key={cls.id} value={cls.id}>
                                                    {cls.name} ({cls.currentStudents}/{cls.maxStudents} spots, Age {cls.ageMin}-{cls.ageMax})
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          {classUpdateError && (
                                            <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
                                              <AlertDescription className="text-red-800">{classUpdateError}</AlertDescription>
                                            </Alert>
                                          )}
                                          <Button
                                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-2.5"
                                            onClick={() => handleClassUpdate(selectedRegistration.student.id)}
                                            disabled={!isSuperAdmin || selectedClassId === selectedRegistration.student.classId}
                                          >
                                            Save Class Assignment
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              {registration.student.registrationStatus === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1 sm:py-1.5"
                                    onClick={() => handleStatusUpdate(registration.student.id, 'approved')}
                                    disabled={!isSuperAdmin}
                                  >
                                    <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-2 sm:px-3 py-1 sm:py-1.5"
                                    onClick={() => handleStatusUpdate(registration.student.id, 'rejected')}
                                    disabled={!isSuperAdmin}
                                  >
                                    <XCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                                  </Button>
                                </>
                              )}
                              {registration.student.registrationStatus !== 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(registration.student.id, 'pending')}
                                  className="rounded-lg hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 px-2 sm:px-3 py-1 sm:py-1.5"
                                  disabled={!isSuperAdmin}
                                >
                                  <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {pagination && pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} results
                  </p>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-lg px-2 sm:px-3 py-1 sm:py-1.5"
                    >
                      Previous
                    </Button>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="rounded-lg px-2 sm:px-3 py-1 sm:py-1.5"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}