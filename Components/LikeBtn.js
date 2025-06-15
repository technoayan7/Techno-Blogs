import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import useSWR from 'swr';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

const LikeBtn = ({ id }) => {
  const [isLiking, setIsLiking] = useState(false);
  
  // Ensure ID is a string and valid
  const blogId = String(id);
  
  const { data, error, mutate } = useSWR(
    blogId && blogId !== 'undefined' ? `/api/likes/${blogId}` : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      onError: (err) => console.error('SWR Error:', err),
      onSuccess: (data) => console.log('SWR Success:', data)
    }
  );

  const handleLike = async () => {
    if (isLiking || !blogId || blogId === 'undefined') return;
    
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
        const result = await response.json();
        await mutate();
      } else {
        const errorData = await response.json();
        console.error('Like request failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
    setIsLiking(false);
  };

  // Don't render if no valid ID
  if (!blogId || blogId === 'undefined') {
    console.warn('LikeBtn: No valid blog ID provided');
    return null;
  }

  if (error) {
    console.error('SWR Error:', error);
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center space-x-2 text-gray-500">
          <FiHeart className="w-5 h-5" />
          <span>Error loading likes: {error.message}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center space-x-2 text-gray-500">
          <FiHeart className="w-5 h-5 animate-pulse" />
          <span>Loading likes...</span>
        </div>
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
