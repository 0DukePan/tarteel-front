import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { ClassFormData, ClassWithDetails } from "../types";

interface ClassState {
  classes: ClassWithDetails[];
  loading: boolean;
  error: string | null;
  fetchClasses: (age?: number) => Promise<void>;
  getClassById: (classId: string) => Promise<ClassWithDetails | null>;
  createClass: (data: ClassFormData) => Promise<void>;
  updateClass: (classId: string, data: Partial<ClassFormData>) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  loading: false,
  error: null,

  fetchClasses: async (age?: number) => {
    set({ loading: true, error: null });
    try {
      const classes = await apiClient.getClasses(age);
      set({ classes, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch classes",
        loading: false,
      });
    }
  },

  getClassById: async (classId: string) => {
    try {
      const classData = await apiClient.getClassById(classId);
      return classData;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch class",
      });
      return null;
    }
  },

  createClass: async (data: ClassFormData) => {
    set({ loading: true, error: null });
    try {
      await apiClient.createClass(data);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create class",
        loading: false,
      });
      throw error;
    }
  },

  updateClass: async (classId: string, data: Partial<ClassFormData>) => {
    set({ loading: true, error: null });
    try {
      await apiClient.updateClass(classId, data);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update class",
        loading: false,
      });
      throw error;
    }
  },

  deleteClass: async (classId: string) => {
    set({ loading: true, error: null });
    try {
      await apiClient.deleteClass(classId);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete class",
        loading: false,
      });
      throw error;
    }
  },
}));