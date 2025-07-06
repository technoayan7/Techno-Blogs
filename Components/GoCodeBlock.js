// GoCodeBlock.js - Specialized component for Go code examples
import { useState } from "react";
import { FaCopy, FaCheck, FaPlay, FaDownload } from "react-icons/fa";
import { goPlaygroundUtils } from '../utils/goPlaygroundUtils';

const GoCodeBlock = ({
  code,
  filename,
  runnable = false,
  downloadable = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [playgroundUrl, setPlaygroundUrl] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if code is long enough to need expand/collapse
  const isLongCode = code?.split("\n").length > 15;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "example.go";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runInPlayground = async () => {
    setIsSharing(true);
    try {
      // Make code playground-ready
      const playgroundCode = goPlaygroundUtils.makePlaygroundReady(code);

      // Validate code
      const validation = goPlaygroundUtils.validatePlaygroundCode(playgroundCode);
      if (!validation.isValid) {
        console.warn('Playground validation issues:', validation.issues);
        // Show validation issues to user (optional)
        validation.issues.forEach(issue => {
          console.warn('⚠️', issue);
        });
      }

      console.log('Sending code to playground:', playgroundCode); // Debug log

      // Try the enhanced share and open method
      const shareUrl = await goPlaygroundUtils.shareAndOpen(playgroundCode);
      if (shareUrl) {
        setPlaygroundUrl(shareUrl);
        console.log('✅ Code shared successfully:', shareUrl);
      }
    } catch (error) {
      console.error('Failed to open Go Playground:', error);
      // Final fallback - just open the playground homepage
      alert('Failed to open Go Playground. Opening playground homepage instead.');
      window.open('https://play.golang.org/', '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative group mb-8 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header with filename and actions */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🐹</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {filename || "main.go"}
          </span>
          {isLongCode && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({code.split('\n').length} lines)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Expand/Collapse button for long code */}
          {isLongCode && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              title={isExpanded ? "Collapse code" : "Expand code"}
            >
              <span>{isExpanded ? "📤" : "📥"}</span>
              <span>{isExpanded ? "Collapse" : "Expand"}</span>
            </button>
          )}

          {runnable && (
            <button
              onClick={runInPlayground}
              disabled={isSharing}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              title="Run in Go Playground"
            >
              <FaPlay className="w-3 h-3" />
              <span>{isSharing ? 'Opening...' : 'Run'}</span>
            </button>
          )}

          {/* Show playground URL if available */}
          {playgroundUrl && (
            <button
              onClick={() => window.open(playgroundUrl, '_blank')}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              title="Open saved playground"
            >
              <span>🔗</span>
              <span>Playground</span>
            </button>
          )}

          {downloadable && (
            <button
              onClick={downloadFile}
              className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              title="Download file"
            >
              <FaDownload className="w-3 h-3" />
              <span>Download</span>
            </button>
          )}

          <button
            onClick={copyToClipboard}
            className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md transition-colors ${
              copied
                ? "bg-green-600 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            {copied ? (
              <FaCheck className="w-3 h-3" />
            ) : (
              <FaCopy className="w-3 h-3" />
            )}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code content with conditional height */}
      <div className="relative">
        <pre
          className={`bg-gray-900 dark:bg-gray-950 p-4 overflow-x-auto text-sm transition-all duration-500 ${
            isLongCode && !isExpanded
              ? "max-h-80 overflow-y-hidden"
              : ""
          }`}
        >
          <code className="language-go">{code}</code>
        </pre>

        {/* Fade overlay for collapsed long code */}
        {isLongCode && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 dark:from-gray-950 to-transparent pointer-events-none"></div>
        )}

        {/* Show more lines button at bottom */}
        {isLongCode && !isExpanded && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-all duration-300 shadow-lg border border-gray-600"
            >
              <span>Show {code.split('\n').length - 15} more lines</span>
              <span className="text-xs">⬇️</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// GoConceptCard.js - Visual cards for Go concepts
const GoConceptCard = ({
  title,
  description,
  icon,
  example,
  difficulty = "beginner",
}) => {
  const difficultyColors = {
    beginner: "from-green-400 to-green-600",
    intermediate: "from-yellow-400 to-yellow-600",
    advanced: "from-red-400 to-red-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{icon}</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${difficultyColors[difficulty]}`}
        >
          {difficulty}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>

      {example && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-sm">
          <code className="text-gray-800 dark:text-gray-200">{example}</code>
        </div>
      )}
    </div>
  );
};

// Interactive Go playground component
const GoPlayground = ({ initialCode, title }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    try {
      // This would connect to a Go playground API
      // For demo purposes, we'll simulate execution
      setOutput("Program executed successfully!\nHello, World!");
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">🎮</span>
          {title || "Go Playground"}
        </h3>
        <button
          onClick={runCode}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <FaPlay className="w-4 h-4" />
          <span>{loading ? "Running..." : "Run Code"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Code:
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output:
          </label>
          <div className="w-full h-64 p-3 font-mono text-sm bg-gray-900 text-green-400 border border-gray-300 dark:border-gray-600 rounded-lg overflow-auto">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
                <span>Executing...</span>
              </div>
            ) : (
              <pre>{output || 'Click "Run Code" to see output...'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Progress tracker for learning Go
const GoLearningProgress = ({ topics }) => {
  const [completedTopics, setCompletedTopics] = useState(new Set());

  const toggleTopic = (topicId) => {
    const newCompleted = new Set(completedTopics);
    if (newCompleted.has(topicId)) {
      newCompleted.delete(topicId);
    } else {
      newCompleted.add(topicId);
    }
    setCompletedTopics(newCompleted);
  };

  const progress = (completedTopics.size / topics.length) * 100;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Learning Progress
      </h3>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Topics checklist */}
      <div className="space-y-2">
        {topics.map((topic, index) => (
          <label
            key={index}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={completedTopics.has(index)}
              onChange={() => toggleTopic(index)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span
              className={`${
                completedTopics.has(index)
                  ? "line-through text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {topic}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Export default and named exports
export default GoCodeBlock;
export { GoCodeBlock, GoConceptCard, GoPlayground, GoLearningProgress };
