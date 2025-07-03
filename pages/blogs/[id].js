import { getAllBlogPosts, getAllTopics } from "../../Lib/Data";
import { serialize } from "next-mdx-remote/serialize";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import Head from "next/head";
import BlogInner from "../../Components/BlogInner";
import BlogViews from "../../Components/BlogViews";
import EnhancedComments from "../../Components/EnhancedComments";
import ReadingTimeProgress from "../../Components/ReadingTimeProgress";
import BookmarkButton from "../../Components/BookmarkButton";
import BlogRating from "../../Components/BlogRating";
import SimpleLikeBtn from "../../Components/SimpleLikeBtn";
import { remarkHeadingId } from "remark-custom-heading-id";
import { getHeadings } from "../../Lib/GetHeadings";

export const getStaticPaths = () => {
  const allBlogs = getAllBlogPosts();

  // Sort blogs by ID in descending order
  const sortedBlogs = allBlogs.sort((a, b) => b.data.Id - a.data.Id);

  return {
    paths: sortedBlogs.map((blog) => ({
      params: {
        id: String(blog.data.Title.split(" ").join("-").toLowerCase()),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const params = context.params;
  const allBlogs = getAllBlogPosts();
  const allTopics = getAllTopics();

  // Sort blogs by ID in descending order
  const sortedBlogs = allBlogs.sort((a, b) => b.data.Id - a.data.Id);

  const page = sortedBlogs.find(
    (blog) =>
      String(blog.data.Title.split(" ").join("-").toLowerCase()) === params.id
  );

  const { data, content } = page;

  // Use the same reading time that's already calculated in getAllBlogPosts
  const readingTimeMinutes = page.readTime ?
    parseInt(page.readTime.text.split(' ')[0]) : // Extract number from "5 min read"
    Math.max(2, Math.ceil(content.length / 1000)); // Fallback calculation

  const mdxSource = await serialize(content, {
    scope: data,
    mdxOptions: { remarkPlugins: [remarkHeadingId] },
  });

  const headings = await getHeadings(content);

  return {
    props: {
      data: data,
      content: mdxSource,
      id: params.id,
      headings: headings,
      topics: allTopics,
      readingTime: readingTimeMinutes,
    },
  };
};

function BlogPost({ data, content, id, headings, topics, readingTime }) {
  return (
    <>
      <Head>
        <title>{data.Title}</title>
        <meta name="title" content={data.Title} />
        <meta name="description" content={data.Abstract} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blogs.soumya-jit.tech/" />
        <meta property="og:title" content={data.Title} />
        <meta property="og:description" content={data.Abstract} />
        <meta
          property="og:image"
          content={data.HeaderImage}
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://blogs.soumya-jit.tech/" />
        <meta property="twitter:title" content={data.Title} />
        <meta property="twitter:description" content={data.Abstract} />
        <meta
          property="twitter:image"
          content={data.HeaderImage}
        />

        {/* Preload the header image for faster loading */}
        <link rel="preload" as="image" href={data.HeaderImage} />
      </Head>

      <div className="min-h-screen relative bg-white dark:bg-gray-900">
        <Navbar topics={topics} />

        <ReadingTimeProgress
          content={content}
          estimatedTime={readingTime}
        />

        <div className="py-24">
          {/* Blog Header with Bookmark Button */}
          <div className="max-w-4xl mx-auto px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {data.Title}
                </h1>
                <div className="flex items-center space-x-4">
                  <BlogViews id={data.Id} />
                  <span className="text-gray-500 dark:text-gray-400">
                    By {data.Author}
                  </span>
                  {data.Tags && (
                    <div className="flex flex-wrap gap-2">
                      {data.Tags.split(' ').map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <BookmarkButton blogId={data.Id} blogTitle={data.Title} />
            </div>
          </div>

          <BlogInner data={data} content={content} headings={headings} />

          {/* Action Buttons - Using simple version temporarily */}
          <div className="max-w-4xl mx-auto px-6 mt-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SimpleLikeBtn blogId={data.Id} />
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                <div className="text-center">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: data.Title,
                          text: data.Abstract,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Share This Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="max-w-4xl mx-auto px-6 mb-8">
            <BlogRating blogId={data.Id} />
          </div>

          {/* Comments Section */}
          <div className="max-w-4xl mx-auto px-6">
            <EnhancedComments blogId={data.Id} />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default BlogPost;
