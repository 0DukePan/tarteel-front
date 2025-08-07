"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api";
import type { RegistrationWithDetails, RegistrationRequest, QueryOptions, PaginationInfo } from "@/lib/types";

interface RegistrationState {
  registrations: RegistrationWithDetails[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  submitRegistration: (data: RegistrationRequest) => Promise<{ studentId: string; parentId: string }>;
  fetchRegistrations: (params?: QueryOptions) => Promise<{
    data: RegistrationWithDetails[];
    pagination: PaginationInfo;
  }>;
  getRegistrationById: (studentId: string) => Promise<RegistrationWithDetails | null>;
  updateRegistrationStatus: (studentId: string, status: string) => Promise<void>;
  updateRegistrationClass: (studentId: string, classId: string | null) => Promise<void>;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registrations: [],
  loading: false,
  error: null,
  pagination: null,

  submitRegistration: async (data: RegistrationRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.createRegistration(data);
      set({ loading: false });
      return response;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error instanceof Error ? error.message : "Failed to create registration");
      set({
        error: message,
        loading: false,
      });
      throw new Error(message); 
    }
  },
  
  fetchRegistrations: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.getRegistrations(params);
      set({ registrations: response.data, pagination: response.pagination, loading: false });
      return response; // Return the response object
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch registrations",
        loading: false,
      });
      throw error; // Re-throw to handle in the caller if needed
    }
  },

  getRegistrationById: async (studentId: string) => {
    try {
      const response = await apiClient.getRegistrationById(studentId);
      return response;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch registration",
      });
      return null;
    }
  },

  updateRegistrationStatus: async (studentId: string, status: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.updateRegistrationStatus(studentId, status);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update registration status",
        loading: false,
      });
      throw error;
    }
  },

  updateRegistrationClass: async (studentId: string, classId: string | null) => {
    set({ loading: true, error: null });
    try {
      await apiClient.updateRegistrationClass(studentId, classId);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update registration class",
        loading: false,
      });
      throw error;
    }
  },
}));