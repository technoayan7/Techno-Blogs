import { useState } from "react";
import { 
  FaShare, 
  FaTwitter, 
  FaFacebook, 
  FaLinkedin, 
  FaWhatsapp, 
  FaReddit,
  FaCopy,
  FaEnvelope,
  FaTelegram,
  FaCheck,
  FaUser,
  FaHeart
} from "react-icons/fa";

const EnhancedBlogShare = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const blogUrl = typeof window !== 'undefined' ? window.location.href : '';
  const blogTitle = data?.Title || '';
  const blogDescription = data?.Abstract || '';

  const shareLinks = [
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogTitle)}&url=${encodeURIComponent(blogUrl)}`,
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-800 hover:bg-blue-900',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${blogTitle} ${blogUrl}`)}`,
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      color: 'bg-orange-600 hover:bg-orange-700',
      url: `https://reddit.com/submit?url=${encodeURIComponent(blogUrl)}&title=${encodeURIComponent(blogTitle)}`,
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(blogUrl)}&text=${encodeURIComponent(blogTitle)}`,
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(blogTitle)}&body=${encodeURIComponent(`Check out this blog post: ${blogTitle}\n\n${blogDescription}\n\n${blogUrl}`)}`,
    },
  ];

  const handleShare = (platform) => {
    setShareCount(prev => prev + 1);
    // Track sharing analytics here if needed
    console.log(`Shared on ${platform.name}`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      setCopied(true);
      setShareCount(prev => prev + 1);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = blogUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-2xl p-6 shadow-xl border border-indigo-200 dark:border-indigo-800">
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 text-indigo-200 dark:text-indigo-800 opacity-30">
        <FaShare className="text-2xl" />
      </div>
      
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <FaShare className="text-indigo-600" />
          Share This Post
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Help others discover this content
        </p>
        {shareCount > 0 && (
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            Shared {shareCount} time{shareCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Main Share Button */}
      <div className="text-center mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          <FaShare className="mr-2 group-hover:animate-bounce" />
          {isOpen ? 'Hide Options' : 'Share This Post'}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Share Options */}
      {isOpen && (
        <div className="space-y-4 animate-fade-in">
          {/* Copy Link Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={blogUrl}
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <FaCheck className="animate-bounce" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {shareLinks.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare(platform)}
                className={`${platform.color} text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 group`}
              >
                <div className="text-center">
                  <platform.icon className="mx-auto text-2xl mb-2 group-hover:animate-bounce" />
                  <div className="text-xs font-medium">{platform.name}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Quick Share Stats */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Sharing Impact
              </h4>
              <div className="flex justify-center items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <FaShare className="text-indigo-500" />
                  <span>Easy sharing</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaHeart className="text-red-500" />
                  <span>Support author</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="text-green-500" />
                  <span>Help others learn</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Found this helpful? Share it with your network! 🚀
          </div>
        </div>
      )}

      {/* Floating notification for successful share */}
      {copied && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-down z-50">
          <div className="flex items-center gap-2">
            <FaCheck className="animate-bounce" />
            Link copied to clipboard!
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBlogShare;
