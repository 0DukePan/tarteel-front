import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"], // Reduce to one weight to minimize requests
  fallback: ["system-ui", "arial"], // Fallback to system fonts
});

export const metadata: Metadata = {
  title: "Quran School Management System",
  description: "A comprehensive system for managing Quran school registrations, classes, and teachers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}