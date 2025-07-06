import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BiTerminal } from "react-icons/bi";
import { HiSun, HiMoon, HiMenuAlt3, HiX } from "react-icons/hi";
import { IoSearch, IoClose } from "react-icons/io5";
import { CgUserlane } from "react-icons/cg";
import { AiOutlineGoogle } from "react-icons/ai";
import { auth, provider } from "../Firebase/Firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { IoLogOutOutline } from "react-icons/io5";
import { SiCodefactor } from "react-icons/si";
import { IoMdArrowDropdown } from "react-icons/io";
import { useDispatch } from "react-redux";
import {
  FaBookmark,
  FaCrown,
  FaChevronDown,
  FaUser,
  FaBell,
} from "react-icons/fa";

// Lazy load Alert component
const Alert = dynamic(() => import("./Alert"), { ssr: false });

// Debounce hook for search optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function Navbar({ topics, blogs = [], onSearch = () => {} }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLogin, setLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTopicsDropdownOpen, setIsTopicsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [viewAlert, setViewAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const dispatch = useDispatch();

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize filtered results
  const filteredResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return blogs;

    return blogs.filter(
      (blog) =>
        blog.data.Title.toLowerCase().includes(
          debouncedSearchQuery.toLowerCase()
        ) ||
        blog.data.Abstract?.toLowerCase().includes(
          debouncedSearchQuery.toLowerCase()
        ) ||
        blog.data.Tags?.toLowerCase().includes(
          debouncedSearchQuery.toLowerCase()
        )
    );
  }, [blogs, debouncedSearchQuery]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "STORE_USER", payload: user });
      setLogin(true);
      setUserName(user.name);
      setUserPhoto(user.photo);
      setIsAdmin(user.email === "ayanahmad7052@gmail.com");
    }
  }, [dispatch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsTopicsDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update search results when filtered results change
  useEffect(() => {
    onSearch(filteredResults);
  }, [filteredResults, onSearch]);

  const toggleTheme = useCallback(() => {
    if (isMounted) {
      setTheme(theme === "light" ? "dark" : "light");
    }
  }, [isMounted, theme, setTheme]);

  const handleSignOut = useCallback(() => {
    signOut(auth)
      .then(() => {
        setLogin(false);
        setIsAdmin(false);
        setUserName("");
        setUserPhoto("");
        localStorage.removeItem("user");
        dispatch({ type: "REMOVE_USER" });
        setViewAlert(true);
        setAlertMessage("Hope to see you again! 👋");
        setTimeout(() => {
          setViewAlert(false);
        }, 3000);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [dispatch]);

  const handleSignIn = useCallback(() => {
    signInWithPopup(auth, provider)
      .then((res) => {
        const userObj = {
          name: res.user.displayName,
          photo: res.user.photoURL,
          token: res.user.accessToken,
          uid: res.user.uid,
          email: res.user.email,
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        dispatch({ type: "STORE_USER", payload: userObj });

        setLogin(true);
        setUserName(res.user.displayName);
        setUserPhoto(res.user.photoURL);
        const isUserAdmin = res.user.email === "ayanahmad7052@gmail.com";
        setIsAdmin(isUserAdmin);

        setViewAlert(true);
        setAlertMessage(
          isUserAdmin
            ? `Welcome back, Admin ${res.user.displayName}! 👑`
            : `Welcome ${res.user.displayName}! 🎉`
        );
        setTimeout(() => {
          setViewAlert(false);
        }, 3000);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {viewAlert && (
        <Alert show={viewAlert} type="success" message={alertMessage} />
      )}

      {/* Main Navbar */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700"
            : "bg-white dark:bg-gray-900 border-t-4 border-indigo-600 dark:border-indigo-500 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <Link href="/">
                <a className="flex items-center space-x-2 group">
                  <div className="relative">
                    <BiTerminal className="text-2xl text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" />
                    <div className="absolute -inset-1 bg-indigo-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    TechnoBlogs
                  </span>
                </a>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                <Link href="/">
                  <a className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                    Latest
                  </a>
                </Link>

                {/* Topics Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() =>
                      setIsTopicsDropdownOpen(!isTopicsDropdownOpen)
                    }
                    className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <SiCodefactor className="text-sm" />
                    <span>Topics</span>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-200 ${
                        isTopicsDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Topics Dropdown Menu */}
                  {isTopicsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slideDown">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        Browse Topics
                      </div>
                      {topics.map((topic, index) => (
                        <Link href={`/topic/${topic}`} key={topic}>
                          <a
                            onClick={() => setIsTopicsDropdownOpen(false)}
                            className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                              <span>{topic}</span>
                            </div>
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link href="/about">
                  <a className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                    About
                  </a>
                </Link>
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-64 sm:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoFocus
                      />
                      <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    </div>
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <IoClose className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                    title="Search"
                  >
                    <IoSearch className="text-xl" />
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                title={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {isMounted && (
                  <div className="relative w-5 h-5">
                    {theme === "dark" ? (
                      <HiSun className="text-xl animate-spin-slow" />
                    ) : (
                      <HiMoon className="text-xl" />
                    )}
                  </div>
                )}
              </button>

              {/* User Section */}
              {isLogin ? (
                <div className="hidden lg:flex items-center space-x-3">
                  {/* Bookmarks */}
                  <Link href="/bookmarks">
                    <a
                      className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                      title="Bookmarks"
                    >
                      <FaBookmark className="text-lg" />
                    </a>
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={userName}
                          className="w-8 h-8 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                          <FaUser className="text-white text-sm" />
                        </div>
                      )}
                      <div className="hidden xl:block text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {isAdmin && (
                            <FaCrown className="inline text-yellow-500 mr-1" />
                          )}
                          {userName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {isAdmin ? "Administrator" : "Member"}
                        </div>
                      </div>
                      <FaChevronDown
                        className={`text-xs text-gray-400 transition-transform duration-200 ${
                          isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slideDown">
                        {isAdmin && (
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                              <FaCrown className="text-sm" />
                              <span className="text-xs font-semibold">
                                Administrator
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {userName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Signed in
                          </div>
                        </div>

                        <Link href="/profile">
                          <a className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <FaUser className="text-sm" />
                            <span>Profile</span>
                          </a>
                        </Link>

                        <Link href="/bookmarks">
                          <a className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <FaBookmark className="text-sm" />
                            <span>Bookmarks</span>
                          </a>
                        </Link>

                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <IoLogOutOutline className="text-sm" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  <AiOutlineGoogle className="text-lg" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <HiX className="text-xl" />
                ) : (
                  <HiMenuAlt3 className="text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
            <div className="px-4 py-6 space-y-4">
              {/* User Info Mobile */}
              {isLogin && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={userName}
                      className="w-10 h-10 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {isAdmin && (
                        <FaCrown className="inline text-yellow-500 mr-1" />
                      )}
                      {userName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isAdmin ? "Administrator" : "Member"}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link href="/">
                  <a
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Latest Posts
                  </a>
                </Link>

                {/* Topics in Mobile */}
                <div className="space-y-1">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Topics
                  </div>
                  {topics.map((topic) => (
                    <Link href={`/topic/${topic}`} key={topic}>
                      <a
                        onClick={closeMobileMenu}
                        className="block px-6 py-2 text-base text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {topic}
                      </a>
                    </Link>
                  ))}
                </div>

                <Link href="/about">
                  <a
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    About
                  </a>
                </Link>

                {isLogin && (
                  <>
                    <Link href="/bookmarks">
                      <a
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Bookmarks
                      </a>
                    </Link>

                    <button
                      onClick={() => {
                        handleSignOut();
                        closeMobileMenu();
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <IoLogOutOutline className="text-lg" />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}

                {!isLogin && (
                  <button
                    onClick={() => {
                      handleSignIn();
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    <AiOutlineGoogle className="text-lg" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Search Results Overlay */}
      {isSearchOpen && searchQuery && (
        <div
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => setIsSearchOpen(false)}
        >
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="p-2">
                  {filteredResults.slice(0, 5).map((blog, index) => (
                    <Link href={`/blog/${blog.slug}`} key={blog.data.Id}>
                      <a
                        onClick={() => setIsSearchOpen(false)}
                        className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {blog.data.Title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {blog.data.Abstract}
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No articles found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add padding to prevent content from hiding under fixed navbar */}
      <div className="h-16 lg:h-18"></div>

      <style jsx>{`
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Dropdown hover styles */
        .dropdown:hover .dropdown-menu {
          display: block;
        }

        /* Custom scrollbar for search results */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
      `}</style>
    </>
  );
}

export default Navbar;
