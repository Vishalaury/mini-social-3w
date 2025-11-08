import React, { useEffect, useState } from 'react';
import API from '../api';

const PostModal = ({ post: initialPost, onClose, refreshFeed }) => {
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const username = localStorage.getItem('username');

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const refreshLocal = async () => {
    try {
      const res = await API.get('/posts/feed');
      const updated = res.data.find((p) => p._id === initialPost._id);
      if (updated) setPost(updated);
    } catch (err) {
      // ignore
    }
  };

  const handleLike = async () => {
    try {
      await API.post('/posts/like', { postId: post._id, username });
      await refreshLocal();
      if (refreshFeed) refreshFeed();
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await API.post('/posts/comment', { postId: post._id, username, text: commentText });
      setCommentText('');
      await refreshLocal();
      if (refreshFeed) refreshFeed();
    } catch (err) {
      alert('Failed to comment');
    }
  };

  if (!post) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="avatar">{(post.fullname || post.username || '?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>
          <div className="modal-meta">
            <div className="author">{post.fullname} <span className="username">@{post.username}</span></div>
            <div className="timestamp">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-text">{post.postText}</p>
          {post.postImage && (
            <div className="modal-image">
              <img src={post.postImage} alt="post" />
            </div>
          )}

          <div className="modal-actions">
            <button onClick={handleLike} className="nav-button create-button">Like <span className="count">{post.like?.count || 0}</span></button>
          </div>

          <div className="modal-comments">
            <h4>Comments</h4>
            {(post.comment || []).map(c => (
              <div key={c._id} className="comment-item"><strong>{c.username}</strong> <span className="comment-text">{c.text}</span></div>
            ))}

            <div className="comment-input-row">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." />
              <button onClick={handleComment} className="publish-button" disabled={!commentText.trim()}>Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
