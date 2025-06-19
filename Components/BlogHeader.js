import { AiOutlineArrowRight } from "react-icons/ai";
import Link from "next/link";
import BlogViewsDisplay from "./BlogViewsDisplay";
import BookmarkButton from "./BookmarkButton";

function BlogHeader({ data, content, readTime }) {
  return (
    <div className="w-full px-0.5 md:w-1/2 lg:w-1/3 xl:w-1/3">
      <div className="mx-3 mb-6 rounded-lg shadow-lg bg-white dark:bg-gray-900">
        <img
          className="object-cover w-full h-48 rounded-t-lg"
          src={data.HeaderImage}
          alt="Article"
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap">
              {data.Tags && data.Tags.split(" ").map((tag) => (
                <p
                  key={tag}
                  className="inline-block px-2 py-1 mr-2 mb-2 text-xs font-semibold tracking-wider text-gray-50 uppercase rounded-full bg-indigo-500 dark:bg-indigo-600"
                >
                  {tag}
                </p>
              ))}
            </div>
            <BlogViewsDisplay id={data.Id} />
          </div>
          
          <Link href={`/blogs/${data.Title.split(" ").join("-").toLowerCase()}`}>
            <a className="block mt-2 text-xl font-semibold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {data.Title}
            </a>
          </Link>
          
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {data.Abstract}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              {readTime && (
                <span className="mx-2 text-gray-500">•</span>
              )}
              {readTime && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {readTime}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <BookmarkButton blogId={data.Id} blogTitle={data.Title} />
              <Link href={`/blogs/${data.Title.split(" ").join("-").toLowerCase()}`}>
                <a className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                  Read more
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogHeader;
