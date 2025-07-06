import { VscInfo } from "react-icons/vsc";
import { HiOutlineEmojiHappy } from "react-icons/hi";

function Alert({ show, type, message }) {
  // Check if it's an admin message
  const isAdminMessage = message.includes("Admin") || message.includes("👑");

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className={`${
          type === "success"
            ? "bg-purple-500 dark:bg-purple-600 text-white border-purple-700"
            : type === "error"
            ? "bg-red-500 text-white border-red-700"
            : "bg-gray-500 text-white border-gray-700"
        } px-6 py-4 rounded-lg shadow-lg border-l-4 max-w-sm`}
      >
        <div className="flex items-center">
          <span className="text-2xl mr-3">
            {isAdminMessage
              ? "👑"
              : type === "success"
              ? "✅"
              : type === "error"
              ? "❌"
              : "ℹ️"}
          </span>
          <div>
            <p className="font-semibold text-sm">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alert;
