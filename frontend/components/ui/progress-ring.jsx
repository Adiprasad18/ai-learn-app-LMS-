/**
 * Progress Ring Component
 * Circular progress indicator with customizable styling
 */

"use client";

import { useMemo } from "react";

export function ProgressRing({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8,
  className = "",
  showPercentage = true,
  color = "blue",
  backgroundColor = "gray",
  animated = true,
  children
}) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const colorClasses = {
    blue: "stroke-blue-500",
    green: "stroke-green-500",
    purple: "stroke-purple-500",
    red: "stroke-red-500",
    yellow: "stroke-yellow-500",
    indigo: "stroke-indigo-500",
    pink: "stroke-pink-500",
    gray: "stroke-gray-500"
  };

  const backgroundColorClasses = {
    gray: "stroke-gray-200",
    blue: "stroke-blue-100",
    green: "stroke-green-100",
    purple: "stroke-purple-100",
    red: "stroke-red-100",
    yellow: "stroke-yellow-100",
    indigo: "stroke-indigo-100",
    pink: "stroke-pink-100"
  };

  const progressColor = colorClasses[color] || colorClasses.blue;
  const bgColor = backgroundColorClasses[backgroundColor] || backgroundColorClasses.gray;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className={bgColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          className={`${progressColor} ${animated ? 'transition-all duration-500 ease-in-out' : ''}`}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(normalizedProgress)}%
            </div>
            {normalizedProgress === 100 && (
              <div className="text-xs text-green-600 font-medium">
                Complete
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressRingGroup({ items, className = "" }) {
  const totalProgress = useMemo(() => {
    if (!items || items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (item.progress || 0), 0);
    return sum / items.length;
  }, [items]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <ProgressRing 
        progress={totalProgress} 
        size={100}
        color="blue"
        className="mb-4"
      />
      
      <div className="space-y-2 w-full max-w-xs">
        {items?.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 truncate flex-1 mr-2">
              {item.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(item.progress || 0, 100)}%` }}
                />
              </div>
              <span className="text-gray-500 text-xs w-8 text-right">
                {Math.round(item.progress || 0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniProgressRing({ 
  progress = 0, 
  size = 40, 
  strokeWidth = 4,
  color = "blue",
  className = ""
}) {
  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      showPercentage={false}
      className={className}
    >
      <div className="text-xs font-semibold text-gray-700">
        {Math.round(progress)}%
      </div>
    </ProgressRing>
  );
}
