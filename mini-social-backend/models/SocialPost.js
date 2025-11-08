const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fullname: { type: String, required: true },
  postText: { type: String },
  postImage: { type: String },
  like: {
    count: { type: Number, default: 0 },
    users: [String]
  },
  comment: [
    {
      username: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('SocialPost', socialPostSchema);
