"use client";

import React, { useState, useEffect, useCallback } from "react";
import SelectOptions from "./_components/SelectOptions"; // must be a client component
import TopicInput from "./_components/TopicInput"; // must be a client component
import { Button } from "@/components/ui/button"; // must be a client component
import apiClient from "../../api-client"; // ensure it's safe to use in client
import { useUser } from "@clerk/nextjs"; // only in client
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

function Create() {
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    topic: "",
    studyType: "",
    difficultyLevel: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [courseCount, setCourseCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [progressStatus, setProgressStatus] = useState({ status: null, etaMs: null });
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  const resetForm = useCallback(() => {
    setFormData({ topic: "", studyType: "", difficultyLevel: "" });
    setStep(0);
    setProgressStatus({ status: null, etaMs: null });
    setLimitReached(false);
    setLimitMessage("");
  }, []);

  // Fetch user profile and course count
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !user) return;
      
      try {
        setProfileLoading(true);
        const [profileResponse, coursesResponse] = await Promise.all([
          apiClient.get("/api/user/profile"),
          apiClient.get("/api/courses")
        ]);
        
        if (profileResponse.data?.success) {
          setUserProfile(profileResponse.data.data);
        }
        
        if (coursesResponse.data?.success) {
          setCourseCount(coursesResponse.data.data?.length || 0);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, user]);

  const handleUserInput = useCallback((fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue?.trim?.() || fieldValue,
    }));
  }, []);

  // Defensive, well-logged create course request
  const createCourseRecord = useCallback(async ({ topic, studyType, difficultyLevel }) => {
    try {
      console.log("[createCourseRecord] Starting API call with data:", { topic, studyType, difficultyLevel });

      const response = await apiClient.post("/api/courses", {
        topic,
        studyType,
        difficultyLevel,
      });

      // defensive extraction of response
      const success = response?.data?.success;
      const data = response?.data?.data || response?.data || null;

      console.log("[createCourseRecord] API response:", response);

      if (data?.limitReached) {
        const limitError = new Error(data?.message || "Course creation limit reached.");
        limitError.code = data?.code || "SUBSCRIPTION_LIMIT";
        limitError.response = response;
        limitError.limitReached = true;
        throw limitError;
      }

      // Accept multiple possible shapes:
      // - { success: true, data: { courseId: "...", ... } }
      // - { success: true, courseId: "..." }
      // - legacy responses with id field
      const courseId = data?.courseId || data?.id || data?.course?.id || null;

      if (!success || !courseId) {
        // Provide as much context as possible in the thrown error
        const errMsg = response?.data?.error || "Failed to queue course generation";
        const err = new Error(errMsg);
        err.response = response;
        throw err;
      }

      return { courseId, raw: data };
    } catch (error) {
      // Deep logging for debugging
      console.error("createCourseRecord error - Full error:", error);
      console.error("createCourseRecord error - Details:", {
        message: error?.message,
        response: error?.response?.data ?? error?.response,
        status: error?.response?.status,
        stack: error?.stack,
      });
      console.error("createCourseRecord error - Stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

      // Rewrap error with friendly message while preserving original
      const message = error?.response?.data?.error || error?.message || "Error creating course record";
      const wrapped = new Error(message);
      wrapped.original = error;
      wrapped.limitReached = error?.limitReached ?? false;
      wrapped.code = error?.code;
      throw wrapped;
    }
  }, []);

  // Robust polling with exponential backoff, max attempts, and defensive checks
  const pollCourseStatus = useCallback(async (courseId) => {
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // total tries before timeout
    let pollInterval = 2000; // starting at 2s
    const MAX_POLL_INTERVAL = 5000; // cap at 5s

    const poll = async () => {
      attempts += 1;

      if (attempts > MAX_ATTEMPTS) {
        const timeoutErr = new Error("Course generation timed out. Please try again.");
        timeoutErr.code = "POLL_TIMEOUT";
        throw timeoutErr;
      }

      try {
        const response = await apiClient.get(`/api/courses/${courseId}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        const course = response?.data?.data || response?.data || null;

        if (!course) {
          // If backend returns no course object, treat as transient
          console.warn(`[pollCourseStatus] Empty course response on attempt ${attempts}`, response);
          // small delay then retry
          await new Promise((r) => setTimeout(r, Math.min(1000 * attempts, MAX_POLL_INTERVAL)));
          return poll();
        }

        // Normalize status variants
        const status = (course.status || course.state || "").toString().toLowerCase();

        setProgressStatus({ status, etaMs: course.progressMetadata?.etaMs ?? null });

        // Accept 'ready' or 'completed' as success
        if (status === "ready" || status === "completed" || status === "done") {
          setCourseCount((prev) => prev + 1);
          resetForm();
          return course;
        }

        if (status === "failed" || status === "error") {
          const metaErr = course.progressMetadata?.error || course.error || "Course generation failed";
          const e = new Error(metaErr);
          e.response = response;
          throw e;
        }

        // Not ready yet — wait then continue with slight exponential backoff
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        pollInterval = Math.min(Math.ceil(pollInterval * 1.2), MAX_POLL_INTERVAL);
        return poll();
      } catch (error) {
        // If 404, the resource may not be created yet — retry with small backoff
        if (error?.response?.status === 404) {
          const backoff = Math.min(1200 * Math.pow(1.4, attempts - 1), MAX_POLL_INTERVAL);
          console.warn(`[pollCourseStatus] 404 for course ${courseId}, retrying in ${Math.round(backoff)}ms`);
          await new Promise((r) => setTimeout(r, backoff));
          return poll();
        }

        // Network errors may have no response — retry a few times before failing
        if (!error?.response && attempts < 6) {
          const retryDelay = Math.min(1000 * attempts, 3000);
          console.warn(`[pollCourseStatus] Network error, retrying in ${retryDelay}ms`, error);
          await new Promise((r) => setTimeout(r, retryDelay));
          return poll();
        }

        console.error("[pollCourseStatus] Final polling error:", error);
        throw error;
      }
    };

    return poll();
  }, [resetForm]);

  const GenerateCourseOutline = async () => {
    if (!isLoaded || !user) {
      setError("User not loaded yet. Please wait.");
      return;
    }

    const requiredFields = ["topic", "studyType", "difficultyLevel"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Missing field: ${field}`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setProgressStatus({ status: "generating", etaMs: null });
    setLimitReached(false);
    setLimitMessage("");

    try {
      const { courseId } = await createCourseRecord(formData);

      // Defensive: ensure courseId exists
      if (!courseId) throw new Error("No courseId returned from server.");

      await pollCourseStatus(courseId);
    } catch (error) {
      // Deep logging for debugging
      console.error("Course creation failed - Full error:", error);
      console.error("Course creation failed - Details:", {
        message: error?.message,
        response: error?.response?.data ?? error?.response,
        status: error?.response?.status,
        stack: error?.stack,
      });
      console.error("Course creation failed - Stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to generate course outline. Please try again.";

      setError(errorMessage);
      setProgressStatus({ status: "failed", etaMs: null });
    } finally {
      setLoading(false);
    }
  };

  // No subscription limits

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Create Your AI-Powered Course
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any topic into a comprehensive learning experience with AI-generated chapters, notes, flashcards, and quizzes
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${step >= 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                1
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Study Type</span>
            </div>
            <div className={`h-1 w-16 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Topic & Level</span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-card rounded-xl shadow-lg p-8 md:p-12 border border-border">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-destructive font-medium">Error</p>
                <p className="text-destructive/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="min-h-[400px]">
            {step === 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Study Type</h2>
                <p className="text-muted-foreground mb-8">Select the format that best suits your learning style</p>
                <SelectOptions
                  selectedStudyType={(value) => handleUserInput("studyType", value)}
                  value={formData.studyType}
                  loading={loading}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Define Your Topic</h2>
                <p className="text-muted-foreground mb-8">Tell us what you want to learn and your current level</p>
                <TopicInput
                  topic={formData.topic}
                  difficultyLevel={formData.difficultyLevel}
                  setTopic={(value) => handleUserInput("topic", value)}
                  setDifficultyLevel={(value) => handleUserInput("difficultyLevel", value)}
                />
              </div>
            )}
          </div>

          {/* Progress Status */}
          {progressStatus.status && (
            <div className={`mt-8 p-6 rounded-lg border ${
              progressStatus.status === "generating" 
                ? "bg-primary/10 dark:bg-primary/20 border-primary/20" 
                : progressStatus.status === "failed"
                ? "bg-destructive/10 border-destructive/20"
                : "bg-green-500/10 border-green-500/20"
            }`}>
              <div className="flex items-start space-x-4">
                {progressStatus.status === "generating" && (
                  <Loader2 className="h-6 w-6 text-primary animate-spin flex-shrink-0 mt-1" />
                )}
                {progressStatus.status === "failed" && (
                  <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                )}
                {progressStatus.status === "ready" && (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${
                    progressStatus.status === "generating" 
                      ? "text-primary" 
                      : progressStatus.status === "failed"
                      ? "text-destructive"
                      : "text-green-700 dark:text-green-500"
                  }`}>
                    {progressStatus.status === "generating"
                      ? "Creating Your Course..."
                      : progressStatus.status === "failed"
                      ? "Generation Failed"
                      : "Course Ready!"}
                  </p>
                  <p className={`text-sm mt-1 ${
                    progressStatus.status === "generating" 
                      ? "text-primary/80" 
                      : progressStatus.status === "failed"
                      ? "text-destructive/80"
                      : "text-green-600/80 dark:text-green-500/80"
                  }`}>
                    {progressStatus.status === "generating"
                      ? "We're assembling chapters, notes, flashcards, and quizzes. This typically takes 20-30 seconds."
                      : progressStatus.status === "failed"
                      ? "Something went wrong. Please try again or contact support if the issue persists."
                      : "Your course is ready! Head to your dashboard to start learning."}
                  </p>
                  {progressStatus.status === "ready" && (
                    <Link href="/dashboard">
                      <Button className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                        Go to Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
            {step !== 0 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button variant="ghost">
                  Back to Dashboard
                </Button>
              </Link>
            )}

            {step === 0 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!formData.studyType || loading}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={GenerateCourseOutline}
                disabled={!isLoaded || !user || loading}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Course</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-indigo-600 font-semibold mb-1">AI-Powered</div>
            <div className="text-sm text-gray-600">Advanced AI creates personalized content</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-indigo-600 font-semibold mb-1">Comprehensive</div>
            <div className="text-sm text-gray-600">Chapters, notes, flashcards & quizzes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-indigo-600 font-semibold mb-1">Fast Generation</div>
            <div className="text-sm text-gray-600">Ready in under 30 seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Create;
