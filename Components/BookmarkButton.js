import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "../Firebase/Firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const BookmarkButton = ({ blogId, blogTitle }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user);

  // Debug logging
  useEffect(() => {
    console.log("BookmarkButton - User:", user);
    console.log("BookmarkButton - BlogId:", blogId);
    console.log("BookmarkButton - BlogTitle:", blogTitle);
  }, [user, blogId, blogTitle]);

  useEffect(() => {
    if (!user || !blogId) {
      console.log("BookmarkButton - Missing user or blogId");
      return;
    }

    const checkBookmark = async () => {
      try {
        console.log("BookmarkButton - Checking bookmark for:", blogId);
        const bookmarkRef = doc(db, "bookmarks", user.uid, "posts", String(blogId));
        const bookmarkSnap = await getDoc(bookmarkRef);
        const exists = bookmarkSnap.exists();
        console.log("BookmarkButton - Bookmark exists:", exists);
        setIsBookmarked(exists);
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    };

    checkBookmark();
  }, [user, blogId]);

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please sign in to bookmark posts");
      return;
    }

    if (!blogId || !blogTitle) {
      console.error("Missing blogId or blogTitle");
      return;
    }

    setIsLoading(true);
    try {
      const bookmarkRef = doc(db, "bookmarks", user.uid, "posts", String(blogId));

      if (isBookmarked) {
        console.log("BookmarkButton - Removing bookmark");
        await deleteDoc(bookmarkRef);
        setIsBookmarked(false);
      } else {
        console.log("BookmarkButton - Adding bookmark");
        await setDoc(bookmarkRef, {
          blogId: String(blogId),
          title: blogTitle,
          bookmarkedAt: new Date(),
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Error updating bookmark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isBookmarked && user
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!user ? "Sign in to bookmark" : isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked && user ? <FaBookmark /> : <FaRegBookmark />}
      <span className="text-sm font-medium">
        {isLoading ? "..." : (isBookmarked && user) ? "Bookmarked" : "Bookmark"}
      </span>
    </button>
  );
};

export default BookmarkButton;
