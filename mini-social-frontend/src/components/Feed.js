import React, { useEffect, useState } from 'react';
import API from '../api';
import PostCard from './PostCard';
import { useNavigate } from 'react-router-dom';
import PostModal from './PostModal';

const Feed = () => {
  const [posts, setPosts] = useState([]);

  // to show message when backend takes time
  const [serverWaking, setServerWaking] = useState(false);

  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      //  Show loading screen before fetching
      setServerWaking(true);

      const res = await API.get('/posts/feed');
      setPosts(res.data);
    } catch (err) {
      console.log('Server may be waking up...');
    } finally {
      // (3) Hide loading after API finishes 
      setServerWaking(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div>
      {/* 🔹 (4) Loader Section Added */}
      {serverWaking && (
        <div className="server-waking">
          <div className="spinner"></div>
          <p>Server is waking up... please wait a few seconds ☕</p>
        </div>
      )}

      <div className="navbar">
        <div className="navbar-brand">
          <div className="app-logo">M</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div className="nav-title">Feed</div>
          <div className="nav-subtitle">Public feed — all posts visible</div>
        </div>

        <div className="navbar-actions">
          <div className="user-info">
            <div className="user-avatar">{localStorage.getItem('username')?.[0].toUpperCase()}</div>
            <span className="username-display">{localStorage.getItem('username')}</span>
          </div>
          <button className="nav-button create-button" onClick={() => navigate('/create')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create Post
          </button>
          <button 
            className="nav-button logout-button" 
            onClick={() => { 
              localStorage.removeItem('token'); 
              localStorage.removeItem('username'); 
              navigate('/login'); 
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="feed-container">
        {posts.length === 0 && <p className="empty-state">No posts yet. Create the first post!</p>}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} refreshFeed={fetchPosts} onOpen={(p) => setSelectedPost(p)} />
        ))}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          refreshFeed={fetchPosts}
        />
      )}
    </div>
  );
};

export default Feed;
