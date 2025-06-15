import { useState, useEffect } from 'react';
import { FiMessageCircle, FiSend, FiUser } from 'react-icons/fi';

const EnhancedComments = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${blogId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${blogId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newComment,
          parentId: replyTo
        })
      });

      if (response.ok) {
        setNewComment({ name: '', email: '', message: '' });
        setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
    setLoading(false);
  };

  const handleReaction = async (commentId, reaction) => {
    const userId = localStorage.getItem('userId') || Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);

    try {
      const response = await fetch(`/api/comments/${blogId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, reaction, userId })
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const ReactionButton = ({ comment, reaction, emoji }) => {
    const userId = localStorage.getItem('userId') || '';
    const isActive = comment.userReactions?.[userId] === reaction;
    const count = comment.reactions?.[reaction] || 0;

    return (
      <button
        onClick={() => handleReaction(comment.id, reaction)}
        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
          isActive 
            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <span>{emoji}</span>
        {count > 0 && <span>{count}</span>}
      </button>
    );
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const replies = comments.filter(c => c.parentId === comment.id);
    
    return (
      <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  {comment.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {comment.message}
              </p>
              
              {/* Reactions */}
              <div className="flex items-center space-x-2 mb-2">
                <ReactionButton comment={comment} reaction="like" emoji="👍" />
                <ReactionButton comment={comment} reaction="love" emoji="❤️" />
                <ReactionButton comment={comment} reaction="celebrate" emoji="🎉" />
                
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-4"
                >
                  Reply
                </button>
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <form onSubmit={submitComment} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={newComment.name}
                      onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800"
                      required
                    />
                    <textarea
                      placeholder="Write a reply..."
                      value={newComment.message}
                      onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800"
                      rows={3}
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <FiSend className="w-4 h-4" />
                        <span>{loading ? 'Sending...' : 'Reply'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.map(reply => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  const topLevelComments = comments.filter(comment => !comment.parentId);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FiMessageCircle className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {!replyTo && (
        <form onSubmit={submitComment} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Leave a Comment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Your name *"
              value={newComment.name}
              onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="email"
              placeholder="Your email (optional)"
              value={newComment.email}
              onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
            />
          </div>
          <textarea
            placeholder="Write your comment... *"
            value={newComment.message}
            onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
          >
            <FiSend className="w-4 h-4" />
            <span>{loading ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {topLevelComments.length > 0 ? (
          topLevelComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FiMessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedComments;
