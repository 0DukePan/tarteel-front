'use client'
import { useAuthStore } from '@/lib/store/auth-store'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { AlertCircle, BookOpen, Lock, Mail } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { LoadingSpinner } from '../ui/loading-spinner'
import { useEffect, useState } from 'react'

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function AdminLogin() {
  const { admin, login, loading, error } = useAuthStore()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const pathname = usePathname()

  useEffect(() => {
    if (admin && !loading && pathname === "/admin/login" && !isRedirecting) {
      setIsRedirecting(true)
      router.push("/admin")
    }
  }, [admin, loading, pathname, isRedirecting, router])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl shadow-lg">
              <BookOpen className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</CardTitle>
          <p className="text-gray-600 text-lg">Sign in to your admin account</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`pl-10 rounded-xl border-2 transition-all duration-200 ${
                    errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                  }`}
                  placeholder="admin@quranschool.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={`pl-10 rounded-xl border-2 transition-all duration-200 ${
                    errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
                  }`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
