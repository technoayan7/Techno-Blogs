import Head from "next/head";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import BlogHeader from "../Components/BlogHeader";
import { getAllBlogPosts, getAllTopics } from "../Lib/Data";

export const getStaticProps = () => {
  const allBlogs = getAllBlogPosts();
  const allTopics = getAllTopics();
  return {
    props: {
      blogs: allBlogs,
      topics: allTopics,
    },
  };
};

export default function Home({ blogs, topics }) {
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
        <meta
          property="og:image"
          content="https://i.imgur.com/k7Ra9ab.png"
        />

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
        <Navbar topics={topics} />
        <Header />

        <div className="px-0.5 md:px-7 pb-14 pt-6 mx-auto">
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
    </>
  );
}
