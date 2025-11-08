import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let postImage = '';
      if (image) {
        // Convert image to base64 for sending to backend
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(image);
        });
        postImage = base64;
      }

      await API.post('/posts/create', { 
        username, 
        fullname: username, 
        postText: text, 
        postImage 
      });
      navigate('/feed');
    } catch (err) {
      alert('Failed to create post');
    }
  };

  return (
    <div className="app-bg">
      <div className="navbar">
        <div className="navbar-brand">
          <div className="app-logo">M</div>
        </div>
        <div className="navbar-actions">
          <button className="nav-button" onClick={() => navigate('/feed')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Feed
          </button>
        </div>
      </div>

      <div className="create-post-container">
        <div className="post-editor">
          <div className="editor-header">
            <div className="user-avatar">{username?.[0].toUpperCase()}</div>
            <span className="username-display">{username}</span>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="editor-main">
              <textarea 
                className="post-textarea" 
                placeholder="Share your thoughts... What's happening?"
                value={text} 
                onChange={(e) => setText(e.target.value)}
                required 
              />
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button type="button" className="remove-image" onClick={removeImage}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="editor-toolbar">
                <div className="editor-tools">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button" 
                    className="tool-button" 
                    title="Add Image"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button type="button" className="tool-button" title="Add Emoji">
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <span className="toolbar-divider"></span>
                  <div className="char-count">{text.length} / 500</div>
                </div>
              </div>
            </div>

            <div className="editor-actions">
              <button type="button" className="cancel-button" onClick={() => navigate('/feed')}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="publish-button"
                disabled={!text.trim() || text.length > 500}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18l9-2zm0 0v-8"></path>
                </svg>
                Publish Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
