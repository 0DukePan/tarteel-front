'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { AlertCircle, BookOpen, Lock, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLogin() {
  const { admin, login, loading, error } = useAuthStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const pathname = usePathname();
  // Handle redirect only once when admin becomes available
  useEffect(() => {
    if (admin && !loading && !isRedirecting) {
      setIsRedirecting(true);
      router.replace("/admin/dashboard");
    }
  }, [admin, loading, isRedirecting, router]);
  

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // Don't manually redirect here - let the useEffect handle it
    } catch (err) {
      console.error('Login failed:', err);
      // Error is handled by the store
    }
  };

  // Show loading state if redirecting
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 sm:py-12">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 text-base sm:text-lg">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
      <CardHeader className="text-center pb-8 sm:pb-12">
        <div className="flex justify-center mb-4 sm:mb-8">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-lg">
            <BookOpen className="w-12 sm:w-16 h-12 sm:h-16 text-emerald-600" />
          </div>
        </div>
        <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Welcome Back</CardTitle>
        <p className="text-gray-600 text-base sm:text-lg lg:text-xl">Sign in to your admin account</p>
      </CardHeader>

      <CardContent className="space-y-6 sm:space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-red-800 text-base sm:text-lg">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="email" className="text-base sm:text-lg font-semibold text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 sm:w-6 h-5 sm:h-6" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={`pl-10 sm:pl-12 rounded-xl border-2 transition-all duration-200 ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                } h-12 sm:h-14 text-base sm:text-lg`}
                placeholder="admin@quranschool.com"
              />
            </div>
            {errors.email && (
              <p className="text-base flex items-center mt-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-base sm:text-lg font-semibold text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 sm:w-6 h-5 sm:h-6" />
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={`pl-10 sm:pl-12 rounded-xl border-2 transition-all duration-200 ${
                  errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
                } h-12 sm:h-14 text-base sm:text-lg`}
                placeholder="Enter your password"
              />
            </div>
            {errors.password && (
              <p className="text-base flex items-center mt-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2 sm:mr-3" />
                Signing in...
              </>
            ) : (
              'Sign In to Admin Panel'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}