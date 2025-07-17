
"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { BookOpen, Users, Award, Clock, Star, ArrowRight } from "lucide-react";
import { useClassStore } from "@/lib/store/class-store";
import { apiClient } from "@/lib/api";
import type { ClassWithDetails, ITeacher } from "@/lib/types";

interface Stat {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  color: string;
}

export function HeroSection() {
  const { classes, fetchClasses, loading: classesLoading, error: classesError } = useClassStore();
  const [teachersCount, setTeachersCount] = useState<number | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch classes and teachers
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch classes without age filter to get all available classes
        await fetchClasses();
        // Fetch teachers
        const teachers = await apiClient.getTeachers();
        setTeachersCount(teachers.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        // Fallback stats in case of error
        setStats([
          { icon: BookOpen, value: "4+", label: "Expert Teachers", color: "emerald" },
          { icon: Users, value: "10+", label: "Class Options", color: "teal" },
          { icon: Award, value: "5-14", label: "Age Range", color: "cyan" },
          { icon: Clock, value: "2hr", label: "Class Duration", color: "blue" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchClasses]);

  useEffect(() => {
    if (classesLoading || teachersCount === null) return;

    // Calculate dynamic stats
    const classCount = classes.length;

    // Compute age range
    const ageMin = Math.min(...classes.map((cls) => cls.ageMin), 5);
    const ageMax = Math.max(...classes.map((cls) => cls.ageMax), 14);
    const ageRange = `${ageMin}-${ageMax}`;

    // Compute average class duration
    const durations = classes.map((cls) => {
      const [startHour, startMinute] = cls.startTime.split(":").map(Number);
      const [endHour, endMinute] = cls.endTime.split(":").map(Number);
      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      return end - start;
    });
    const avgDuration = durations.length > 0 ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length : 120;
    const durationHours = Math.round(avgDuration / 60);

    setStats([
      { icon: BookOpen, value: `${teachersCount}+`, label: "Expert Teachers", color: "emerald" },
      { icon: Users, value: `${classCount}+`, label: "Class Options", color: "teal" },
      { icon: Award, value: ageRange, label: "Age Range", color: "cyan" },
      { icon: Clock, value: `${durationHours}hr`, label: "Class Duration", color: "blue" },
    ]);
  }, [classes, classesLoading, teachersCount]);

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 lg:py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Premium Islamic Education
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Learn the Holy Quran with{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Join our comprehensive Quran learning program designed for children ages 5-14. Expert teachers,
                structured curriculum, and a nurturing Islamic environment that fosters spiritual growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })}
              >
                Register Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                onClick={() => document.getElementById("classes")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Classes
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {loading ? (
                <div className="col-span-4 text-center text-gray-600">Loading statistics...</div>
              ) : error ? (
                <div className="col-span-4 text-center text-red-600">{error}</div>
              ) : (
                stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div
                      className={`bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:rotate-0 rotate-2 transition-transform duration-500 hover:shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl"></div>
              <img
                src="/images/tarteel.png"
                alt="Children learning Quran"
                className="w-full h-80 object-cover rounded-2xl relative z-10"
              />
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-xl z-20">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm opacity-90">Islamic Environment</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">Expert Teaching</div>
                  <div className="text-sm text-gray-600">Qualified Instructors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
