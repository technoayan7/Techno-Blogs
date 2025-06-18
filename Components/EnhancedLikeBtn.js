import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "../Firebase/Firebase";
import { doc, setDoc, deleteDoc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { FaHeart, FaRegHeart, FaUser, FaFire } from "react-icons/fa";

const EnhancedLikeBtn = ({ blogId }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const user = useSelector((state) => state.user);

    useEffect(() => {
        if (!blogId) return;

        const fetchLikes = async () => {
            try {
                // Get user's like status if logged in
                if (user) {
                    const userLikeRef = doc(db, "likes", String(blogId), "users", user.uid);
                    const userLikeSnap = await getDoc(userLikeRef);
                    setIsLiked(userLikeSnap.exists());
                }

                // Get total likes
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

        if (!blogId) return;

        setIsLoading(true);
        setIsAnimating(true);

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

                // Show thank you message for new likes
                setShowThankYou(true);
                setTimeout(() => setShowThankYou(false), 2000);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            alert("Error updating like. Please try again.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-900/20 rounded-2xl p-6 shadow-xl border border-red-200 dark:border-red-800">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 text-red-200 dark:text-red-800 opacity-30">
                <FaFire className="text-2xl" />
            </div>

            {/* Header */}
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <FaHeart className="text-red-500" />
                    Show Some Love
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Let the author know you enjoyed this content
                </p>
            </div>

            {/* Like Button Section */}
            <div className="text-center">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-100 dark:border-red-800">

                    {/* Main Like Button */}
                    <button
                        onClick={handleLike}
                        disabled={isLoading}
                        className={`group relative inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 transform ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'
                            } ${isLiked
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                                : 'bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300'
                            } ${isAnimating ? 'animate-bounce' : ''}`}
                        title={isLiked ? "Unlike this post" : "Like this post"}
                    >
                        {isLiked ? (
                            <FaHeart className={`text-3xl ${isAnimating ? 'animate-pulse' : ''}`} />
                        ) : (
                            <FaRegHeart className="text-3xl group-hover:scale-110 transition-transform" />
                        )}

                        {/* Floating hearts animation for likes */}
                        {isAnimating && isLiked && (
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(3)].map((_, i) => (
                                    <FaHeart
                                        key={i}
                                        className="absolute text-red-400 text-sm animate-bounce"
                                        style={{
                                            left: `${20 + i * 20}%`,
                                            top: `${10 + i * 10}%`,
                                            animationDelay: `${i * 100}ms`,
                                            animationDuration: '1s'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </button>

                    {/* Like Count and Status */}
                    <div className="mt-4 space-y-2">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totalLikes.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {totalLikes === 1 ? 'person likes' : 'people like'} this
                        </div>

                        {user && isLiked && (
                            <div className="flex items-center justify-center gap-2 text-xs text-red-600 dark:text-red-400">
                                <FaUser className="text-xs" />
                                <span>You liked this</span>
                            </div>
                        )}
                    </div>

                    {/* Thank You Message */}
                    {showThankYou && (
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
                            <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                                <FaHeart className="text-red-500 animate-pulse" />
                                Thanks for the love!
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm">Updating...</span>
                        </div>
                    )}

                    {/* Sign in prompt for non-users */}
                    {!user && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                Sign in to show your appreciation
                            </p>
                            <button
                                onClick={() => alert("Please sign in to like this post")}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
                            >
                                Sign In to Like
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Popular indicator */}
            {totalLikes >= 10 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <FaFire className="animate-pulse" />
                    Popular
                </div>
            )}
        </div>
    );
};

export default EnhancedLikeBtn;
