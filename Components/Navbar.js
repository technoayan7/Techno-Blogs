import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BiTerminal } from "react-icons/bi";
import { HiSun, HiMoon } from "react-icons/hi";
import { IoSearch } from "react-icons/io5";
import { CgUserlane } from "react-icons/cg";
import { AiOutlineGoogle } from "react-icons/ai";
import { auth, provider } from "../Firebase/Firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { IoLogOutOutline } from "react-icons/io5";
import { SiCodefactor } from "react-icons/si";
import { IoMdArrowDropdown } from "react-icons/io";
import { useDispatch } from "react-redux";
import { FaBookmark, FaCrown } from "react-icons/fa";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [viewAlert, setViewAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const dispatch = useDispatch();

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize filtered results
  const filteredResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return blogs;

    return blogs.filter((blog) =>
      blog.data.Title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      blog.data.Abstract?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      blog.data.Tags?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [blogs, debouncedSearchQuery]);

  useEffect(() => {
    setIsMounted(true);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "STORE_USER", payload: user });
      setLogin(true);
      setUserName(user.name);
      // Check if user is admin
      setIsAdmin(user.email === "ayanahmad7052@gmail.com");
    }
  }, [dispatch]);

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
        localStorage.removeItem("user");
        dispatch({ type: "REMOVE_USER" });
        setViewAlert(true);
        setAlertMessage("Hope to see you again !!");
        setTimeout(() => {
          setViewAlert(false);
        }, 2000);
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
        const isUserAdmin = res.user.email === "ayanahmad7052@gmail.com";
        setIsAdmin(isUserAdmin);

        setViewAlert(true);
        setAlertMessage(
          isUserAdmin
            ? `Welcome back, Admin ${res.user.displayName}! 👑`
            : `Hello ${res.user.displayName}!`
        );
        setTimeout(() => {
          setViewAlert(false);
        }, 2000);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dispatch]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <>
      {viewAlert && <Alert show={viewAlert} type="success" message={alertMessage} />}
      <header className="fixed w-full border-t-4 bg-white dark:bg-dark border-indigo-600 dark:border-indigo-900 shadow dark:shadow-2 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex">
              <Link href="/">
                <a className="flex items-center hover:text-indigo-600 text-gray-800 dark:text-gray-50 transition-colors">
                  <span className="text-xl font-semibold">
                    <BiTerminal className="text-xl" />
                  </span>
                  <span className="mx-1 font-semibold text-base md:text-base">
                    Latest
                  </span>
                </a>
              </Link>

              {/* Admin Badge */}
              {isAdmin && (
                <div className="flex items-center ml-4">
                  <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    <FaCrown className="text-sm mr-1" />
                    <span>Admin</span>
                  </div>
                </div>
              )}

              {/* Dropdown for Topics */}
              <div className="dropdown inline-block relative mx-2">
                <a className="flex items-center hover:text-indigo-600 text-gray-800 dark:text-gray-50 mx-6 cursor-pointer transition-colors">
                  <span className="text-xl font-semibold">
                    <SiCodefactor className="text-sm" />
                  </span>
                  <span className="mx-1 font-semibold text-base md:text-base">
                    Posts
                  </span>
                  <span className="text-xl font-semibold">
                    <IoMdArrowDropdown className="text-xl" />
                  </span>
                </a>
                <ul className="dropdown-menu absolute hidden text-gray-700 bg-white dark:bg-dark w-40 pt-6 rounded-xl left-1/3">
                  {topics.map((topic) => (
                    <Link href={`/topic/${topic}`} key={topic}>
                      <li className="cursor-pointer">
                        <a className="rounded-xl bg-white dark:bg-dark text-gray-800 dark:text-gray-50 py-2 px-4 block whitespace-no-wrap hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          {topic}
                        </a>
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* User Name Display */}
              {isLogin && (
                <div className="hidden md:flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>Welcome, </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-50 ml-1">
                    {isAdmin ? `Admin ${userName}` : userName}
                  </span>
                  {isAdmin && <FaCrown className="text-yellow-500 ml-1 text-xs" />}
                </div>
              )}

              <div className="flex items-center relative">
                {isSearchOpen ? (
                  <div className="relative w-32 md:w-40">
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      className="w-full pl-2 pr-10 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") {
                          setIsSearchOpen(false);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <IoSearch className="text-xl" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-gray-700 dark:text-gray-50 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <IoSearch className="text-xl" />
                  </button>
                )}
              </div>

              <button
                className="flex items-center text-base text-gray-800 hover:text-indigo-600 dark:text-gray-50 transition-colors"
                onClick={toggleTheme}
              >
                <span className="text-lg">
                  {isMounted && theme === "dark" ? (
                    <HiSun className="text-xl" />
                  ) : (
                    <HiMoon className="text-xl" />
                  )}
                </span>
              </button>

              <Link href="/about">
                <a className="flex items-center mx-3 lg:mx-4 text-base text-gray-800 hover:text-indigo-600 dark:text-gray-50 transition-colors">
                  <span className="text-xl">
                    <CgUserlane className="text-xl" />
                  </span>
                </a>
              </Link>

              {isLogin && (
                <Link href="/bookmarks">
                  <a className="flex items-center mx-3 lg:mx-4 text-base text-gray-800 hover:text-indigo-600 dark:text-gray-50 transition-colors">
                    <span className="text-xl">
                      <FaBookmark className="text-xl" />
                    </span>
                  </a>
                </Link>
              )}

              <button className="flex items-center mx-3 lg:mx-4 text-base text-gray-800 hover:text-indigo-600 dark:text-gray-50 transition-colors">
                {isLogin ? (
                  <span
                    className="md:flex items-center"
                    onClick={handleSignOut}
                  >
                    <span className="hidden md:block text-sm font-medium">
                      Sign Out
                    </span>
                    <IoLogOutOutline className="text-xl mx-1" />
                  </span>
                ) : (
                  <span className="md:flex items-center" onClick={handleSignIn}>
                    <span className="hidden md:block text-sm font-medium">
                      Sign In
                    </span>
                    <AiOutlineGoogle className="text-xl mx-1" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
