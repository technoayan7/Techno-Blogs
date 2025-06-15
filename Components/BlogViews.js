import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";

const BlogViews = ({ id }) => {
  const [views, setViews] = useState(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasIncremented, setHasIncremented] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    // First, get the current view count
    fetch(`/api/views/${id}`, { method: "GET" })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setViews(data.views);
        setError(false);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching views:", err);
        setError(true);
        setViews(0);
        setIsLoading(false);
      });

    // Set up timer to increment view after 5 seconds
    const timer = setTimeout(() => {
      if (!hasIncremented) {
        fetch(`/api/views/${id}`, { method: "POST" })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to increment view');
            return res.json();
          })
          .then((data) => {
            setViews(data.views);
            setHasIncremented(true);
          })
          .catch((err) => {
            console.error("Error incrementing views:", err);
          });
      }
    }, 5000); // 5 seconds

    // Cleanup timer on unmount
    return () => {
      clearTimeout(timer);
    };
  }, [id, hasIncremented]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
        <div className="animate-pulse">
          <FiEye className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm text-gray-400 animate-pulse">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800">
        <FiEye className="w-4 h-4" />
        <span className="text-sm font-medium">0 views</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-200">
      <FiEye className="w-4 h-4 animate-pulse" />
      <span className="text-sm font-semibold">
        {views !== null ? views.toLocaleString() : "0"} 
        <span className="ml-1 font-normal">
          {views === 1 ? "view" : "views"}
        </span>
      </span>
    </div>
  );
};

export default BlogViews;
