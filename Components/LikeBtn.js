import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const LikeBtn = ({ id }) => {
  const [isLiking, setIsLiking] = useState(false);
  
  // Get blog ID from slug
  const getBlogIdFromSlug = (slug) => {
    // This should match your blog ID extraction logic
    // You might need to adjust this based on your data structure
    return slug;
  };

  const blogId = getBlogIdFromSlug(id);
  
  const { data, error, mutate } = useSWR(
    blogId ? `/api/likes/${blogId}` : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch('/api/like-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: blogId }),
      });

      if (response.ok) {
        // Refresh the like data
        mutate();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
    setIsLiking(false);
  };

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <FiHeart className="w-5 h-5" />
        <span>Error loading likes</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <FiHeart className="w-5 h-5 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-6">
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`flex items-center space-x-2 px-6 py-3 rounded-full border-2 transition-all duration-200 ${
          data.hasUserLiked
            ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
            : 'bg-white dark:bg-gray-800 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700'
        } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
      >
        <FiHeart 
          className={`w-5 h-5 ${data.hasUserLiked ? 'fill-current' : ''} ${isLiking ? 'animate-pulse' : ''}`} 
        />
        <span className="font-medium">
          {isLiking ? 'Processing...' : `${data.totalLikes} ${data.totalLikes === 1 ? 'Like' : 'Likes'}`}
        </span>
      </button>
    </div>
  );
};

export default LikeBtn;
