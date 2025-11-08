const SocialPost = require('../models/SocialPost');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  const { username, fullname, postText, postImage } = req.body;
  try {
    const newPost = new SocialPost({ username, fullname, postText, postImage });
    await newPost.save();
    res.status(201).json({ message: 'Post created', post: newPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await SocialPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.likePost = async (req, res) => {
  const { postId, username } = req.body;
  try {
    const post = await SocialPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!post.like.users.includes(username)) {
      post.like.users.push(username);
      post.like.count++;
      await post.save();
    }
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

exports.commentPost = async (req, res) => {
  const { postId, username, text } = req.body;
  try {
    const post = await SocialPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comment.push({ username, text });
    await post.save();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to comment post' });
  }
};
