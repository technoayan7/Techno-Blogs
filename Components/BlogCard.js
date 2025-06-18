import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getAllTopics } from "../Lib/Data";
import { db } from "../Firebase/Firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { FaBookmark, FaTrash, FaClock } from "react-icons/fa";
import { doc, deleteDoc } from "firebase/firestore";
import BookmarkButton from "../Components/BookmarkButton";

export const getStaticProps = () => {
  const allTopics = getAllTopics();
  return {
    props: {
      topics: allTopics,
    },
  };
};

function Bookmarks({ topics }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const bookmarksQuery = query(
          collection(db, "bookmarks", user.uid, "posts"),
          orderBy("bookmarkedAt", "desc")
        );
        const bookmarksSnap = await getDocs(bookmarksQuery);
        
        const bookmarksData = bookmarksSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setBookmarks(bookmarksData);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const removeBookmark = async (blogId) => {
    if (!user) return;

    try {
      const bookmarkRef = doc(db, "bookmarks", user.uid, "posts", blogId);
      await deleteDoc(bookmarkRef);
      setBookmarks(prev => prev.filter(bookmark => bookmark.blogId !== blogId));
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-gray-900">
        <Navbar topics={topics} />
        <div className="max-w-4xl mx-auto pt-20 pb-32 px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-gray-900">
        <Navbar topics={topics} />
        <div className="max-w-4xl mx-auto pt-20 pb-32 px-6 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <FaBookmark className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sign in to view bookmarks
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to access your bookmarked posts.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900">
      <Navbar topics={topics} />
      <div className="max-w-4xl mx-auto pt-20 pb-32 px-6">
        <div className="flex items-center space-x-3 mb-8">
          <FaBookmark className="text-2xl text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookmarks
          </h1>
          <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold">
            {bookmarks.length}
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <FaBookmark className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bookmarks yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start bookmarking posts you want to read later!
            </p>
            <Link href="/">
              <a className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Browse Posts
              </a>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.blogId}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/blog/${bookmark.blogId}`}>
                      <a className="block">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2">
                          {bookmark.title}
                        </h3>
                      </a>
                    </Link>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FaClock className="w-3 h-3" />
                        <span>
                          Bookmarked on {bookmark.bookmarkedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <BookmarkButton blogId={bookmark.blogId} blogTitle={bookmark.title} />
                    <button
                      onClick={() => removeBookmark(bookmark.blogId)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors ml-4"
                      title="Remove bookmark"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Bookmarks;
