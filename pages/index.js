import { useState, useCallback, useMemo } from "react";
import Head from "next/head";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import BlogHeader from "../Components/BlogHeader";
import BookmarkButton from "../Components/BookmarkButton";
import BlogViewsDisplay from "../Components/BlogViewsDisplay";
import { getAllBlogPosts, getAllTopics } from "../Lib/Data";

export const getStaticProps = () => {
  const allBlogs = getAllBlogPosts().map((blog) => ({
    data: {
      Id: blog.data.Id,
      Title: blog.data.Title,
      Abstract: blog.data.Abstract,
      Tags: blog.data.Tags || "DefaultTag",
      isPublished: blog.data.isPublished,
      Author: blog.data.Author,
      HeaderImage: blog.data.HeaderImage,
    },
    readTime: blog.readTime, // Keep original reading time
  }));
  const allTopics = getAllTopics();

  return {
    props: {
      blogs: allBlogs,
      topics: allTopics,
    },
  };
};

export default function Home({ blogs, topics }) {
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedBlogs = filteredBlogs.slice(startIndex, endIndex);

    return { totalPages, displayedBlogs };
  }, [filteredBlogs, currentPage, itemsPerPage]);

  // Use useCallback to prevent unnecessary re-renders
  const handleSearchResults = useCallback((results) => {
    setFilteredBlogs(results);
    setCurrentPage(1); // Only reset to page 1 for search
  }, []);

  // Pagination controls with useCallback
  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) =>
      prev < paginationData.totalPages ? prev + 1 : prev
    );
  }, [paginationData.totalPages]);

  // Direct page navigation
  const goToPage = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= paginationData.totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [paginationData.totalPages]
  );

  return (
    <>
      <Head>
        <title>Ayan Ahmad | Blog 🚀</title>
        <meta name="title" content="Ayan Ahmad | Blog 🚀" />
        <meta
          name="description"
          content="Explore insightful blogs on technology, software development, and personal experiences from Ayan Ahmad."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://technoblogs.onrender.com" />
        <meta property="og:title" content="Ayan Ahmad | Blog 🚀" />
        <meta
          property="og:description"
          content="Explore insightful blogs on technology, software development, and personal experiences from Ayan Ahmad."
        />
        <meta property="og:image" content="https://i.imgur.com/k7Ra9ab.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://blogs.ayan-ahmad.dev/" />
        <meta property="twitter:title" content="Ayan Ahmad | Blog 🚀" />
        <meta
          property="twitter:description"
          content="Explore insightful blogs on technology, software development, and personal experiences from Ayan Ahmad."
        />
        <meta
          property="twitter:image"
          content="https://yourdomain.com/path-to-blog-preview-image.png"
        />
      </Head>

      <div className="min-h-screen relative bg-white dark:bg-gray-900">
        <Navbar topics={topics} blogs={blogs} onSearch={handleSearchResults} />
        <Header />

        {/* Main content area */}
        <div className="px-0.5 md:px-7 pb-14 pt-6 mx-auto">
          <div className="flex flex-wrap">
            {paginationData.displayedBlogs.length > 0 ? (
              paginationData.displayedBlogs.map(
                (blog) =>
                  blog.data.isPublished && (
                    <BlogHeader
                      key={blog.data.Id}
                      data={blog.data}
                      content={blog.content}
                      readTime={blog.readTime?.text}
                    />
                  )
              )
            ) : (
              <p className="text-gray-500 text-center w-full">
                No blogs found for the search query.
              </p>
            )}
          </div>

          {/* Enhanced Pagination Controls */}
          {paginationData.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 mb-8">
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {/* Current page and neighbors */}
                  {Array.from(
                    { length: paginationData.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page >= Math.max(1, currentPage - 2) &&
                        page <= Math.min(
                          paginationData.totalPages,
                          currentPage + 2
                        )
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 border rounded transition-colors ${page === currentPage
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Last page */}
                  {currentPage < paginationData.totalPages - 2 && (
                    <>
                      {currentPage < paginationData.totalPages - 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => goToPage(paginationData.totalPages)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {paginationData.totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === paginationData.totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>

              {/* Page Info */}
              <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {paginationData.totalPages}
                <span className="ml-2">
                  ({filteredBlogs.length} total blogs)
                </span>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
