import React, { useEffect, useState } from "react";
import { FaList, FaBookOpen, FaChevronRight } from "react-icons/fa";

function Toc({ headings }) {
  const [active, setActive] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -80% 0%" }
    );

    // Enhanced heading selection - try multiple selectors
    const headingElements = [];

    headings.forEach(heading => {
      // Try to find element by exact ID first
      let element = document.getElementById(heading.id);

      // If not found, try to find by text content
      if (!element) {
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        element = Array.from(allHeadings).find(h =>
          h.textContent.trim() === heading.text.trim()
        );
      }

      // If still not found, try to find by slug
      if (!element && heading.slug) {
        element = document.getElementById(heading.slug);
      }

      if (element) {
        // Ensure the element has an ID for navigation
        if (!element.id) {
          element.id = heading.id || heading.slug || createSlug(heading.text);
        }
        headingElements.push(element);
      }
    });

    headingElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  // Helper function to create slug from text
  const createSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleClick = (headingId, headingText) => {
    // Try multiple approaches to find and scroll to the element
    let element = document.getElementById(headingId);

    // If ID doesn't work, try finding by text content
    if (!element) {
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      element = Array.from(allHeadings).find(h =>
        h.textContent.trim() === headingText.trim()
      );
    }

    // If still not found, try creating a slug and searching
    if (!element) {
      const slug = createSlug(headingText);
      element = document.getElementById(slug);
    }

    if (element) {
      setActive(element.id || headingId);

      // Enhanced smooth scrolling with offset for fixed headers
      const headerOffset = 100; // Adjust based on your header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Add visual feedback
      element.style.backgroundColor = '#fef3c7'; // Light yellow highlight
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    } else {
      console.warn(`Could not find heading element for: ${headingText}`);

      // Fallback: scroll to top if element not found
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile TOC Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          aria-label="Toggle Table of Contents"
        >
          <FaList className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile TOC Overlay */}
      {isVisible && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fade-in">
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <FaBookOpen className="text-indigo-600 text-xl" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Table of Contents
                  </h3>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                  aria-label="Close Table of Contents"
                >
                  ×
                </button>
              </div>
              <nav className="overflow-auto max-h-[calc(100vh-120px)]">
                <TocContent
                  headings={headings}
                  active={active}
                  onItemClick={(id, text) => {
                    handleClick(id, text);
                    setIsVisible(false);
                  }}
                />
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop TOC */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-in-right sticky top-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <div className="flex items-center space-x-2 text-white">
              <FaBookOpen className="text-lg" />
              <h3 className="font-bold text-lg">Table of Contents</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[70vh] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <TocContent
              headings={headings}
              active={active}
              onItemClick={handleClick}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
        }
        .dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #6b7280;
        }
      `}</style>
    </>
  );
}

function TocContent({ headings, active, onItemClick }) {
  return (
    <ul className="space-y-1">
      {headings.map((heading, index) => {
        const isActive = heading.id === active;
        const isH2 = heading.level === 2;
        const isH3 = heading.level === 3;

        return (
          <li key={heading.uid || heading.id || index} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <button
              onClick={() => onItemClick(heading.id, heading.text)}
              className={`group w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500'
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              } ${isH3 ? 'ml-4 text-sm' : isH2 ? 'font-medium' : 'font-semibold'}`}
              title={`Navigate to: ${heading.text}`}
            >
              <FaChevronRight
                className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${
                  isActive ? 'rotate-90 text-indigo-500' : 'group-hover:translate-x-1'
                }`}
              />
              <span className={`line-clamp-2 ${isActive ? 'font-semibold' : ''}`}>
                {heading.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default Toc;
