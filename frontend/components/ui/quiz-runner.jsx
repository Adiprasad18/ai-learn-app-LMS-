/**
 * Quiz Runner Component
 * Interactive quiz interface with scoring and feedback
 */

"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Award, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./progress";

export function QuizRunner({ 
  questions = [], 
  onComplete,
  onProgress,
  timeLimit = null, // in seconds
  showExplanations = true,
  allowReview = true,
  shuffleQuestions = false,
  shuffleOptions = false,
  className = ""
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quiz, setQuiz] = useState([]);

  useEffect(() => {
    // Initialize quiz
    let processedQuestions = [...questions];
    
    if (shuffleQuestions) {
      processedQuestions = processedQuestions.sort(() => Math.random() - 0.5);
    }
    
    if (shuffleOptions) {
      processedQuestions = processedQuestions.map(q => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
      }));
    }
    
    setQuiz(processedQuestions);
    setQuizStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setTimeRemaining(timeLimit);
  }, [questions, shuffleQuestions, shuffleOptions, timeLimit]);

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeLimit, timeRemaining, showResults]);

  const currentQuestion = quiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.length - 1;
  const progress = quiz.length > 0 ? ((currentQuestionIndex + 1) / quiz.length) * 100 : 0;

  const handleAnswerSelect = (selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedOption
    }));

    if (onProgress) {
      onProgress({
        current: currentQuestionIndex + 1,
        total: quiz.length,
        answered: Object.keys({ ...answers, [currentQuestionIndex]: selectedOption }).length,
        progress
      });
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = () => {
    const endTime = Date.now();
    const timeTaken = Math.round((endTime - quizStartTime) / 1000);
    
    const results = quiz.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      return {
        question: question.prompt,
        options: question.options,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        index
      };
    });

    const score = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((score / quiz.length) * 100);

    const finalResults = {
      results,
      score,
      total: quiz.length,
      percentage,
      timeTaken,
      timeLimit,
      answeredCount: Object.keys(answers).length
    };

    setShowResults(true);
    
    if (onComplete) {
      onComplete(finalResults);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setQuizStartTime(Date.now());
    setTimeRemaining(timeLimit);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (!quiz.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No quiz questions available</div>
      </div>
    );
  }

  if (showResults) {
    const results = quiz.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      return {
        question: question.prompt,
        options: question.options,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        index
      };
    });

    const score = results.filter(r => r.isCorrect).length;
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Award className={`w-16 h-16 mx-auto ${getScoreColor(percentage)}`} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(percentage)}`}>
            {score}/{quiz.length}
          </div>
          <div className="text-lg text-gray-600 mb-4">
            {percentage}% • {formatTime(Math.round((Date.now() - quizStartTime) / 1000))}
          </div>
          
          <Button onClick={resetQuiz} className="mr-2">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </div>

        {/* Detailed Results */}
        {allowReview && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Review Answers</h3>
            
            {results.map((result, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  {result.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Question {index + 1}: {result.question}
                    </h4>
                    
                    <div className="space-y-2 mb-4">
                      {result.options.map((option, optionIndex) => {
                        const isUserAnswer = option === result.userAnswer;
                        const isCorrectAnswer = option === result.correctAnswer;
                        
                        let optionClass = "p-3 rounded-lg border ";
                        if (isCorrectAnswer) {
                          optionClass += "bg-green-50 border-green-200 text-green-800";
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          optionClass += "bg-red-50 border-red-200 text-red-800";
                        } else {
                          optionClass += "bg-gray-50 border-gray-200 text-gray-700";
                        }
                        
                        return (
                          <div key={optionIndex} className={optionClass}>
                            <div className="flex items-center gap-2">
                              {isCorrectAnswer && <CheckCircle className="w-4 h-4" />}
                              {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4" />}
                              <span>{option}</span>
                              {isUserAnswer && <span className="text-xs">(Your answer)</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {showExplanations && result.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-800 mb-1">Explanation:</div>
                        <div className="text-sm text-blue-700">{result.explanation}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Question {currentQuestionIndex + 1} of {quiz.length}
            </h2>
            {timeLimit && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="w-4 h-4" />
                Time remaining: {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              Progress: {Math.round(progress)}%
            </div>
            <Progress value={progress} className="w-32" />
          </div>
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quiz.map((_, index) => {
            const isAnswered = answers.hasOwnProperty(index);
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          {currentQuestion.prompt}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestionIndex] === option;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="text-sm text-gray-600">
          {Object.keys(answers).length} of {quiz.length} answered
        </div>
        
        {isLastQuestion ? (
          <Button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(answers).length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={goToNext}
            disabled={!answers.hasOwnProperty(currentQuestionIndex)}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
