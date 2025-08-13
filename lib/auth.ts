"use client";

import Cookies from 'js-cookie';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('auth_token') || null;
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    Cookies.set('auth_token', token, {
      expires: 7, // 7 days, matching JWT expiresIn
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'strict', // Prevent CSRF
      path: '/',
    });
    ('setAuthToken: Token set in cookie');
  } else {
    Cookies.remove('auth_token', { path: '/' });
    ('setAuthToken: Token removed from cookie');
  }
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove('auth_token', { path: '/' });
  ('removeAuthToken: Token removed from cookie');
}