
"use client";

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { getAuthToken, setAuthToken } from '@/lib/auth';
import type {
  AdminUser,
  ClassFormData,
  ClassWithDetails,
  ITeacher,
  LoginResponse,
  PaginatedData,
  QueryOptions,
  RegistrationRequest,
  RegistrationResponse,
  RegistrationWithDetails,
  TeacherFormData,
  ApiResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
console.log(API_BASE_URL);

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.token = getAuthToken();
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const apiResponse = response.data as ApiResponse;
        if (apiResponse && typeof apiResponse === 'object' && 'success' in apiResponse) {
          if (apiResponse.success) {
            if (apiResponse.pagination) {
              return {
                data: apiResponse.data,
                pagination: apiResponse.pagination,
              };
            }
            return apiResponse.data;
          } else {
            const errorMessage = apiResponse.error || apiResponse.message || 'Api request failed';
            throw new Error(errorMessage);
          }
        }
      },
      (error) => {
        if (error.response?.status === 401) {
          this.setToken(null);
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    setAuthToken(token);
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<any, LoginResponse>('/auth/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getProfile(): Promise<AdminUser> {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        console.log(`getProfile: Attempt ${attempt + 1}`);
        return await this.client.get('/auth/profile');
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) {
          console.error(`getProfile: Failed after ${attempt} attempts`, error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new Error("Failed to fetch profile after retries");
  }

  async updateProfile(data: Partial<AdminUser>): Promise<AdminUser> {
    return this.client.put('/auth/profile', data);
  }

  async createRegistration(data: RegistrationRequest): Promise<RegistrationResponse> {
    return this.client.post('/registrations', data);
  }

  async getRegistrations(params: QueryOptions = {}): Promise<PaginatedData<RegistrationWithDetails>> {
    const response = await this.client.get('/registrations', { params });
    return response as unknown as PaginatedData<RegistrationWithDetails>;
  }

  async getRegistrationById(studentId: string): Promise<RegistrationWithDetails> {
    return this.client.get(`/registrations/${studentId}`);
  }

  async updateRegistrationStatus(studentId: string, status: string): Promise<void> {
    return this.client.patch(`/registrations/${studentId}/status`, { status });
  }
  async updateRegistrationClass(studentId: string, classId: string | null): Promise<void> {
    return this.client.patch(`/registrations/${studentId}/class`, { classId });
  }

  async getClasses(age?: number): Promise<ClassWithDetails[]> {
    const params = age ? { age } : {};
    return this.client.get('/classes', { params });
  }

  async getClassById(classId: string): Promise<ClassWithDetails> {
    return this.client.get(`/classes/${classId}`);
  }

  async createClass(data: ClassFormData): Promise<ClassWithDetails> {
    return this.client.post('/classes', data);
  }

  async updateClass(classId: string, data: Partial<ClassFormData>): Promise<ClassWithDetails> {
    return this.client.put(`/classes/${classId}`, data);
  }

  async deleteClass(classId: string): Promise<void> {
    return this.client.delete(`/classes/${classId}`);
  }

  async getTeachers(): Promise<ITeacher[]> {
    return this.client.get('/teachers');
  }

  async getTeacherById(teacherId: string): Promise<ITeacher> {
    return this.client.get(`/teachers/${teacherId}`);
  }

  async createTeacher(data: TeacherFormData): Promise<ITeacher> {
    return this.client.post('/teachers', data);
  }

  async updateTeacher(teacherId: string, data: Partial<TeacherFormData>): Promise<ITeacher> {
    return this.client.put(`/teachers/${teacherId}`, data);
  }

  async deleteTeacher(teacherId: string): Promise<void> {
    return this.client.delete(`/teachers/${teacherId}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);