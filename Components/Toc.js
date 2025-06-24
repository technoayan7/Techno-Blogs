import React, { useEffect, useState } from "react";
import Link from "next/link";
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

    const headingElements = headings.map(heading => 
      document.getElementById(heading.id)
    ).filter(Boolean);

    headingElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (headingId) => {
    setActive(headingId);
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Mobile TOC Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
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
                >
                  ×
                </button>
              </div>
              <nav className="overflow-auto max-h-[calc(100vh-120px)]">
                <TocContent 
                  headings={headings} 
                  active={active} 
                  onItemClick={(id) => {
                    handleClick(id);
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-in-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <div className="flex items-center space-x-2 text-white">
              <FaBookOpen className="text-lg" />
              <h3 className="font-bold text-lg">Table of Contents</h3>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4 max-h-[70vh] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <TocContent headings={headings} active={active} onItemClick={handleClick} />
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
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
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
          <li key={heading.uid} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
            <button
              onClick={() => onItemClick(heading.id)}
              className={`group w-full text-left px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${
                isActive 
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              } ${isH3 ? 'ml-4 text-sm' : isH2 ? 'font-medium' : 'font-semibold'}`}
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
