"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  Clock,
  Loader2,
  Menu,
  MoveRight,
  NotebookText,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function formatDifficulty(level) {
  if (!level) return "";
  const normalized = level.toLowerCase();
  switch (normalized) {
    case "beginner":
    case "easy":
      return "Beginner";
    case "intermediate":
    case "medium":
      return "Intermediate";
    case "advanced":
    case "hard":
      return "Advanced";
    default:
      return level;
  }
}

function useChapterData(course, chapterId) {
  return useMemo(() => {
    if (!course?.chapters?.length) {
      return { chapter: null, chapterIndex: -1, nextChapter: null, previousChapter: null };
    }

    const chapterIndex = course.chapters.findIndex((chapter) => chapter.id === chapterId);

    if (chapterIndex === -1) {
      return { chapter: null, chapterIndex: -1, nextChapter: null, previousChapter: null };
    }

    const chapter = course.chapters[chapterIndex];
    const nextChapter = course.chapters[chapterIndex + 1] ?? null;
    const previousChapter = course.chapters[chapterIndex - 1] ?? null;

    return { chapter, chapterIndex, nextChapter, previousChapter };
  }, [course, chapterId]);
}

function QuizComponent({ quiz, onGenerate, isGenerating }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300/60 bg-neutral-50/60 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
        <div className="flex flex-col items-center gap-4">
          <Brain className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Test your knowledge with a quiz for this chapter.
          </p>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const question = quiz[currentQuestion];
  const isAnswered = answeredQuestions.includes(currentQuestion);

  const handleAnswer = (answer) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === question.correctAnswer) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions([...answeredQuestions, currentQuestion]);
  };

  const handleNext = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions([]);
  };

  if (currentQuestion >= quiz.length) {
    return (
      <div className="rounded-xl border border-neutral-200/60 bg-white p-8 text-center dark:border-neutral-800/60 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Quiz Complete!
          </h3>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            You scored {score} out of {quiz.length}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleRestart} variant="outline">
              Restart Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          Question {currentQuestion + 1} of {quiz.length}
        </Badge>
        <Badge variant="outline">
          Score: {score}/{answeredQuestions.length}
        </Badge>
      </div>

      <div className="rounded-xl border border-neutral-200/60 bg-white p-8 dark:border-neutral-800/60 dark:bg-neutral-950">
        <h3 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;
            const showResult = showExplanation;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  showResult && isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : showResult && isSelected && !isCorrect
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : isSelected
                    ? "border-primary bg-primary/10"
                    : "border-neutral-200 hover:border-primary/50 dark:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-neutral-900 dark:text-neutral-100">{option}</span>
                  {showResult && isCorrect && (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Explanation:
            </p>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
              {question.explanation}
            </p>
          </div>
        )}

        {showExplanation && currentQuestion < quiz.length - 1 && (
          <Button onClick={handleNext} className="mt-6 w-full">
            Next Question
          </Button>
        )}

        {showExplanation && currentQuestion === quiz.length - 1 && (
          <Button onClick={handleNext} className="mt-6 w-full">
            View Results
          </Button>
        )}
      </div>
    </div>
  );
}

function FlashcardComponent({ flashcards, onGenerate, isGenerating }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300/60 bg-neutral-50/60 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
        <div className="flex flex-col items-center gap-4">
          <BookOpen className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Review key concepts with flashcards for this chapter.
          </p>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Flashcards...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Flashcards
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const card = flashcards[currentCard];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          Card {currentCard + 1} of {flashcards.length}
        </Badge>
      </div>

      <div
        className="relative min-h-[300px] cursor-pointer rounded-xl border border-neutral-200/60 bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-950"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
          {!isFlipped ? (
            <>
              <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Question
              </p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {card.front}
              </p>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Answer
              </p>
              <p className="text-lg text-neutral-700 dark:text-neutral-300">
                {card.back}
              </p>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Click to flip
        </p>
      </div>

      <div className="flex justify-between gap-3">
        <Button onClick={handlePrevious} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Next
          <MoveRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function MarkdownContent({ content, onGenerate, isGenerating }) {
  if (!content?.trim()) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300/60 bg-neutral-50/60 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
        <div className="flex flex-col items-center gap-4">
          <NotebookText className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Chapter notes will appear here once they are generated.
          </p>
          <Button 
            onClick={onGenerate} 
            disabled={isGenerating}
            className="mt-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Notes...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Chapter Notes
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Parse content into structured sections
  const parseContent = (text) => {
    const lines = text.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      
      // Main heading (##)
      if (trimmed.startsWith('## ')) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          type: 'heading',
          title: trimmed.replace('## ', ''),
          content: []
        };
      }
      // Subheading (###)
      else if (trimmed.startsWith('### ')) {
        if (currentSection) {
          currentSection.content.push({
            type: 'subheading',
            text: trimmed.replace('### ', '')
          });
        }
      }
      // Bullet point
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (currentSection) {
          currentSection.content.push({
            type: 'bullet',
            text: trimmed.replace(/^[*-]\s/, '')
          });
        }
      }
      // Regular paragraph
      else if (trimmed) {
        if (currentSection) {
          currentSection.content.push({
            type: 'paragraph',
            text: trimmed
          });
        }
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const sections = parseContent(content);

  return (
    <article className="space-y-8">
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="space-y-4">
          {/* Main Heading */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b-2 border-indigo-500 pb-2">
            {section.title}
          </h2>
          
          {/* Content */}
          <div className="space-y-3 pl-4">
            {section.content.map((item, itemIdx) => {
              if (item.type === 'subheading') {
                return (
                  <h3 key={itemIdx} className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4">
                    {item.text}
                  </h3>
                );
              }
              
              if (item.type === 'bullet') {
                return (
                  <div key={itemIdx} className="flex items-start gap-3">
                    <div className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.text}</p>
                  </div>
                );
              }
              
              if (item.type === 'paragraph') {
                return (
                  <p key={itemIdx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.text}
                  </p>
                );
              }
              
              return null;
            })}
          </div>
        </div>
      ))}
    </article>
  );
}

export default function ChapterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { courseId, chapterId } = params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [activeTab, setActiveTab] = useState("notes"); // notes, quiz, flashcards

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success) {
          setCourse(data.data);
        } else {
          throw new Error(data.error || "Failed to load course");
        }
      } catch (err) {
        console.error("Error fetching course for chapter view:", err);
        setError(err.message || "Failed to load chapter");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const { chapter, chapterIndex, nextChapter, previousChapter } = useChapterData(course, chapterId);

  useEffect(() => {
    if (!loading && course && !chapter) {
      router.replace(`/dashboard/course/${courseId}`);
    }
  }, [chapter, course, courseId, loading, router]);

  // Fetch quiz and flashcards when chapter loads - MUST be before any conditional returns
  useEffect(() => {
    if (chapterId) {
      fetch(`/api/chapters/${chapterId}/quiz`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setQuiz(data.data);
          }
        })
        .catch(console.error);

      fetch(`/api/chapters/${chapterId}/flashcards`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFlashcards(data.data);
          }
        })
        .catch(console.error);
    }
  }, [chapterId]);

  const handleGenerateNotes = async () => {
    try {
      setIsGenerating(true);
      setError(null); // Clear any previous errors

      console.log(`[Frontend] Starting notes generation for chapter ${chapterId}`);

      const response = await fetch(`/api/chapters/${chapterId}/generate-content`, {
        method: "POST",
      });

      console.log(`[Frontend] Response status: ${response.status}`);

      const data = await response.json();
      console.log(`[Frontend] Response raw data:`, data);

      if (data.success) {
        console.log(`[Frontend] Notes generated successfully, refreshing course data`);
        // Refresh the course data to get the new notes
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        const courseData = await courseResponse.json();
        if (courseData.success) {
          setCourse(courseData.data);
          console.log(`[Frontend] Course data refreshed successfully`);
        } else {
          console.error(`[Frontend] Failed to refresh course data:`, courseData);
        }
      } else if (data.raw) {
        // Surface raw generation output when JSON parsing fails server-side
        const errorMsg = data.error || "Failed to generate notes";
        console.error(`[Frontend] Generation failed with raw output:`, {
          message: errorMsg,
          details: data.details,
          raw: data.raw?.substring?.(0, 500) || data.raw
        });
        throw new Error(`${errorMsg}. Please try again or adjust the chapter content.`);
      } else {
        const errorMsg = data.error || "Failed to generate notes";
        console.error(`[Frontend] Generation failed:`, errorMsg, data.details);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("[Frontend] Error generating notes:", err);

      if (err?.cause?.rawResponse) {
        console.error("[Frontend] AI raw response preview:", err.cause.rawResponse?.substring?.(0, 500));
      }

      console.error("[Frontend] Error stack:", err.stack);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/chapters/${chapterId}/quiz`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setQuiz(data.data);
        setActiveTab("quiz");
      } else {
        throw new Error(data.error || "Failed to generate quiz");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/chapters/${chapterId}/flashcards`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setFlashcards(data.data);
        setActiveTab("flashcards");
      } else {
        throw new Error(data.error || "Failed to generate flashcards");
      }
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-neutral-600">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="text-sm">Loading your chapter notes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Unable to load chapter</h2>
          <p className="text-neutral-600 dark:text-neutral-300">{error}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!course || !chapter) {
    return null;
  }

  const difficultyLabel = formatDifficulty(course.difficultyLevel);
  const chapterNotes = Array.isArray(chapter.notes) ? chapter.notes : [];
  const combinedNotes = chapterNotes.map((note) => note.content).join("\n\n");

  const renderSidebar = (onNavigate) => (
    <nav className="space-y-3">
      {course.chapters.map((item, index) => {
        const isActive = item.id === chapter.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
              isActive
                ? "border-primary/20 bg-primary/10 text-primary-900 shadow-sm dark:border-primary/30 dark:bg-primary/20 dark:text-primary-100"
                : "border-transparent bg-neutral-100/60 text-neutral-700 hover:border-primary/20 hover:bg-white hover:text-primary-600 dark:bg-neutral-900/40 dark:text-neutral-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400"
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium leading-tight line-clamp-2">{item.title}</p>
                {item.summary && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );

  const handleNavigate = (nextChapterId) => {
    router.push(`/dashboard/course/${courseId}/chapter/${nextChapterId}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="hidden rounded-2xl border border-neutral-200/60 bg-white/90 p-5 shadow-soft dark:border-neutral-800/60 dark:bg-neutral-950/80 dark:shadow-none lg:block">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Course outline
            </p>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {course.title}
            </h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {difficultyLabel}
          </Badge>
        </div>
        <div className="h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80" />
        <div className="mt-5 space-y-3">
          {renderSidebar(handleNavigate)}
        </div>
      </aside>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200/60 bg-white/90 p-6 shadow-soft dark:border-neutral-800/60 dark:bg-neutral-950/90 dark:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                <Link href={`/dashboard/course/${courseId}`} className="hover:text-primary-600 dark:hover:text-primary-300">
                  Back to course
                </Link>
                <MoveRight className="h-4 w-4" />
                <span>Chapter {chapterIndex + 1}</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                {chapter.title}
              </h1>
              {chapter.summary && (
                <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl">
                  {chapter.summary}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2 text-xs">
                <NotebookText className="h-4 w-4" />
                {course.studyType}
              </Badge>
              <Badge className="bg-primary/90">
                {difficultyLabel}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {course.progressMetadata?.estimatedChapterDuration ?? "Self-paced"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>These notes adapt to your selected {difficultyLabel?.toLowerCase()} level.</span>
            </div>

            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => {
                const nextChapterId = nextChapter?.id ?? previousChapter?.id ?? course.chapters?.[0]?.id;
                if (nextChapterId) {
                  handleNavigate(nextChapterId);
                }
              }}
            >
              <Menu className="mr-2 h-4 w-4" />
              Chapters
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-2xl border border-neutral-200/60 bg-white/90 p-2 shadow-soft dark:border-neutral-800/60 dark:bg-neutral-950/90">
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "notes"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            <NotebookText className="mr-2 inline-block h-4 w-4" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "quiz"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            <Brain className="mr-2 inline-block h-4 w-4" />
            Quiz {quiz.length > 0 && `(${quiz.length})`}
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "flashcards"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            <BookOpen className="mr-2 inline-block h-4 w-4" />
            Flashcards {flashcards.length > 0 && `(${flashcards.length})`}
          </button>
        </div>

        {/* Content Area */}
        <div className="rounded-3xl border border-neutral-200/60 bg-white/90 p-8 shadow-soft transition-all duration-200 dark:border-neutral-800/60 dark:bg-neutral-950">
          {activeTab === "notes" && (
            <MarkdownContent 
              content={combinedNotes} 
              onGenerate={handleGenerateNotes}
              isGenerating={isGenerating}
            />
          )}
          {activeTab === "quiz" && (
            <QuizComponent 
              quiz={quiz} 
              onGenerate={handleGenerateQuiz}
              isGenerating={isGenerating}
            />
          )}
          {activeTab === "flashcards" && (
            <FlashcardComponent 
              flashcards={flashcards} 
              onGenerate={handleGenerateFlashcards}
              isGenerating={isGenerating}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/60 bg-white/80 p-5 shadow-soft dark:border-neutral-800/60 dark:bg-neutral-950/80">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Looking to explore another chapter?
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your progress will update automatically as you review chapters.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {previousChapter && (
              <Button
                variant="outline"
                onClick={() => handleNavigate(previousChapter.id)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
            {nextChapter ? (
              <Button onClick={() => handleNavigate(nextChapter.id)} className="flex items-center gap-2">
                Next chapter
                <MoveRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <Link href={`/dashboard/course/${courseId}`} className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Back to overview
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}