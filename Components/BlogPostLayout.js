import BookmarkButton from "./BookmarkButton";
import BlogRating from "./BlogRating";
import BlogViews from "./BlogViews";

const BlogPostLayout = ({ children, blog }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Blog Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {blog.data.Title}
        </h1>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <BlogViews id={blog.data.Id} />
            <span className="text-gray-500 dark:text-gray-400">
              By {blog.data.Author}
            </span>
          </div>
          <BookmarkButton blogId={blog.data.Id} blogTitle={blog.data.Title} />
        </div>
      </header>

      {/* Blog Content */}
      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>

      {/* Rating Section */}
      <div className="mt-12">
        <BlogRating blogId={blog.data.Id} />
      </div>
    </div>
  );
};

export default BlogPostLayout;
