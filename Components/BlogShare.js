import { FaTwitter } from "react-icons/fa";

function BlogShare({ data }) {
  const formattedUrl = `https://technoblogs.onrender.com/blogs/${String(
    data.Title.split(" ").join("-").toLowerCase()
  )}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${data.Title
    } by @technoayan7&url=${encodeURIComponent(formattedUrl)}&hashtags=${data.Tags.replace(
      /\s+/g,
      ","
    )}`;

  return (
    <div className="text-center pb-4">
      <button
        className="bg-indigo-500 px-3 py-1 font-semibold text-white inline-flex items-center space-x-2 rounded"
        onClick={() => window.open(tweetUrl, "_blank", "noopener,noreferrer")}
      >
        <FaTwitter />
        <span>Tweet</span>
      </button>
    </div>
  );
}

export default BlogShare;
