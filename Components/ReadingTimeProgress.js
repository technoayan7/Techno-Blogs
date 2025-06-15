import { useState, useEffect, useRef } from 'react';
import { FiClock, FiCheck, FiBookOpen, FiX } from 'react-icons/fi';

const ReadingTimeProgress = ({ content, estimatedTime = 5 }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const intervalRef = useRef(null);

  // Use the passed estimatedTime consistently (no recalculation)
  const actualReadingTime = estimatedTime;

  useEffect(() => {
    // Show component after 2 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 2000);

    // Track time when page is visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isPaused && isVisible) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          const timeLimit = actualReadingTime * 60;
          if (newTime >= timeLimit && !isComplete) {
            setIsComplete(true);
          }
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isVisible, actualReadingTime, isComplete]);

  if (!isVisible) return null;

  const progress = Math.min((timeSpent / (actualReadingTime * 60)) * 100, 100);
  const minutesSpent = Math.floor(timeSpent / 60);
  const secondsSpent = timeSpent % 60;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Compact view (default) */}
      {!isExpanded ? (
        <div 
          className="bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-2xl transition-all duration-300"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center space-x-3">
            {isComplete ? (
              <div className="flex items-center space-x-2 text-green-500">
                <FiCheck className="w-5 h-5" />
                <span className="text-sm font-semibold">Complete!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  {/* Circular progress */}
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-300 dark:text-gray-600"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-indigo-500"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${progress}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiBookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {minutesSpent}:{secondsSpent.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Expanded view */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-200 dark:border-gray-700 min-w-72">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {isComplete ? (
                <div className="flex items-center space-x-2 text-green-500">
                  <FiCheck className="w-5 h-5" />
                  <span className="font-semibold">Reading Complete!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-indigo-600">
                  <FiBookOpen className="w-5 h-5" />
                  <span className="font-semibold">Reading Progress</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Time Display */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <FiClock className="w-4 h-4" />
                <span>
                  {minutesSpent}:{secondsSpent.toString().padStart(2, '0')} / {actualReadingTime}:00
                </span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs font-medium text-white drop-shadow-sm">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {isComplete ? (
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  🎉 Great job! You've finished reading this article.
                </p>
              </div>
            ) : isPaused ? (
              <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ⏸️ Timer paused (tab inactive)
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Keep reading to track your progress!
                </p>
              </div>
            )}

            {/* Reading Speed Estimate */}
            {timeSpent > 30 && !isComplete && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                Estimated completion: {Math.round((actualReadingTime * 60 - timeSpent) / 60)} min remaining
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingTimeProgress;
