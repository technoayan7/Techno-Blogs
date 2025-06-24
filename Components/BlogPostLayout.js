import Head from "next/head";
import BookmarkButton from "./BookmarkButton";
import BlogRating from "./BlogRating";
import BlogViews from "./BlogViews";

const BlogPostLayout = ({ children, blog }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.data.Title,
    "author": {
      "@type": "Person",
      "name": blog.data.Author
    },
    "datePublished": blog.data.CreatedAt || new Date().toISOString(),
    "image": blog.data.HeaderImage,
    "publisher": {
      "@type": "Organization",
      "name": "Techno Blogs"
    }
  };

  return (
    <>
      <Head>
        <title>{blog.data.Title} | Techno Blogs</title>
        <meta name="description" content={blog.data.Abstract || blog.data.Title} />
        <meta name="keywords" content={blog.data.Tags} />
        <meta name="author" content={blog.data.Author} />
        <meta property="og:title" content={blog.data.Title} />
        <meta property="og:description" content={blog.data.Abstract || blog.data.Title} />
        <meta property="og:image" content={blog.data.HeaderImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.data.Title} />
        <meta name="twitter:description" content={blog.data.Abstract || blog.data.Title} />
        <meta name="twitter:image" content={blog.data.HeaderImage} />
        <link rel="canonical" href={`https://technoblogs.com/blogs/${blog.data.Title.split(" ").join("-").toLowerCase()}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {/* Blog Header */}
        <header className="mb-8 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {blog.data.Title}
          </h1>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <BlogViews id={blog.data.Id} />
              <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                By <span className="font-medium text-gray-700 dark:text-gray-300">{blog.data.Author}</span>
              </span>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <BookmarkButton blogId={blog.data.Id} blogTitle={blog.data.Title} />
            </div>
          </div>
        </header>

        {/* Blog Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-img:rounded-lg prose-img:shadow-lg animate-fade-in-delayed">
          {children}
        </div>

        {/* Rating Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 animate-fade-in-delayed">
          <BlogRating blogId={blog.data.Id} />
        </div>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default BlogPostLayout;
