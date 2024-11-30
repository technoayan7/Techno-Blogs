import React from "react";
import { getAllBlogPosts, getAllTopics } from "../../Lib/Data";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import BlogHeader from "../../Components/BlogHeader";

export const getStaticPaths = () => {
  const allTopics = getAllTopics();
  return {
    paths: allTopics.map((topic) => ({
      params: {
        name: String(topic),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const params = context.params;
  const allBlogs = getAllBlogPosts();
  const allTopics = getAllTopics();

  const filteredBlogs = allBlogs.filter((blog) => blog.data.Topic === params.name);

  // Sort the filtered blogs by ID in descending order (ensuring numeric sorting)
  const sortedBlogs = filteredBlogs.sort((a, b) => Number(b.data.Id) - Number(a.data.Id));

  return {
    props: {
      blogs: sortedBlogs,
      topics: allTopics,
      topicName: params.name,
    },
  };
};

function name({ blogs, topics, topicName }) {
  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900">
      <Navbar topics={topics} />
      <Header topic={true} topicCount={blogs.length} topicName={topicName} />

      <div className="px-0.5 md:px-7 pb-14 pt-6 mx-auto max-w-7xl">
        <div className="flex flex-wrap">
          {blogs &&
            blogs.map(
              (blog) =>
                blog.data.isPublished && (
                  <BlogHeader
                    key={blog.data.Id}
                    data={blog.data}
                    content={blog.content}
                    readTime={blog.readTime.text}
                  />
                )
            )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default name;
