import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import { 
  FaRobot, 
  FaTimes, 
  FaPaperPlane, 
  FaUser,
  FaSpinner,
  FaCode,
  FaLightbulb,
  FaQuestionCircle,
  FaCopy,
  FaCheck,
  FaExpand,
  FaCompress,
  FaMinus,
  FaGripVertical
} from "react-icons/fa";

// React Error Boundary Component
class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Markdown Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">⚠️ Content Display Error</p>
          <p>{this.props.fallbackContent || 'Unable to display this message properly.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "👋 **Hi! I'm your AI assistant.** \n\nI can help you with:\n- Programming questions\n- Technical concepts\n- Code examples\n- Blog writing tips\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const dragRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const modifiedUserMessage = {
        role: "user",
        content: `${inputMessage}\n\nPlease answer in short, concise, and easy to grasp content.`
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })), modifiedUserMessage]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const responseContent = data.message || "No response received";
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { icon: FaCode, text: "Explain JavaScript closures", query: "Can you explain JavaScript closures with a practical example?" },
    { icon: FaLightbulb, text: "React best practices", query: "What are the top 5 React best practices with code examples?" },
    { icon: FaQuestionCircle, text: "CSS Grid vs Flexbox", query: "When should I use CSS Grid vs Flexbox? Show me examples." }
  ];

  const handleQuickQuestion = (query) => {
    setInputMessage(query);
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setSize({ width: 400, height: 600 });
      setPosition({ x: 0, y: 0 });
    } else {
      setSize({ 
        width: window.innerWidth - 40, 
        height: window.innerHeight - 80 
      });
      setPosition({ x: 20, y: 20 });
    }
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleResize = (event, { size: newSize }) => {
    setSize(newSize);
  };

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setSize({ width: 400, height: 600 });
    setIsMaximized(false);
  };

  // Enhanced content sanitization
  const sanitizeMarkdownContent = (content) => {
    if (!content || typeof content !== 'string') return '';
    
    let sanitized = content;
    
    try {
      // Remove problematic markdown patterns that cause inTable errors
      sanitized = sanitized
        // Fix broken table syntax
        .replace(/\|(?![^\n]*\|)/g, '\\|')
        // Remove incomplete table rows
        .replace(/^\|[^|\n]*$/gm, '')
        // Fix nested emphasis in tables
        .replace(/(\|[^|\n]*)\*\*([^*]*)\*\*([^|\n]*\|)/g, '$1**$2**$3')
        // Clean up multiple newlines
        .replace(/\n{4,}/g, '\n\n\n')
        // Fix code blocks in tables
        .replace(/(\|[^|\n]*)`([^`]*)`([^|\n]*\|)/g, '$1`$2`$3')
        // Remove malformed list items in tables
        .replace(/(\|[^|\n]*)-\s*([^|\n]*\|)/g, '$1• $2');
        
      return sanitized;
    } catch (error) {
      console.error('Content sanitization error:', error);
      return String(content);
    }
  };

  const SafeMarkdownRenderer = ({ content, messageId }) => {
    const [renderFallback, setRenderFallback] = useState(false);
    const sanitizedContent = sanitizeMarkdownContent(content);

    // Enhanced fallback renderer with basic markdown support
    const FallbackRenderer = () => {
      const renderBasicMarkdown = (text) => {
        if (!text) return '';
        
        // Split by lines for processing
        const lines = text.split('\n');
        const processedLines = lines.map((line, index) => {
          // Handle headers
          if (line.startsWith('###')) {
            return (
              <h3 key={index} className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-3">
                <span className="text-purple-600 dark:text-purple-400 mr-2">###</span>
                {line.replace(/^###\s*/, '')}
              </h3>
            );
          }
          if (line.startsWith('##')) {
            return (
              <h2 key={index} className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2">##</span>
                {line.replace(/^##\s*/, '')}
              </h2>
            );
          }
          if (line.startsWith('#')) {
            return (
              <h1 key={index} className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-4 pb-2 border-b border-gray-300 dark:border-gray-600">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {line.replace(/^#\s*/, '')}
                </span>
              </h1>
            );
          }
          
          // Handle list items
          if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            const content = line.replace(/^\s*[\*\-]\s*/, '');
            return (
              <div key={index} className="flex items-start mb-1">
                <span className="text-indigo-500 mr-2 mt-1">•</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{processInlineMarkdown(content)}</span>
              </div>
            );
          }
          
          // Handle empty lines
          if (line.trim() === '') {
            return <div key={index} className="h-2"></div>;
          }
          
          // Handle regular paragraphs
          return (
            <p key={index} className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
              {processInlineMarkdown(line)}
            </p>
          );
        });
        
        return processedLines;
      };
      
      // Process inline markdown (bold, italic, code)
      const processInlineMarkdown = (text) => {
        if (!text) return '';
        
        // Handle bold text
        text = text.replace(/\*\*(.*?)\*\*/g, (match, content) => {
          return `<strong class="font-semibold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">${content}</strong>`;
        });
        
        // Handle italic text
        text = text.replace(/\*(.*?)\*/g, (match, content) => {
          return `<em class="italic text-indigo-600 dark:text-indigo-400 font-medium">${content}</em>`;
        });
        
        // Handle inline code
        text = text.replace(/`(.*?)`/g, (match, content) => {
          return `<code class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-md text-xs font-mono border border-purple-200 dark:border-purple-700">${content}</code>`;
        });
        
        return <span dangerouslySetInnerHTML={{ __html: text }} />;
      };

      return (
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {renderBasicMarkdown(sanitizedContent)}
        </div>
      );
    };

    // Try ReactMarkdown first, fallback to basic renderer if it fails
    if (renderFallback) {
      return <FallbackRenderer />;
    }

    return (
      <MarkdownErrorBoundary fallbackContent={sanitizedContent}>
        <div 
          onError={() => setRenderFallback(true)}
          className="markdown-container"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            className="markdown-content"
            skipHtml={true}
            onError={(error) => {
              console.error('ReactMarkdown error:', error);
              setRenderFallback(true);
            }}
            components={{
              // Enhanced code component with syntax highlighting
              code: ({ inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                
                if (inline) {
                  return (
                    <code className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-md text-xs font-mono border border-purple-200 dark:border-purple-700">
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative my-4 rounded-lg overflow-hidden shadow-lg">
                    {/* Language label */}
                    {language && (
                      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 text-xs text-gray-300 font-medium border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            {language.toUpperCase()}
                          </span>
                          <button
                            onClick={() => copyToClipboard(String(children), `code-${messageId}`)}
                            className="text-gray-400 hover:text-white transition-colors text-xs flex items-center"
                            title="Copy code"
                          >
                            {copiedMessageId === `code-${messageId}` ? (
                              <>
                                <FaCheck className="mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <FaCopy className="mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Code content with enhanced styling */}
                    <pre className={`
                      bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 
                      text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed
                      ${!language ? 'rounded-lg' : 'rounded-b-lg'}
                    `}>
                      <code 
                        className={className} 
                        {...props}
                        style={{
                          fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, monospace',
                          fontSize: '13px',
                          lineHeight: '1.5'
                        }}
                      >
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },

              // Enhanced headings with better styling
              h1: ({ children }) => (
                <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-4 pb-2 border-b-2 border-gradient-to-r from-indigo-500 to-purple-500">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {children}
                  </span>
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2 mt-4">
                  <span className="text-indigo-600 dark:text-indigo-400 mr-2">#</span>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 mt-3">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">##</span>
                  {children}
                </h3>
              ),

              // Enhanced paragraph styling
              p: ({ children }) => (
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {children}
                </p>
              ),

              // Enhanced list styling
              ul: ({ children }) => (
                <ul className="list-none text-sm text-gray-700 dark:text-gray-300 mb-3 ml-2 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 mb-3 ml-2 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 mt-1">•</span>
                  <span>{children}</span>
                </li>
              ),

              // Enhanced emphasis styling
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-indigo-600 dark:text-indigo-400 font-medium">
                  {children}
                </em>
              ),

              // Enhanced blockquote styling
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 pl-4 py-2 my-3 rounded-r-lg">
                  <div className="text-indigo-800 dark:text-indigo-200 italic text-sm">
                    {children}
                  </div>
                </blockquote>
              ),

              // Enhanced link styling
              a: ({ children, href }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline decoration-2 underline-offset-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-1 rounded transition-all"
                >
                  {children}
                </a>
              ),

              // Skip tables entirely to avoid inTable errors
              table: () => (
                <div className="text-sm text-gray-500 italic my-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">📊</span>
                    Table content (simplified for compatibility)
                  </div>
                </div>
              ),

              // Skip other problematic elements
              th: ({ children }) => <span className="font-semibold">{children}</span>,
              td: ({ children }) => <span>{children}</span>,
              tr: ({ children }) => <div className="border-b border-gray-200 dark:border-gray-700 py-1">{children}</div>,
              thead: ({ children }) => <div className="font-semibold">{children}</div>,
              tbody: ({ children }) => <div>{children}</div>,
            }}
          >
            {sanitizedContent}
          </ReactMarkdown>
        </div>
      </MarkdownErrorBoundary>
    );
  };

  const SafeMarkdownMessage = ({ content, messageId }) => {
    return (
      <div className="relative group">
        <SafeMarkdownRenderer content={content} messageId={messageId} />
        
        <button
          onClick={() => copyToClipboard(content, messageId)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 p-1 rounded"
          title="Copy message"
        >
          {copiedMessageId === messageId ? (
            <FaCheck className="text-green-600 text-xs" />
          ) : (
            <FaCopy className="text-gray-600 dark:text-gray-300 text-xs" />
          )}
        </button>
      </div>
    );
  };

  const MarkdownMessage = SafeMarkdownMessage;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
        }`}
      >
        {isOpen ? (
          <FaTimes className="text-white text-xl mx-auto" />
        ) : (
          <FaRobot className="text-white text-xl mx-auto animate-bounce" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Draggable
          nodeRef={dragRef}
          handle=".drag-handle"
          position={position}
          onDrag={handleDrag}
          bounds="parent"
          disabled={isMaximized}
        >
          <div ref={dragRef} className="fixed z-50" style={{ 
            right: isMaximized ? 0 : '24px', 
            bottom: isMaximized ? 0 : '100px',
            left: isMaximized ? 0 : 'auto',
            top: isMaximized ? 0 : 'auto'
          }}>
            <Resizable
              width={size.width}
              height={size.height}
              onResize={handleResize}
              minConstraints={[320, 400]}
              maxConstraints={[window.innerWidth - 40, window.innerHeight - 80]}
              resizeHandles={['se', 'e', 's']}
              handleStyle={{
                se: {
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '0 0 12px 0',
                  right: '0px',
                  bottom: '0px',
                  cursor: 'se-resize'
                },
                e: {
                  background: '#6366f1',
                  width: '8px',
                  right: '0px',
                  top: '20px',
                  bottom: '20px',
                  cursor: 'e-resize',
                  borderRadius: '0 4px 4px 0'
                },
                s: {
                  background: '#6366f1',
                  height: '8px',
                  bottom: '0px',
                  left: '20px',
                  right: '20px',
                  cursor: 's-resize',
                  borderRadius: '0 0 4px 4px'
                }
              }}
              disabled={isMaximized}
            >
              <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-fade-in overflow-hidden"
                style={{ 
                  width: size.width, 
                  height: isMinimized ? '60px' : size.height,
                  transition: 'height 0.3s ease-in-out'
                }}
              >
                {/* Header with drag handle */}
                <div className="drag-handle bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl cursor-move select-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <FaRobot className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-xs opacity-90">
                          {isTyping ? "Typing..." : "Online"}
                        </p>
                      </div>
                      <FaGripVertical className="text-white/60 ml-2" />
                    </div>
                    
                    {/* Window Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleMinimize}
                        className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                        title="Minimize"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <button
                        onClick={toggleMaximize}
                        className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                        title={isMaximized ? "Restore" : "Maximize"}
                      >
                        {isMaximized ? <FaCompress className="text-xs" /> : <FaExpand className="text-xs" />}
                      </button>
                      <button
                        onClick={resetPosition}
                        className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded text-xs"
                        title="Reset Position"
                      >
                        ⌂
                      </button>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                        title="Close"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content - Hidden when minimized */}
                {!isMinimized && (
                  <>
                    {/* Messages */}
                    <div 
                      className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll"
                      style={{ maxHeight: size.height - 180 }}
                    >
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl ${
                              message.role === "user"
                                ? "bg-indigo-600 text-white p-3"
                                : "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-4 border border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <div className="flex items-start space-x-2">
                                <FaRobot className="text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <MarkdownMessage content={message.content} messageId={message.id} />
                                  <p className="text-xs opacity-70 mt-2">
                                    {message.timestamp.toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start space-x-2">
                                <FaUser className="text-white mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <p className="text-xs opacity-70 mt-1">
                                    {message.timestamp.toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-2">
                              <FaRobot className="text-indigo-600 dark:text-indigo-400" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Thinking...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                      <div className="px-4 pb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick questions:</p>
                        <div className="space-y-2">
                          {quickQuestions.map((question, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickQuestion(question.query)}
                              className="w-full text-left p-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <question.icon className="text-indigo-600 dark:text-indigo-400" />
                              <span className="text-gray-700 dark:text-gray-300">{question.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-end space-x-2">
                        <div className="flex-1 relative">
                          <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            rows="1"
                            style={{ minHeight: "44px", maxHeight: "100px" }}
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                          >
                            <FaPaperPlane className="text-sm" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Resizable>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default ChatBot;
