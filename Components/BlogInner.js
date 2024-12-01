import { useEffect } from "react";
import { MDXRemote } from "next-mdx-remote";
import Toc from "./Toc";
import rehypePrism from "rehype-prism-plus"; // Syntax highlighting plugin for rehype
import "prismjs/themes/prism-tomorrow.css"; // PrismJS theme

// Ensure PrismJS components are imported globally
import "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-sql";

function BlogInner({ data, content, headings }) {
  useEffect(() => {
    // Run Prism syntax highlighting once Prism is available
    if (typeof window !== "undefined") {
      Prism.highlightAll();  // Highlights all the code blocks after the component mounts
    }
  }, [content]); // Trigger highlightAll only when content changes

  return (
    <div className="mx-auto flex justify-center max-w-screen-xl px-6">
      <div className="rounded-lg shadow-lg bg-white dark:bg-gray-900 pb-8">
        <img
          className="object-cover w-full h-72"
          src={data.HeaderImage}
          alt="Article Image"
        />

        <div className="p-4">
          <div className="flex flex-col items-center">
            <div className="flex justify-around">
              {data.Tags.split(" ").map((tag) => (
                <p
                  key={tag}
                  className="inline-block px-3 ml-3 py-1 mb-4 text-xs font-semibold tracking-wider text-gray-50 uppercase rounded-full bg-indigo-500 dark:bg-indigo-600"
                >
                  {tag}
                </p>
              ))}
            </div>
            <a className="block mt-2 text-2xl sm:text-4xl font-semibold text-gray-800 dark:text-gray-100">
              {data.Title}
            </a>

            <p className="text-5xl pt-2">...</p>

            <article className="prose max-w-xs sm:max-w-sm md:max-w-prose lg:prose-lg py-7 dark:prose-dark">
              {/* Use MDXRemote with rehypePrism for syntax highlighting */}
              <MDXRemote {...content} rehypePlugins={[rehypePrism]} />
            </article>

            <div className="mt-3">
              <div className="flex items-center flex-col">
                <p className="text-5xl pb-2">...</p>
                <p className="text-2xl pb-2">Thanks for reading!!!</p>
                <p className="mx-2 font-semibold text-gray-700 dark:text-gray-100">
                  {data.Author}
                </p>
                <p className="text-sm font-medium leading-4 text-gray-600 dark:text-gray-200">
                  Author
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="toc ml-auto max-w-sm">
        <Toc headings={headings} />
      </div>
    </div>
  );
}

export default BlogInner;
