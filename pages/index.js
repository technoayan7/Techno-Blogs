import { useState } from "react";
import Head from "next/head";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import BlogHeader from "../Components/BlogHeader";
import { getAllBlogPosts, getAllTopics } from "../Lib/Data";

export const getStaticProps = () => {
  const allBlogs = getAllBlogPosts().map((blog) => ({
    data: {
      Id: blog.data.Id,
      Title: blog.data.Title,
      Abstract: blog.data.Abstract,
      Tags: blog.data.Tags || "DefaultTag", // Add a default tag if missing
      isPublished: blog.data.isPublished,
      Author: blog.data.Author,
      HeaderImage: blog.data.HeaderImage,
    },
    readTime: blog.readTime,
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

  // Calculate the blogs to display on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // This receives the filtered array from the Navbar search
  const handleSearchResults = (results) => {
    setFilteredBlogs(results);
    setCurrentPage(1); // Reset to page 1 when new results arrive
  };

  // Pagination controls
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

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
        {/* Pass blogs and search handler to Navbar */}
        <Navbar topics={topics} blogs={blogs} onSearch={handleSearchResults} />
        <Header />

        {/* Main content area */}
        <div className="px-0.5 md:px-7 pb-14 pt-6 mx-auto">
          <div className="flex flex-wrap">
            {displayedBlogs.length > 0 ? (
              displayedBlogs.map(
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 mb-8 space-x-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
