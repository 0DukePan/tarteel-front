"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/lib/auth";
import type { AdminUser } from "@/lib/types";

interface AuthState {
  admin: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<AdminUser>) => Promise<void>;
  lastCheckAuthTime: number | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  admin: null,
  loading: false,
  error: null,
  lastCheckAuthTime: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.token);
      set({ admin: response.admin, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        loading: false,
      });
      throw error;
    }
  },

  logout: () => {
    apiClient.setToken(null);
    removeAuthToken();
    set({ admin: null, error: null, loading: false, lastCheckAuthTime: null });
  },

  checkAuth: async () => {
    const now = Date.now();
    const lastCheck = get().lastCheckAuthTime;
    const debounceTime = 5000;
    if (lastCheck && now - lastCheck < debounceTime) {
      ("checkAuth debounced: Skipping due to recent call");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      apiClient.setToken(null);
      set({ admin: null, loading: false, lastCheckAuthTime: now });
      return;
    }

    set({ loading: true });
    try {
      apiClient.setToken(token);
      const admin = await apiClient.getProfile();
      set({ admin, loading: false, lastCheckAuthTime: now });
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        apiClient.setToken(null);
        removeAuthToken();
        set({ admin: null, loading: false, lastCheckAuthTime: now });
      } else {
        console.error("Auth check failed:", error);
        set({ loading: false, lastCheckAuthTime: now });
      }
    }
  },

  updateProfile: async (data: Partial<AdminUser>) => {
    set({ loading: true, error: null });
    try {
      const admin = await apiClient.updateProfile(data);
      set({ admin, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Update failed",
        loading: false,
      });
      throw error;
    }
  },
}));