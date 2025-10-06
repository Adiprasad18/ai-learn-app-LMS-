/**
 * Enhanced Course Card Component
 * Displays course information with progress, status, and actions
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, BookOpen, Brain, Target, Play, Pause, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./progress";

const statusConfig = {
  draft: {
    icon: AlertCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    label: "Draft"
  },
  generating: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    label: "Generating",
    animate: "animate-spin"
  },
  ready: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100",
    label: "Ready"
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-100",
    label: "Failed"
  }
};

const difficultyConfig = {
  beginner: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Beginner"
  },
  intermediate: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    label: "Intermediate"
  },
  advanced: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Advanced"
  }
};

const studyTypeConfig = {
  exam: {
    icon: Target,
    label: "Exam Prep",
    color: "text-purple-600"
  },
  project: {
    icon: Brain,
    label: "Project",
    color: "text-blue-600"
  },
  research: {
    icon: BookOpen,
    label: "Research",
    color: "text-indigo-600"
  },
  general: {
    icon: BookOpen,
    label: "General",
    color: "text-gray-600"
  }
};

export function CourseCard({ 
  course, 
  onStart, 
  onContinue, 
  onDelete, 
  onRegenerate,
  showActions = true,
  compact = false 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const status = statusConfig[course.status] || statusConfig.draft;
  const difficulty = difficultyConfig[course.difficultyLevel] || difficultyConfig.beginner;
  const studyType = studyTypeConfig[course.studyType] || studyTypeConfig.general;

  const StatusIcon = status.icon;
  const StudyTypeIcon = studyType.icon;

  const progress = course.progress || 0;
  const isCompleted = progress >= 100;
  const canStart = course.status === 'ready' && progress === 0;
  const canContinue = course.status === 'ready' && progress > 0 && progress < 100;
  const canRegenerate = course.status === 'failed' || course.status === 'ready';

  const handleAction = async (action, actionName, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (isLoading) return;

    setIsLoading(true);
    setLoadingAction(actionName);

    try {
      await action();
    } catch (error) {
      console.error(`Error during ${actionName}:`, error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const estimatedTime = () => {
    const baseTime = 30; // Base 30 minutes
    const chapterMultiplier = (course.chaptersCount || 4) * 15;
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.3,
      advanced: 1.6
    };
    
    return Math.round(baseTime + chapterMultiplier * (difficultyMultiplier[course.difficultyLevel] || 1));
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                <StatusIcon className={`w-3 h-3 ${status.animate || ''}`} />
                {status.label}
              </div>
            </div>
            <p className="text-sm text-gray-600 truncate">{course.topic}</p>
            {progress > 0 && (
              <div className="mt-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
              </div>
            )}
          </div>
          {showActions && (
            <div className="ml-4">
              {canStart && (
                <Button
                  size="sm"
                  onClick={(e) => handleAction(() => onStart(course), 'start', e)}
                  disabled={isLoading}
                >
                  {loadingAction === 'start' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              {canContinue && (
                <Button
                  size="sm"
                  onClick={(e) => handleAction(() => onContinue(course), 'continue', e)}
                  disabled={isLoading}
                >
                  {loadingAction === 'continue' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link href={`/dashboard/course/${course.id}`} className="block group">
      <div className="relative bg-card/80 dark:bg-card/60 backdrop-blur-xl rounded-2xl border border-border/40 dark:border-border/20 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-primary/30 hover:border-border/60 dark:hover:border-border/30 hover:scale-[1.02]">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground dark:text-foreground mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              {course.title}
            </h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm line-clamp-2 mb-3">
              {course.summary || course.topic}
            </p>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${status.bgColor} ${status.color} ml-4 border border-border/40 dark:border-border/20 shadow-sm`}>
            <StatusIcon className={`w-4 h-4 ${status.animate || ''}`} />
            {status.label}
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground dark:text-foreground">Progress</span>
              <span className="text-sm text-primary dark:text-primary font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            {isCompleted && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/20 dark:to-primary/20 rounded-xl border border-accent/30 dark:border-accent/40 shadow-lg shadow-accent/20 dark:shadow-accent/30">
                <CheckCircle className="w-4 h-4 text-accent dark:text-accent" />
                <span className="text-sm font-bold text-accent dark:text-accent">Completed!</span>
              </div>
            )}
          </div>
        )}

        {/* Course Metadata */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 dark:bg-muted/30 rounded-xl border border-border/40 dark:border-border/20 shadow-sm hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300">
            <StudyTypeIcon className={`w-4 h-4 ${studyType.color}`} />
            <span className="text-sm text-foreground dark:text-foreground font-semibold">{studyType.label}</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border ${difficulty.bgColor} ${difficulty.color} border-border/40 dark:border-border/20 shadow-sm`}>
            {difficulty.label}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 dark:bg-muted/30 rounded-xl border border-border/40 dark:border-border/20 shadow-sm hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300">
            <Clock className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <span className="text-sm text-foreground dark:text-foreground font-semibold">~{estimatedTime()} min</span>
          </div>

          {course.chaptersCount && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 dark:bg-muted/30 rounded-xl border border-border/40 dark:border-border/20 shadow-sm hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/20 transition-all duration-300">
              <BookOpen className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
              <span className="text-sm text-foreground dark:text-foreground font-semibold">{course.chaptersCount} chapters</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative px-6 py-4 bg-muted/30 dark:bg-muted/20 border-t border-border/40 dark:border-border/20">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground dark:text-muted-foreground font-medium">
            Created {formatDate(course.createdAt)}
            {course.updatedAt && course.updatedAt !== course.createdAt && (
              <span className="ml-1">• Updated {formatDate(course.updatedAt)}</span>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {course.status === 'failed' && canRegenerate && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleAction(() => onRegenerate(course), 'regenerate', e)}
                  disabled={isLoading}
                >
                  {loadingAction === 'regenerate' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Retry'
                  )}
                </Button>
              )}
              
              {canStart && (
                <Button 
                  size="sm"
                  onClick={() => handleAction(() => onStart(course), 'start')}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loadingAction === 'start' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Course
                </Button>
              )}
              
              {canContinue && (
                <Button 
                  size="sm"
                  onClick={() => handleAction(() => onContinue(course), 'continue')}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loadingAction === 'continue' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Continue
                </Button>
              )}
              
              {isCompleted && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction(() => onContinue(course), 'review')}
                  disabled={isLoading}
                >
                  {loadingAction === 'review' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <BookOpen className="w-4 h-4 mr-2" />
                  )}
                  Review
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAction(() => onDelete(course), 'delete')}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {loadingAction === 'delete' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </Link>
  );
}
