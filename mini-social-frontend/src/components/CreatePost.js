import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './CreatePost.css';

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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let postImage = '';
      if (image) {
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-bg">
      <div className="create-post-header">
        <h1>Create a new post</h1>
        <div className="user-info">
          <div className="avatar">{username?.[0].toUpperCase()}</div>
          <span className="username">@{username}</span>
        </div>
        {/* header actions removed as requested */}
      </div>

      <form onSubmit={handleSubmit} className="create-post-card">
        <div className="image-upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          {!imagePreview ? (
            <button 
              type="button" 
              className="upload-button" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Click to add an image</span>
            </button>
          ) : (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button type="button" className="remove-image" onClick={removeImage}>×</button>
            </div>
          )}
        </div>

        <div className="text-input-area">
          <textarea
            placeholder="Share your thoughts... What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="editor-actions">
          <button type="button" className="cancel-button" onClick={() => navigate('/feed')}>
            Back to Feed
          </button>
          <button 
            type="submit" 
            className="publish-button"
            disabled={!text.trim() || text.length > 500}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18l9-2zm0 0v-8"></path>
            </svg>
            Post
          </button>
        </div>
      </form>

      {/* Bottom navigation removed per user request */}
    </div>
  );
};

export default CreatePost;
