import { useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import useAuthStore from '../../context/authStore';
import { Avatar } from '../ui';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CommentSection({ issueId, comments, setComments }) {
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/comments/issue/${issueId}`, { content: newComment });
      setComments(prev => [...prev, data.comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const { data } = await api.put(`/comments/${commentId}`, { content: editContent });
      setComments(prev => prev.map(c => c._id === commentId ? data.comment : c));
      setEditingId(null);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        Comments <span className="text-gray-400 font-normal text-sm">({comments.length})</span>
      </h3>

      {/* Comments list */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            No comments yet. Be the first to comment.
          </div>
        )}
        {comments.map(comment => {
          const isAuthor = user?._id === comment.author?._id;
          const isAdmin = user?.role === 'admin';

          return (
            <div key={comment._id} className="flex gap-3 group">
              <Avatar user={comment.author} size="md" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{comment.author?.name}</span>
                      <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                      {comment.isEdited && <span className="text-xs text-gray-400 italic">(edited)</span>}
                    </div>
                    {(isAuthor || isAdmin) && editingId !== comment._id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(comment._id); setEditContent(comment.content); }}
                          className="p-1 rounded text-gray-400 hover:text-brand-600 hover:bg-white"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="input text-sm min-h-[80px] resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment._id)}
                          className="btn-primary py-1 px-3 text-xs"
                        >
                          <CheckIcon className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary py-1 px-3 text-xs"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar user={user} size="md" />
        <div className="flex-1 space-y-2">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input resize-none min-h-[80px] text-sm"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) handleSubmit(e);
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Ctrl+Enter to submit</span>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="btn-primary py-1.5 px-4 text-sm"
            >
              {submitting ? 'Posting...' : 'Add Comment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
