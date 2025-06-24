import { useEffect, useState } from "react";
import { MDXRemote } from "next-mdx-remote";
import Toc from "./Toc";
import rehypePrism from "rehype-prism-plus";
import "prismjs/themes/prism-tomorrow.css";
import { FaQuoteLeft, FaCode, FaLightbulb, FaExclamationTriangle, FaInfo, FaHeart, FaCheck, FaCopy } from "react-icons/fa";

// Proper Prism import
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-sql";

// Custom components for MDX
const components = {
  h1: ({ children, ...props }) => (
    <h1 className="group relative text-4xl font-bold text-gray-900 dark:text-white mb-8 mt-12 pb-4 border-b-2 border-gray-200 dark:border-gray-700" {...props}>
      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {children}
      </span>
      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 w-0 group-hover:w-full transition-all duration-500"></div>
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="group relative text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 mt-10 flex items-center" {...props}>
      <span className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-4"></span>
      {children}
      <div className="ml-4 h-px bg-gradient-to-r from-indigo-500/50 to-transparent flex-1"></div>
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-8 flex items-center" {...props}>
      <FaLightbulb className="text-yellow-500 mr-3" />
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-6" {...props}>
      {children}
    </p>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="relative bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-l-4 border-indigo-500 p-6 rounded-r-lg mb-8 italic" {...props}>
      <FaQuoteLeft className="absolute top-4 left-4 text-indigo-400 text-xl" />
      <div className="ml-8 text-gray-700 dark:text-gray-300 text-lg">
        {children}
      </div>
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    
    if (isInline) {
      return (
        <code className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md text-sm font-mono border border-indigo-200 dark:border-indigo-700 font-semibold" {...props}>
          {children}
        </code>
      );
    }
    
    return <CodeBlock code={children} className={className} {...props} />;
  },
  pre: ({ children, ...props }) => children, // Let the code component handle the pre
  ul: ({ children, ...props }) => (
    <ul className="space-y-3 mb-6 ml-6" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="space-y-3 mb-6 ml-6 list-decimal" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="flex items-start text-gray-700 dark:text-gray-300" {...props}>
      <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
      <span>{children}</span>
    </li>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700" {...props}>
      {children}
    </td>
  ),
  a: ({ children, href, ...props }) => (
    <a 
      href={href} 
      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline decoration-2 underline-offset-2 hover:decoration-indigo-500 transition-all duration-200 font-medium"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-bold text-gray-900 dark:text-white bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-indigo-500/30 dark:to-purple-500/30 px-1.5 py-0.5 rounded-md shadow-sm dark:shadow-indigo-500/20" {...props}>
      {children}
    </strong>
  ),
};

// Separate CodeBlock component with copy functionality
function CodeBlock({ code, className, ...props }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group mb-8">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={copyToClipboard}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            copied 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          {copied ? (
            <>
              <FaCheck className="w-3 h-3" />
              <span className="animate-fade-in">Copied!</span>
            </>
          ) : (
            <>
              <FaCopy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 dark:bg-gray-950 rounded-xl p-6 overflow-x-auto border border-gray-700 dark:border-gray-800 shadow-2xl">
        <code className={className} {...props}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function BlogInner({ data, content, headings }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof Prism !== "undefined") {
      setTimeout(() => {
        Prism.highlightAll();
      }, 100);
      setIsLoaded(true);
      
      // Calculate reading time
      const text = document.querySelector('article')?.textContent || '';
      const wordsPerMinute = 200;
      const wordCount = text.split(/\s+/).length;
      setReadingTime(Math.ceil(wordCount / wordsPerMinute));
    }
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(scroll * 100);
      
      // Show scroll to top button after scrolling 50%
      setShowScrollTop(scroll * 100 > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Enhanced Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out relative"
          style={{ width: `${scrollProgress}%` }}
        >
          <div className="absolute right-0 top-0 w-4 h-full bg-white/30 animate-pulse"></div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-in lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      <div className="mx-auto flex flex-col lg:flex-row justify-center max-w-screen-xl px-4 sm:px-6 gap-8 animate-fade-in">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl animate-slide-up">
          <div className="rounded-3xl shadow-2xl bg-white dark:bg-gray-900 overflow-hidden hover:shadow-3xl transition-shadow duration-500 border border-gray-100 dark:border-gray-800">
            {/* Hero Image with Overlay */}
            <div className="relative overflow-hidden group">
              <img
                className="object-cover w-full h-[250px] sm:h-[350px] lg:h-[400px] transition-transform duration-700 group-hover:scale-105"
                src={data.HeaderImage}
                alt={data.Title}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Reading time badge */}
              <div className="absolute top-6 left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
                <FaInfo className="text-indigo-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {readingTime} min read
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              {/* Enhanced Tags */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {data.Tags.split(" ").map((tag, index) => (
                  <span
                    key={tag}
                    className="relative inline-block px-4 py-2 text-sm font-semibold tracking-wider text-white uppercase rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-110 transition-transform duration-200 animate-fade-in shadow-lg hover:shadow-xl cursor-default"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {tag}
                    <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                  </span>
                ))}
              </div>

              {/* Enhanced Title */}
              <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight animate-slide-up">
                <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {data.Title}
                </span>
              </h1>

              {/* Enhanced Divider */}
              <div className="flex justify-center mb-12 animate-pulse-slow">
                <div className="flex items-center space-x-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-indigo-500"></div>
                  <div className="flex space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-bounce shadow-lg"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500"></div>
                </div>
              </div>

              {/* Enhanced Article Content */}
              <article className="prose prose-xl dark:prose-invert max-w-none animate-fade-in-delayed prose-headings:font-bold prose-p:text-lg prose-p:leading-relaxed prose-li:text-lg">
                <MDXRemote {...content} components={components} rehypePlugins={[rehypePrism]} />
              </article>

              {/* Enhanced Author Section */}
              <div className="mt-16 pt-12 border-t-2 border-gray-200 dark:border-gray-700 animate-fade-in-delayed">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 text-center border border-indigo-100 dark:border-indigo-800">
                  <div className="flex justify-center mb-6 animate-wiggle">
                    <div className="relative">
                      <div className="flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg" 
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <FaHeart className="text-red-500 text-2xl animate-bounce" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 hover:scale-105 transition-transform duration-200">
                    Thanks for reading!
                  </h3>
                  
                  <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 hover:scale-105 transition-transform duration-200">
                    {data.Author}
                  </p>
                  
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Author & Tech Enthusiast
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "Keep learning, keep growing, and keep sharing knowledge with the world."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Table of Contents */}
        <div className="lg:w-80 animate-slide-in-right">
          <Toc headings={headings} />
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        .animate-fade-in-delayed {
          animation: fadeIn 0.8s ease-out 0.5s both;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out 0.5s both;
        }
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        .animate-wiggle {
          animation: wiggle 4s ease-in-out infinite;
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
      
      <style jsx global>{`
        /* Custom scrollbar styles */
        .prose ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .prose ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .prose ::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 3px;
        }
        
        /* Dark mode scrollbar */
        .dark .prose ::-webkit-scrollbar-track {
          background: #374151;
        }
        .dark .prose ::-webkit-scrollbar-thumb {
          background: #6366f1;
        }

        /* Enhanced highlighting for better readability */
        .prose em {
          color: #6366f1;
          font-style: italic;
        }
        .dark .prose em {
          color: #a5b4fc;
        }
        
        /* Better focus states */
        .prose a:focus {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}

export default BlogInner;
