import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiMessageCircle, FiSend, FiUser, FiTrash2 } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

const EnhancedComments = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const user = useSelector((state) => state.user);
  const isAdmin = user?.email === "ayanahmad7052@gmail.com";

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

  const deleteComment = async (commentId) => {
    setDeleteLoading(commentId);
    try {
      console.log(`Deleting comment ${commentId} for blog ${blogId}`);

      const response = await fetch(`/api/comments/${blogId}/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: true, adminEmail: user.email })
      });

      const result = await response.json();
      console.log('Delete response:', result);

      if (response.ok) {
        // Remove the comment and its replies from local state
        setComments(prevComments =>
          prevComments.filter(comment =>
            comment.id !== commentId && comment.parentId !== commentId
          )
        );
        setShowDeleteConfirm(null);
        console.log(`Successfully deleted comment ${commentId}`);
      } else {
        console.error('Delete failed:', result);
        alert(`Failed to delete comment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An error occurred while deleting the comment. Please try again.');
    }
    setDeleteLoading(null);
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

  const DeleteButton = ({ commentId }) => {
    if (!isAdmin) return null;

    return (
      <div className="relative">
        <button
          onClick={() => setShowDeleteConfirm(showDeleteConfirm === commentId ? null : commentId)}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
          title="Delete comment (Admin only)"
        >
          <FaCrown className="w-3 h-3" />
          <FiTrash2 className="w-3 h-3" />
        </button>

        {showDeleteConfirm === commentId && (
          <div className="absolute top-8 right-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64">
            <div className="flex items-center space-x-2 mb-3">
              <FiTrash2 className="w-4 h-4 text-red-500" />
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Delete Comment</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => deleteComment(commentId)}
                disabled={deleteLoading === commentId}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm transition-colors"
              >
                {deleteLoading === commentId ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const replies = comments.filter(c => c.parentId === comment.id);

    return (
      <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative">
          {isAdmin && (
            <div className="absolute top-2 right-2">
              <DeleteButton commentId={comment.id} />
            </div>
          )}

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 pr-8">
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
        {isAdmin && (
          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            <FaCrown className="w-3 h-3" />
            <span>Admin Mode</span>
          </div>
        )}
      </div>

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
