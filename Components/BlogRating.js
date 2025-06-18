import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { db } from "../Firebase/Firebase";
import { doc, setDoc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { FaStar, FaRegStar, FaUser, FaHeart } from "react-icons/fa";

const BlogRating = ({ blogId }) => {
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const user = useSelector((state) => state.user);

  // Debug logging
  useEffect(() => {
    console.log("BlogRating - User:", user);
    console.log("BlogRating - BlogId:", blogId);
  }, [user, blogId]);

  useEffect(() => {
    if (!blogId) {
      console.log("BlogRating - Missing blogId");
      return;
    }

    const fetchRatings = async () => {
      try {
        console.log("BlogRating - Fetching ratings for:", blogId);
        
        // Get user's rating if logged in
        if (user) {
          const userRatingRef = doc(db, "ratings", String(blogId), "users", user.uid);
          const userRatingSnap = await getDoc(userRatingRef);
          if (userRatingSnap.exists()) {
            const rating = userRatingSnap.data().rating;
            console.log("BlogRating - User rating found:", rating);
            setUserRating(rating);
          }
        }

        // Get average rating
        const ratingsQuery = query(collection(db, "ratings", String(blogId), "users"));
        const ratingsSnap = await getDocs(ratingsQuery);
        
        if (!ratingsSnap.empty) {
          let totalScore = 0;
          let count = 0;
          
          ratingsSnap.forEach(doc => {
            totalScore += doc.data().rating;
            count++;
          });
          
          const average = totalScore / count;
          console.log("BlogRating - Average:", average, "Total:", count);
          setAverageRating(average);
          setTotalRatings(count);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();
  }, [user, blogId]);

  const handleRating = async (rating) => {
    if (!user) {
      alert("Please sign in to rate this post");
      return;
    }

    if (!blogId) {
      console.error("Missing blogId");
      return;
    }

    setIsLoading(true);
    try {
      console.log("BlogRating - Setting rating:", rating);
      const userRatingRef = doc(db, "ratings", String(blogId), "users", user.uid);
      await setDoc(userRatingRef, {
        rating,
        ratedAt: new Date(),
        userId: user.uid,
        userName: user.name,
      });

      setUserRating(rating);
      
      // Show thank you message
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
      
      // Recalculate average
      const ratingsQuery = query(collection(db, "ratings", String(blogId), "users"));
      const ratingsSnap = await getDocs(ratingsQuery);
      
      let totalScore = 0;
      let count = 0;
      
      ratingsSnap.forEach(doc => {
        totalScore += doc.data().rating;
        count++;
      });
      
      setAverageRating(totalScore / count);
      setTotalRatings(count);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = starNumber <= (hoveredRating || userRating);
      const isHovered = starNumber <= hoveredRating;
      
      return (
        <button
          key={starNumber}
          onClick={() => handleRating(starNumber)}
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(0)}
          disabled={isLoading}
          className={`text-3xl transition-all duration-200 transform ${
            isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          } ${
            isFilled 
              ? isHovered 
                ? 'text-yellow-400 drop-shadow-lg animate-pulse' 
                : 'text-yellow-400 drop-shadow-md'
              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
          }`}
          title={`Rate ${starNumber} star${starNumber > 1 ? 's' : ''}`}
        >
          {isFilled ? <FaStar /> : <FaRegStar />}
        </button>
      );
    });
  };

  const renderDisplayStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = starNumber <= rating;
      const isPartial = rating > index && rating < starNumber;
      
      return (
        <div key={starNumber} className="relative">
          {isPartial ? (
            <div className="relative">
              <FaStar className="text-gray-300 dark:text-gray-600 text-xl" />
              <div 
                className="absolute top-0 left-0 overflow-hidden text-yellow-400 text-xl"
                style={{ width: `${(rating - index) * 100}%` }}
              >
                <FaStar />
              </div>
            </div>
          ) : (
            <FaStar 
              className={`text-xl ${
                isFilled 
                  ? 'text-yellow-400' 
                  : 'text-gray-300 dark:text-gray-600'
              }`} 
            />
          )}
        </div>
      );
    });
  };

  const getRatingMessage = (rating) => {
    const messages = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return messages[rating] || "";
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 text-indigo-200 dark:text-indigo-800 opacity-30">
        <FaHeart className="text-2xl" />
      </div>
      
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <FaStar className="text-yellow-400" />
          Rate This Post
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Share your thoughts and help others discover great content
        </p>
      </div>

      {/* User Rating Section */}
      {user ? (
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                <FaUser className="text-indigo-600 dark:text-indigo-400 text-sm" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Rating
              </span>
            </div>
            
            <div className="flex justify-center gap-2 mb-4">
              {renderInteractiveStars()}
            </div>
            
            {/* Rating Message */}
            <div className="h-6 flex items-center justify-center">
              {(hoveredRating || userRating) > 0 && (
                <span className={`text-sm font-semibold transition-all duration-300 ${
                  hoveredRating ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {getRatingMessage(hoveredRating || userRating)}
                </span>
              )}
            </div>
            
            {/* Thank You Message */}
            {showThankYou && (
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                  <FaHeart className="text-red-500" />
                  Thank you for your rating!
                </p>
              </div>
            )}
            
            {isLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Saving your rating...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <FaUser className="mx-auto text-3xl text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sign in to rate this post and share your feedback
            </p>
            <button 
              onClick={() => alert("Please sign in to rate this post")}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              Sign In to Rate
            </button>
          </div>
        </div>
      )}

      {/* Overall Rating Display */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
            <span>Community Rating</span>
          </h4>
          
          {averageRating > 0 ? (
            <div className="space-y-4">
              {/* Average Score */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    out of 5
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {renderDisplayStars(averageRating)}
                </div>
              </div>
              
              {/* Rating Statistics */}
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaUser className="text-indigo-500" />
                  <span>{totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeart className="text-red-500" />
                  <span>{getRatingMessage(Math.round(averageRating))}</span>
                </div>
              </div>

              {/* Rating Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(averageRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center gap-1 mb-4 opacity-50">
                {renderDisplayStars(0)}
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No ratings yet. Be the first to rate this post!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogRating;
