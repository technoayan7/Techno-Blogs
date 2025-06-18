import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "../Firebase/Firebase";
import { doc, setDoc, deleteDoc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const SimpleLikeBtn = ({ blogId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (!blogId) return;

    const fetchLikes = async () => {
      try {
        if (user) {
          const userLikeRef = doc(db, "likes", String(blogId), "users", user.uid);
          const userLikeSnap = await getDoc(userLikeRef);
          setIsLiked(userLikeSnap.exists());
        }

        const likesQuery = query(collection(db, "likes", String(blogId), "users"));
        const likesSnap = await getDocs(likesQuery);
        setTotalLikes(likesSnap.size);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [user, blogId]);

  const handleLike = async () => {
    if (!user) {
      alert("Please sign in to like this post");
      return;
    }

    setIsLoading(true);
    try {
      const userLikeRef = doc(db, "likes", String(blogId), "users", user.uid);

      if (isLiked) {
        await deleteDoc(userLikeRef);
        setIsLiked(false);
        setTotalLikes(prev => prev - 1);
      } else {
        await setDoc(userLikeRef, {
          likedAt: new Date(),
          userId: user.uid,
          userName: user.name,
        });
        setIsLiked(true);
        setTotalLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="text-center">
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked
              ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{totalLikes} {totalLikes === 1 ? 'Like' : 'Likes'}</span>
        </button>
      </div>
    </div>
  );
};

export default SimpleLikeBtn;
