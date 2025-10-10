/**
 * Flashcard Component
 * Interactive flashcard with flip animation and study features
 */

"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Check, X, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export function Flashcard({ 
  front, 
  back, 
  onCorrect, 
  onIncorrect, 
  onSkip,
  showActions = true,
  autoFlip = false,
  autoFlipDelay = 3000,
  className = ""
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoFlip && !isFlipped) {
      const timer = setTimeout(() => {
        handleFlip();
      }, autoFlipDelay);
      return () => clearTimeout(timer);
    }
  }, [autoFlip, autoFlipDelay, isFlipped]);

  const handleFlip = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleAction = (action) => {
    if (action) action();
    // Reset card for next use
    setTimeout(() => {
      setIsFlipped(false);
    }, 500);
  };

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* Flashcard */}
      <div 
        className={`relative w-full h-64 cursor-pointer transition-transform duration-300 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <div className={`absolute inset-0 w-full h-full backface-hidden ${
          isFlipped ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}>
          <div className="w-full h-full bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {front}
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  Click to reveal answer
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
              <div className="text-xs text-gray-500 text-center">
                Question
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 ${
          isFlipped ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}>
          <div className="w-full h-full bg-blue-50 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900 mb-2">
                  {back}
                </div>
                <div className="text-sm text-blue-600 flex items-center justify-center gap-1">
                  <EyeOff className="w-4 h-4" />
                  Click to hide answer
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-blue-100 border-t border-blue-200 rounded-b-xl">
              <div className="text-xs text-blue-700 text-center">
                Answer
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && isFlipped && (
        <div className="flex justify-center gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(onIncorrect)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Incorrect
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(onSkip)}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Skip
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction(onCorrect)}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Check className="w-4 h-4 mr-1" />
            Correct
          </Button>
        </div>
      )}
    </div>
  );
}

export function FlashcardDeck({ 
  flashcards = [], 
  onComplete,
  onProgress,
  showProgress = true,
  shuffled = false,
  className = ""
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [deck, setDeck] = useState([]);

  useEffect(() => {
    const initialDeck = shuffled 
      ? [...flashcards].sort(() => Math.random() - 0.5)
      : flashcards;
    setDeck(initialDeck);
    setCurrentIndex(0);
    setResults([]);
  }, [flashcards, shuffled]);

  const currentCard = deck[currentIndex];
  const isLastCard = currentIndex === deck.length - 1;
  const progress = deck.length > 0 ? ((currentIndex + 1) / deck.length) * 100 : 0;

  const handleResult = (result) => {
    const newResults = [...results, { 
      cardIndex: currentIndex, 
      result, 
      card: currentCard,
      timestamp: new Date()
    }];
    setResults(newResults);

    if (onProgress) {
      onProgress({
        current: currentIndex + 1,
        total: deck.length,
        results: newResults,
        progress
      });
    }

    if (isLastCard) {
      if (onComplete) {
        onComplete({
          results: newResults,
          correct: newResults.filter(r => r.result === 'correct').length,
          incorrect: newResults.filter(r => r.result === 'incorrect').length,
          skipped: newResults.filter(r => r.result === 'skip').length,
          total: deck.length
        });
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Remove the last result
      setResults(results.slice(0, -1));
    }
  };

  const goToNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!deck.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No flashcards available</div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Progress Header */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Card {currentIndex + 1} of {deck.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        <div className="text-sm text-gray-500">
          {results.filter(r => r.result === 'correct').length} correct • {' '}
          {results.filter(r => r.result === 'incorrect').length} incorrect • {' '}
          {results.filter(r => r.result === 'skip').length} skipped
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={currentIndex === deck.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Current Flashcard */}
      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        onCorrect={() => handleResult('correct')}
        onIncorrect={() => handleResult('incorrect')}
        onSkip={() => handleResult('skip')}
        showActions={true}
      />

      {/* Results Summary (shown after completion) */}
      {isLastCard && results.length === deck.length && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Session Complete!</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.result === 'correct').length}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.result === 'incorrect').length}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {results.filter(r => r.result === 'skip').length}
              </div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
