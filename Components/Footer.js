import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SiTwitter,
  SiGithub,
  SiInstagram,
  SiLinkedin,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiFirebase,
} from "react-icons/si";
import {
  FaHeart,
  FaArrowUp,
  FaEnvelope,
  FaRss,
  FaBookmark,
  FaUser,
  FaHome,
  FaInfoCircle,
  FaCode,
  FaCoffee,
  FaRocket,
} from "react-icons/fa";

function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    // Intersection Observer for footer visibility animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footer = document.getElementById("main-footer");
    if (footer) {
      observer.observe(footer);
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (footer) observer.unobserve(footer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/technoayan7",
      icon: SiTwitter,
      color: "hover:text-blue-400",
      bgColor: "hover:bg-blue-500/10",
    },
    {
      name: "GitHub",
      href: "https://github.com/technoayan7",
      icon: SiGithub,
      color: "hover:text-gray-400",
      bgColor: "hover:bg-gray-500/10",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/iamayan.official/",
      icon: SiInstagram,
      color: "hover:text-pink-400",
      bgColor: "hover:bg-pink-500/10",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/technoayan/",
      icon: SiLinkedin,
      color: "hover:text-blue-600",
      bgColor: "hover:bg-blue-600/10",
    },
  ];

  const quickLinks = [
    { name: "Home", href: "/", icon: FaHome },
    { name: "About", href: "/about", icon: FaInfoCircle },
    { name: "Contact", href: "/contact", icon: FaEnvelope },
    { name: "RSS Feed", href: "/rss.xml", icon: FaRss },
  ];

  const techStack = [
    { name: "React", icon: SiReact, color: "text-blue-400" },
    { name: "Next.js", icon: SiNextdotjs, color: "text-gray-400" },
    { name: "Tailwind", icon: SiTailwindcss, color: "text-cyan-400" },
    { name: "Firebase", icon: SiFirebase, color: "text-orange-400" },
  ];

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce-in group"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}

      <footer
        id="main-footer"
        className={`relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white overflow-hidden transition-all duration-1000 ${
          isVisible ? "animate-slide-up" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-2 animate-fade-in">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center animate-wiggle">
                    <FaRocket className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      TechnoBlogs
                    </h3>
                    <p className="text-gray-400 text-sm">by Ayan Ahmad</p>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
                  Exploring the world of technology through insightful articles,
                  tutorials, and personal experiences. Join me on this journey
                  of continuous learning and innovation.
                </p>

                {/* Newsletter Signup */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <FaEnvelope className="mr-2 text-indigo-400" />
                    Stay Updated
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                    <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <h4 className="text-xl font-bold mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href}>
                        <a className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-200 group hover:translate-x-1">
                          <link.icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                          <span>{link.name}</span>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <h4 className="text-xl font-bold mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
                  Built With
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {techStack.map((tech) => (
                    <div
                      key={tech.name}
                      className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group hover:scale-105"
                    >
                      <tech.icon
                        className={`w-5 h-5 ${tech.color} group-hover:animate-pulse`}
                      />
                      <span className="text-gray-300 text-sm font-medium">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coffee Section */}
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                  <div className="flex items-center space-x-2 text-amber-400 mb-2">
                    <FaCoffee className="animate-pulse" />
                    <span className="text-sm font-medium">
                      Powered by Coffee
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Every line of code written with love and caffeine ☕
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-gray-300 animate-fade-in">
                <span>© {currentYear} TechnoBlogs</span>
                <span className="text-red-400 animate-pulse">•</span>
                <span>Made with</span>
                <FaHeart className="text-red-400 animate-heartbeat mx-1" />
                <span>by</span>
                <a
                  href="https://www.linkedin.com/in/technoayan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline"
                >
                  Ayan Ahmad
                </a>
              </div>

              {/* Social Links */}
              <div
                className="flex items-center space-x-4 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <span className="text-gray-400 text-sm hidden sm:block">
                  Connect with me:
                </span>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 bg-white/5 rounded-full border border-white/10 text-gray-300 ${social.color} ${social.bgColor} transition-all duration-300 transform hover:scale-110 hover:shadow-lg group`}
                      aria-label={`Follow on ${social.name}`}
                    >
                      <social.icon className="w-5 h-5 group-hover:animate-bounce" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p
                className="text-gray-400 text-sm animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                Open source • Privacy focused • Built for developers
                <span className="mx-2">•</span>
                <a
                  href="/privacy"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <span className="mx-2">•</span>
                <a
                  href="/terms"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out both;
          }
          .animate-slide-up {
            animation: slideUp 1s ease-out both;
          }
          .animate-bounce-in {
            animation: bounceIn 0.6s ease-out;
          }
          .animate-wiggle {
            animation: wiggle 6s ease-in-out infinite;
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .animate-heartbeat {
            animation: heartbeat 2s ease-in-out infinite;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3) rotate(-45deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.1) rotate(-45deg);
            }
            70% {
              transform: scale(0.9) rotate(-45deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotate(-45deg);
            }
          }

          @keyframes wiggle {
            0%,
            100% {
              transform: rotate(0deg);
            }
            25% {
              transform: rotate(3deg);
            }
            75% {
              transform: rotate(-3deg);
            }
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes heartbeat {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          /* Accessibility improvements */
          @media (prefers-reduced-motion: reduce) {
            .animate-fade-in,
            .animate-slide-up,
            .animate-bounce-in,
            .animate-wiggle,
            .animate-float,
            .animate-heartbeat {
              animation: none !important;
            }

            * {
              transition: none !important;
            }
          }

          /* Enhanced hover effects */
          @media (hover: hover) {
            .group:hover .group\\:animate-bounce {
              animation: bounce 1s ease-in-out infinite;
            }

            .group:hover .group\\:animate-pulse {
              animation: pulse 2s ease-in-out infinite;
            }
          }

          /* Mobile optimizations */
          @media (max-width: 640px) {
            .animate-fade-in {
              animation-duration: 0.6s;
            }

            .animate-slide-up {
              animation-duration: 0.8s;
            }
          }
        `}</style>
      </footer>
    </>
  );
}

export default Footer;
