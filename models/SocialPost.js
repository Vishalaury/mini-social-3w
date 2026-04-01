const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  postID: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  fullname: { type: String },
  postLink: { type: String },
  profileImage: { type: String },
  postContent: {
    text: { type: String },
    media: [
      {
        url: String,
        public_id: String,
        mediaType: String
      }
    ]
  },
  like: {
    count: { type: Number, default: 0 },
    list: [{ username: String, likedAt: Date }]
  },
  comment: {
    count: { type: Number, default: 0 },
    list: [
      {
        username: String,
        fullname: String,
        profileImage: String,
        commentText: String,
        commentedAt: Date,
        isDelete: { type: Boolean, default: false }
      }
    ]
  },
  status: { type: String, default: 'pending' },
  isDelete: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  date: String,
  time: String
}, { timestamps: true });

module.exports = mongoose.model('SocialPost', socialPostSchema);
