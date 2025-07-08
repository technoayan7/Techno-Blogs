import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import BlogViewsDisplay from "./BlogViewsDisplay";
import BookmarkButton from "./BookmarkButton";
import { FaClock, FaArrowRight } from "react-icons/fa";

function BlogHeader({ data, content, readTime, index = 0 }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);
  const cardRef = useRef(null);

  // Preload images for first 6 cards immediately
  const shouldLoadEagerly = index < 6;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current && !shouldLoadEagerly) {
      observer.observe(cardRef.current);
    } else {
      setIsVisible(true);
    }

    return () => observer.disconnect();
  }, [shouldLoadEagerly]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Create a fallback SVG image
  const fallbackImage = `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="50%" y="40%" width="100" height="6" rx="3" fill="#d1d5db" transform="translate(-50, 0)"/>
      <rect x="50%" y="52%" width="60" height="4" rx="2" fill="#e5e7eb" transform="translate(-30, 0)"/>
      <circle cx="50%" cy="25%" r="15" fill="#e5e7eb"/>
    </svg>
  `)}`;

  return (
    <div
      ref={cardRef}
      className="w-full sm:w-1/2 lg:w-1/3 p-3 animate-card-appear"
    >
      <div className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col hover:-translate-y-2 hover:scale-[1.02]">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-2xl h-48 sm:h-52 bg-gray-200 dark:bg-gray-700">
          {/* Always show image, just handle loading states */}
          {(isVisible || shouldLoadEagerly) && (
            <>
              {/* Loading skeleton - only show while loading */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              )}

              <img
                ref={imgRef}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={imageError ? fallbackImage : data.HeaderImage}
                alt={data.Title}
                loading={shouldLoadEagerly ? "eager" : "lazy"}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  display: 'block', // Always show the image
                  opacity: imageLoaded || imageError ? 1 : 0.8 // Slight opacity while loading
                }}
              />
            </>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bookmark Button Overlay */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <BookmarkButton blogId={data.Id} blogTitle={data.Title} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Tags and Views */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-wrap gap-2">
              {data.Tags && data.Tags.split(" ").slice(0, 2).map((tag, tagIndex) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-110 transition-transform duration-200 animate-tag-appear"
                  style={{ animationDelay: `${tagIndex * 0.1 + 0.3}s` }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <BlogViewsDisplay id={data.Id} />
          </div>

          {/* Title */}
          <Link
            href={`/blogs/${data.Title.split(" ").join("-").toLowerCase()}`}
            className="block text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 mb-3 line-clamp-2 hover:translate-x-1"
          >
            {data.Title}
          </Link>

          {/* Abstract */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-1">
            {data.Abstract}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
            {/* Read Time */}
            {readTime && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                <FaClock className="w-3 h-3 mr-1" />
                <span>{readTime}</span>
              </div>
            )}

            {/* Read More Button */}
            <Link
              href={`/blogs/${data.Title.split(" ").join("-").toLowerCase()}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-white dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-600 rounded-lg transition-all duration-300 group hover:scale-105"
            >
              Read more
              <div className="ml-2 animate-arrow-move">
                <FaArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-card-appear {
          animation: cardAppear 0.6s ease-out;
        }
        .animate-tag-appear {
          animation: tagAppear 0.4s ease-out both;
        }
        .animate-arrow-move {
          animation: arrowMove 1.5s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tagAppear {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes arrowMove {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default BlogHeader;
