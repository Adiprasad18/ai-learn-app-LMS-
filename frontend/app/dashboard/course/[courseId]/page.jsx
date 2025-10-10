"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Clock, CheckCircle, Play, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const courseId = params.courseId;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.error || "Failed to load course");
        }
      } catch (err) {
        setError("Failed to load course");
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || "Course not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            The course you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const progress = course.progress || 0;
  const completedChapters = course.chapters?.filter(ch => ch.completed) || [];
  const totalChapters = course.chapters?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600 mt-1">{course.topic}</p>
        </div>
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Overview
            </CardTitle>
            <Badge variant={course.status === 'ready' ? 'default' : 'secondary'}>
              {course.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.summary && (
            <p className="text-gray-700">{course.summary}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                {totalChapters} Chapter{totalChapters !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm">{course.difficultyLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{course.studyType}</span>
            </div>
          </div>

          {progress > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chapters */}
      <Card>
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
        </CardHeader>
        <CardContent>
          {course.chapters && course.chapters.length > 0 ? (
            <div className="space-y-3">
              {course.chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{chapter.title}</h3>
                      {chapter.summary && (
                        <p className="text-sm text-gray-600 mt-1">{chapter.summary}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {chapter.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    <Button
                      asChild
                      size="sm"
                      variant={chapter.completed ? "outline" : "default"}
                      className="flex items-center gap-2"
                    >
                      <Link href={`/dashboard/course/${courseId}/chapter/${chapter.id}`}>
                        {chapter.completed ? "Review" : "Start"}
                        <Play className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No chapters available yet.</p>
              <p className="text-sm text-gray-500 mt-1">The course is being generated.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Resources */}
      {(course.flashcards?.length > 0 || course.quizzes?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {course.flashcards?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Flashcards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Practice with {course.flashcards.length} flashcards
                </p>
                <Button variant="outline" className="w-full">
                  Start Flashcards
                </Button>
              </CardContent>
            </Card>
          )}

          {course.quizzes?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Test your knowledge with {course.quizzes.length} quizzes
                </p>
                <Button variant="outline" className="w-full">
                  Take Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}