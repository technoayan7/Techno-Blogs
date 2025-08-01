import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getAllTopics } from "../Lib/Data";
import { db } from "../Firebase/Firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import {
  FaUser,
  FaBookmark,
  FaEye,
  FaCalendarAlt,
  FaEnvelope,
  FaCrown,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserEdit,
  FaChartLine,
  FaHeart,
  FaShare,
  FaDownload,
  FaShieldAlt,
  FaCog,
  FaSignOutAlt,
  FaGoogle,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaCamera,
  FaSpinner,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { useDispatch } from "react-redux";

export const getStaticProps = () => {
  const allTopics = getAllTopics();
  return {
    props: {
      topics: allTopics,
    },
  };
};

function Profile({ topics }) {
  const [userStats, setUserStats] = useState({
    bookmarks: 0,
    totalViews: 0,
    joinDate: null,
    likes: 0,
    comments: 0,
  });
  const [recentBookmarks, setRecentBookmarks] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    website: "",
    location: "",
    twitter: "",
    github: "",
    linkedin: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const user = useSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useDispatch();

  const isAdmin = user?.email === "ayanahmad7052@gmail.com";

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    fetchUserData();
    setEditForm({
      displayName: user.name || "",
      bio: user.bio || "",
      website: user.website || "",
      location: user.location || "",
      twitter: user.twitter || "",
      github: user.github || "",
      linkedin: user.linkedin || "",
    });
  }, [user, router]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch bookmarks - using the correct structure from your existing bookmarks page
      const bookmarksQuery = query(
        collection(db, "bookmarks", user.uid, "posts"),
        orderBy("bookmarkedAt", "desc")
      );
      const bookmarksSnap = await getDocs(bookmarksQuery);
      const bookmarksData = bookmarksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch liked posts - using the posts collection with likes subcollection
      let likesData = [];
      try {
        // Get all posts and check which ones this user has liked
        const postsRef = collection(db, "posts");
        const postsSnap = await getDocs(postsRef);

        for (const postDoc of postsSnap.docs) {
          const likesRef = collection(db, "posts", postDoc.id, "likes");
          const userLikeQuery = query(likesRef, where("userId", "==", user.uid));
          const userLikeSnap = await getDocs(userLikeQuery);

          if (!userLikeSnap.empty) {
            userLikeSnap.forEach((likeDoc) => {
              likesData.push({
                id: likeDoc.id,
                blogId: postDoc.id,
                title: postDoc.data().Title || "Unknown Post",
                likedAt: likeDoc.data().likedAt || likeDoc.data().timestamp,
                ...likeDoc.data(),
              });
            });
          }
        }
      } catch (error) {
        console.log("Error fetching likes:", error);
        // Try alternative structure if the above fails
        try {
          const userLikesQuery = query(
            collection(db, "userLikes", user.uid, "posts"),
            orderBy("likedAt", "desc")
          );
          const userLikesSnap = await getDocs(userLikesQuery);
          likesData = userLikesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (altError) {
          console.log("Alternative likes structure also failed:", altError);
        }
      }

      // Fetch user comments - using the blogComments structure from your API
      let commentsData = [];
      try {
        // Get comments from blogComments collection where user.name matches
        const blogCommentsRef = collection(db, "blogComments");
        const blogCommentsSnap = await getDocs(blogCommentsRef);

        for (const blogDoc of blogCommentsSnap.docs) {
          const commentsRef = collection(db, "blogComments", blogDoc.id, "comments");
          const userCommentsQuery = query(
            commentsRef,
            where("name", "==", user.name),
            orderBy("timestamp", "desc")
          );
          const userCommentsSnap = await getDocs(userCommentsQuery);

          userCommentsSnap.forEach((commentDoc) => {
            commentsData.push({
              id: commentDoc.id,
              postId: blogDoc.id,
              postTitle: `Post ${blogDoc.id}`, // You might want to fetch the actual post title
              content: commentDoc.data().message,
              createdAt: commentDoc.data().timestamp,
              likes: Object.values(commentDoc.data().reactions || {}).reduce((sum, count) => sum + count, 0),
              ...commentDoc.data(),
            });
          });
        }
      } catch (error) {
        console.log("Error fetching comments:", error);
        // Try alternative structure
        try {
          const userCommentsQuery = query(
            collection(db, "comments"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const userCommentsSnap = await getDocs(userCommentsQuery);
          commentsData = userCommentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (altError) {
          console.log("Alternative comments structure also failed:", altError);
        }
      }

      setUserStats({
        bookmarks: bookmarksData.length,
        totalViews: 0, // You can implement view tracking later
        joinDate: user.metadata?.creationTime || new Date(),
        likes: likesData.length,
        comments: commentsData.length,
      });

      setRecentBookmarks(bookmarksData.slice(0, 5));
      setLikedPosts(likesData.slice(0, 5));
      setUserComments(commentsData.slice(0, 5));

      console.log("Fetched data:", {
        bookmarks: bookmarksData.length,
        likes: likesData.length,
        comments: commentsData.length,
      });

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      dispatch({ type: "REMOVE_USER" });
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // In a real app, you'd save this to your database
      // For now, we'll just update localStorage
      const updatedUser = {
        ...user,
        ...editForm,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch({ type: "STORE_USER", payload: updatedUser });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FaUser },
    { id: "bookmarks", label: "Bookmarks", icon: FaBookmark },
    { id: "likes", label: "Liked Posts", icon: FaHeart },
    { id: "comments", label: "Comments", icon: FaEdit },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Recent Bookmarks */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Bookmarks
                </h3>
                <Link
                  href="/bookmarks"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  View All
                </Link>
              </div>
              {renderBookmarksList(recentBookmarks)}
            </div>

            {/* Recent Likes */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recently Liked
                </h3>
                <button
                  onClick={() => setActiveTab("likes")}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  View All
                </button>
              </div>
              {renderLikedPostsList(likedPosts)}
            </div>

            {/* Recent Comments */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Comments
                </h3>
                <button
                  onClick={() => setActiveTab("comments")}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  View All
                </button>
              </div>
              {renderCommentsList(userComments)}
            </div>
          </div>
        );
      case "bookmarks":
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              All Bookmarks ({userStats.bookmarks})
            </h3>
            {renderBookmarksList(recentBookmarks, true)}
          </div>
        );
      case "likes":
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Liked Posts ({userStats.likes})
            </h3>
            {renderLikedPostsList(likedPosts, true)}
          </div>
        );
      case "comments":
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              My Comments ({userStats.comments})
            </h3>
            {renderCommentsList(userComments, true)}
          </div>
        );
      default:
        return null;
    }
  };

  const renderBookmarksList = (bookmarks, showAll = false) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (bookmarks.length === 0) {
      return (
        <div className="text-center py-12">
          <FaBookmark className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No bookmarks yet. Start bookmarking posts you love!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <FaBookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {bookmark.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bookmarked on{" "}
                {bookmark.bookmarkedAt?.toDate?.()?.toLocaleDateString() ||
                  "Unknown date"}
              </p>
            </div>
            <Link
              href={`/blog/${bookmark.blogId}`}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              Read
            </Link>
          </div>
        ))}
      </div>
    );
  };

  const renderLikedPostsList = (likes, showAll = false) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (likes.length === 0) {
      return (
        <div className="text-center py-12">
          <FaHeart className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No liked posts yet. Show some love to posts you enjoy!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {likes.map((like) => (
          <div
            key={like.id}
            className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <FaHeart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {like.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Liked on{" "}
                {like.likedAt?.toDate?.()?.toLocaleDateString() ||
                  "Unknown date"}
              </p>
            </div>
            <Link
              href={`/blog/${like.blogId}`}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              Read
            </Link>
          </div>
        ))}
      </div>
    );
  };

  const renderCommentsList = (comments, showAll = false) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="text-center py-12">
          <FaEdit className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No comments yet. Join the conversation on posts you find interesting!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FaEdit className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Comment on "{comment.postTitle || "Unknown Post"}"
                  </p>
                  <span className="text-xs text-gray-400">
                    {comment.createdAt?.toDate?.()?.toLocaleDateString() ||
                      "Unknown date"}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                  {comment.content}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <Link
                    href={`/blog/${comment.postId}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                  >
                    View Post
                  </Link>
                  {comment.likes > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comment.likes} likes
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <>
        <Head>
          <title>Profile | Techno Blogs</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar topics={topics} />
          <div className="max-w-4xl mx-auto pt-20 pb-32 px-6 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-2xl">
              <FaUser className="mx-auto text-8xl text-gray-400 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Sign in required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Please sign in to view your profile.
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
        <title>{user.name}'s Profile | Techno Blogs</title>
        <meta name="description" content={`${user.name}'s profile on Techno Blogs`} />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar topics={topics} />

        <div className="max-w-6xl mx-auto pt-20 pb-32 px-6">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8 animate-slide-up">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 -mt-16 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-4xl text-white" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <FaCamera className="w-4 h-4" />
                  </button>
                </div>

                {/* User Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </h1>
                    {isAdmin && (
                      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        <FaCrown className="w-4 h-4" />
                        <span>Admin</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {editForm.bio || "No bio added yet"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FaEnvelope className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>
                        Joined {new Date(userStats.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 animate-slide-up">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Edit Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={editForm.twitter}
                    onChange={(e) => handleInputChange("twitter", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaSave className="w-4 h-4" />
                  )}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                  <FaBookmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.bookmarks}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Bookmarks</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
                  <FaHeart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.likes}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Likes</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <FaEdit className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStats.comments}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Comments</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                  <FaCalendarAlt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(
                      (new Date() - new Date(userStats.joinDate)) / (1000 * 60 * 60 * 24)
                    )}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Days Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-8 py-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}

export default Profile;
