/**
 * Dashboard Content Component
 * Shows user stats, courses, and progress information
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, TrendingUp, Clock, Award, Plus } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/ui/course-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export default function DashboardContent({ user }) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const showSuccessToast = toast?.success ?? ((message) => console.log(message));
  const showErrorToast = toast?.error ?? ((message, description) => console.error(message, description));
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleDeleteCourse = useCallback(
    async (course) => {
      try {
        const response = await fetch(`/api/courses/${course.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete course");
        }

        // Remove from local state
        setCourses((prev) => prev.filter((c) => c.courseId !== course.id));
        showSuccessToast(`Course "${course.title}" has been deleted.`);
      } catch (error) {
        console.error("Delete course error:", error);
        showErrorToast("Failed to delete course", "Please try again.");
      }
    },
    [showSuccessToast, showErrorToast]
  );

  const handleStartCourse = useCallback(async (course) => {
    window.location.href = `/dashboard/course/${course.id}`;
  }, []);

  const handleContinueCourse = useCallback(async (course) => {
    window.location.href = `/dashboard/course/${course.id}`;
  }, []);

  const handleRegenerateCourse = useCallback(
    async () => {
      showErrorToast(
        "Course regeneration not yet implemented",
        "Please create a new course instead."
      );
    },
    [showErrorToast]
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.id) {
          setStats(null);
          setCourses([]);
          setIsInitialLoad(false);
          setLoading(false);
          return;
        }

        setIsInitialLoad(true);
        setLoading(true);

        const response = await fetch("/api/progress/stats", {
          headers: { "Cache-Control": "max-age=30" },
        });

        const data = await response.json();

        if (data.success) {
          const nextStats = data.data.stats ?? null;
          const nextCourses = data.data.courses ?? [];
          setStats(nextStats);
          setCourses(nextCourses);
        } else {
          throw new Error(data.error || "Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        showErrorToast(
          "Failed to load dashboard",
          "Please refresh the page to try again"
        );
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, showErrorToast]);

  if (loading && isInitialLoad) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Courses skeleton */}
        <div className="bg-card border border-border rounded-xl shadow-sm animate-fade-in-up animation-delay-400">
          <div className="p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats && !loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            No data yet
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
            Start your learning journey by creating your first AI-powered course
          </p>
          <Link href="/create">
            <Button className="h-12 px-8 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 group">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Create Your First Course
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Continue your learning journey with AI-powered courses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Courses */}
        <div className="group relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up">
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Courses
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats?.totalCourses || 0}
              </p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="group relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up animation-delay-100">
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed Courses
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats?.completedCourses || 0}
              </p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="group relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up animation-delay-200">
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats?.overallProgress || 0}%
              </p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Chapters Completed */}
        <div className="group relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up animation-delay-300">
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Chapters Completed
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats?.completedChapters || 0}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  / {stats?.totalChapters || 0}
                </span>
              </p>
            </div>
            <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="group relative overflow-hidden bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up animation-delay-400">
        <div className="relative p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Your Courses
              </h2>
              <p className="text-base text-muted-foreground mt-1">
                Manage and continue your learning journey
              </p>
            </div>
            <Link href="/create">
              <Button className="h-11 px-6 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 group">
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative p-8">
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl flex items-center justify-center mb-6 animate-bounce">
                <BookOpen className="w-12 h-12 text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                No courses yet
              </h3>
              <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
                Start your learning journey by creating your first AI-powered
                course
              </p>
              <Link href="/create">
                <Button className="h-12 px-8 bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium transition-all duration-200 group">
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Create Your First Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={{
                    id: course.courseId,
                    title: course.courseTitle,
                    topic: course.courseTopic,
                    status: course.courseStatus,
                    studyType: course.studyType,
                    difficultyLevel: course.difficultyLevel,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt,
                    chaptersCount:
                      Number.parseInt(course.totalChapters, 10) || 0,
                    progress:
                      Number.parseInt(course.progressPercentage, 10) || 0,
                  }}
                  showActions={true}
                  showProgress={true}
                  onStart={handleStartCourse}
                  onContinue={handleContinueCourse}
                  onDelete={handleDeleteCourse}
                  onRegenerate={handleRegenerateCourse}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {courses.length > 0 && (
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-neutral-200/60 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up animation-delay-500">
          <div className="relative p-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {courses
                .filter((course) => course.lastAccessedAt)
                .sort(
                  (a, b) =>
                    new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt)
                )
                .slice(0, 5)
                .map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center gap-4 p-4 bg-neutral-50/60 rounded-xl hover:bg-neutral-100/60 transition-all duration-200 group hover-lift"
                  >
                    <div className="flex-shrink-0">
                      <ProgressRing
                        progress={parseInt(course.progressPercentage) || 0}
                        size="sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors duration-200">
                        {course.courseTitle}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {course.completedChapters}/{course.totalChapters}{" "}
                        chapters completed
                      </p>
                    </div>
                    <div className="text-sm text-neutral-500 font-medium">
                      {new Date(course.lastAccessedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
