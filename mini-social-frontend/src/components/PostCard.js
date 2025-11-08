import React, { useState } from 'react';
import API from '../api';

const avatarFor = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
};

const formatDate = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch (e) { return ''; }
};

const PostCard = ({ post, refreshFeed, onOpen }) => {
  const username = localStorage.getItem('username');
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      await API.post('/posts/like', { postId: post._id, username });
      refreshFeed();
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const handleComment = async () => {
    if (!commentText) return;
    try {
      await API.post('/posts/comment', { postId: post._id, username, text: commentText });
      setCommentText('');
      refreshFeed();
    } catch (err) {
      alert('Failed to comment');
    }
  };

  const handleOpen = () => onOpen && onOpen(post);

  const handleKeyDown = (e) => {
    
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      className="post-card"
      role="button"
      tabIndex={0}
      aria-label={`Open post by ${post.fullname || post.username}`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="post-header">
        <div className="avatar">{avatarFor(post.fullname || post.username)}</div>
        <div className="post-meta">
          <div className="author">{post.fullname} <span className="username">@{post.username}</span></div>
          <div className="timestamp">{formatDate(post.createdAt)}</div>
        </div>
      </div>

      <div className="post-body">
        <p>{post.postText}</p>
        {post.postImage && (
          <div className="post-image">
            <img src={post.postImage} alt="Post content" />
          </div>
        )}
      </div>
      <div className="post-stats">
        <div className="stat"><span className="stat-icon">👍</span> <span className="stat-count">{post.like?.count || 0}</span></div>
        <div className="stat"><span className="stat-icon">💬</span> <span className="stat-count">{(post.comment || []).length}</span></div>
      </div>

      <div className="post-actions">
        <button aria-label="Like post" className="like-btn nav-button" onClick={(e) => { e.stopPropagation(); handleLike(); }}>Like</button>
        <button aria-label="Focus comment" className="comment-btn nav-button" onClick={(e) => { e.stopPropagation(); /* could focus comment input */ }}>Comment</button>
      </div>

      <div className="comment-area" onClick={(e) => e.stopPropagation()}>
        <input
          className="comment-input"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button className="comment-submit" onClick={handleComment}>Post</button>
      </div>

      <div className="comment-list">
        {(post.comment || []).map((c) => (
          <div key={c._id} className="comment-item"><strong>{c.username}</strong> <span className="comment-text">{c.text}</span></div>
        ))}
      </div>
    </div>
  );
};

export default PostCard;
