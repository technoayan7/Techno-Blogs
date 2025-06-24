import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import Head from "next/head";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getAllTopics } from "../Lib/Data";
import { db } from "../Firebase/Firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { FaBookmark, FaTrash, FaClock, FaBook, FaSearch } from "react-icons/fa";
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
  const [searchTerm, setSearchTerm] = useState("");
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

        const bookmarksData = bookmarksSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.blogId !== blogId)
      );
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Bookmarks... | Techno Blogs</title>
        </Head>
        <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar topics={topics} />
          <div className="max-w-4xl mx-auto pt-20 pb-32 px-6">
            <div className="animate-pulse space-y-6 animate-fade-in">
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/3"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl"
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Sign In Required | Techno Blogs</title>
          <meta name="description" content="Sign in to view your bookmarked posts" />
        </Head>
        <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Navbar topics={topics} />
          <div className="max-w-4xl mx-auto pt-20 pb-32 px-6 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-2xl animate-slide-up">
              <div className="animate-bounce-slow">
                <FaBookmark className="mx-auto text-8xl text-indigo-400 mb-6" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Sign in to view bookmarks
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Please sign in to access your bookmarked posts.
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Bookmarks ({bookmarks.length}) | Techno Blogs</title>
        <meta name="description" content="View and manage your bookmarked blog posts" />
      </Head>
      <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar topics={topics} />
        <div className="max-w-4xl mx-auto pt-20 pb-32 px-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-slide-up">
            <div className="flex items-center space-x-4">
              <div className="animate-wiggle">
                <FaBookmark className="text-3xl text-yellow-500" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  My Bookmarks
                </h1>
                <span className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold mt-2 animate-scale-in">
                  {bookmarks.length} {bookmarks.length === 1 ? "post" : "posts"}
                </span>
              </div>
            </div>

            {/* Search Bar */}
            {bookmarks.length > 0 && (
              <div className="relative w-full sm:w-80 animate-slide-in-right">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            )}
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16 animate-fade-in-delayed">
              <div className="animate-float">
                <FaBook className="mx-auto text-8xl text-gray-400 mb-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No bookmarks yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                Start bookmarking posts you want to read later!
              </p>
              <Link href="/">
                <a className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold hover:scale-105 hover:-translate-y-1">
                  <FaBook className="mr-2" />
                  Browse Posts
                </a>
              </Link>
            </div>
          ) : (
            <div className="space-y-6 animate-stagger-children">
              {filteredBookmarks.map((bookmark, index) => (
                <div
                  key={bookmark.blogId}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/blog/${bookmark.blogId}`}>
                        <a className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 hover:translate-x-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            {bookmark.title}
                          </h3>
                        </a>
                      </Link>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <FaClock className="w-3 h-3" />
                          <span>
                            Bookmarked on{" "}
                            {bookmark.bookmarkedAt?.toDate?.()?.toLocaleDateString() ||
                              "Unknown date"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <BookmarkButton
                        blogId={bookmark.blogId}
                        blogTitle={bookmark.title}
                      />
                      <button
                        onClick={() => removeBookmark(bookmark.blogId)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-110"
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

          {/* No search results */}
          {searchTerm && filteredBookmarks.length === 0 && bookmarks.length > 0 && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No bookmarks found for "{searchTerm}"
              </p>
            </div>
          )}
        </div>
        <Footer />
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        .animate-fade-in-delayed {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out 0.2s both;
        }
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
        .animate-wiggle {
          animation: wiggle 4s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out 0.3s both;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-stagger-children > * {
          animation: slideUp 0.8s ease-out both;
        }
        .animate-stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
        .animate-stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
        .animate-stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}

export default Bookmarks;
