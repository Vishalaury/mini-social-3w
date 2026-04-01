const mongoose = require('mongoose');
const Users = require('../models/User');
const SocialPost = require('../models/SocialPost');
const { getNextPostID, getIstTime, DeleteLocalFile } = require('../utils/helper');
const { uploadSocialPostImage, uploadSocialPostVideo } = require('../utils/cloudinary');

// Minimal placeholder implementations so the server can start while full
// controller logic is being implemented. Each handler returns 501 Not
// Implemented. Replace these with your real implementations.

const notImplemented = (req, res) => res.status(501).json({ message: 'Not implemented' });

// Minimal createSocialPost and getSocialPosts implementations so frontend
// can create and read posts while full logic is added later.
const createSocialPost = async (req, res) => {
	try {
		const text = req.body.text || "";

		// files come from multer upload.array('media')
		const files = req.files || [];

		const base = req.protocol + '://' + req.get('host');
		const media = files.map((f) => {
			// make URL accessible from frontend
			const url = f.path.replace(/\\/g, '/');
			return { url: `${base}/${url}`, public_id: f.filename, mediaType: f.mimetype };
		});

		const postID = `post_${Date.now()}`;

		const newPost = new SocialPost({
			postID,
			username: req.body.username || 'anonymous',
			fullname: req.body.fullname || 'Anonymous',
			postContent: { text, media },
			date: new Date().toLocaleDateString(),
			time: new Date().toLocaleTimeString(),
			like: { list: [], count: 0 },
			comment: { list: [], count: 0 }
		});

		if (mongoose.connection.readyState === 1) {
			const saved = await newPost.save();

			// Normalize response shape expected by frontend
			const mapComments = (list) => (list || []).map(c => ({ username: c.username, text: c.commentText || c.text || '' }));

			const resp = {
				_id: saved._id,
				user: { username: saved.username, fullname: saved.fullname },
				text: saved.postContent && saved.postContent.text ? saved.postContent.text : "",
				image: (saved.postContent && saved.postContent.media && saved.postContent.media[0] && saved.postContent.media[0].url) || null,
				likes: (saved.like && saved.like.list) || [],
				comments: mapComments(saved.comment && saved.comment.list),
				createdAt: saved.createdAt,
				postID: saved.postID
			};

			return res.status(201).json({ post: resp });
		}

		// If DB isn't connected, store posts in-memory so development can continue
		global.__INMEMORY_POSTS = global.__INMEMORY_POSTS || [];
		const saved = {
			_id: `post_${Date.now()}`,
			username: newPost.username,
			fullname: newPost.fullname,
			postContent: newPost.postContent,
			createdAt: new Date(),
			postID: newPost.postID,
			like: { list: [] },
			comment: { list: [] }
		};
		global.__INMEMORY_POSTS.unshift(saved);

		const mapComments = (list) => (list || []).map(c => ({ username: c.username, text: c.commentText || c.text || '' }));
		const resp = {
			_id: saved._id,
			user: { username: saved.username, fullname: saved.fullname },
			text: saved.postContent && saved.postContent.text ? saved.postContent.text : "",
			image: (saved.postContent && saved.postContent.media && saved.postContent.media[0] && saved.postContent.media[0].url) || null,
			likes: (saved.like && saved.like.list) || [],
			comments: mapComments(saved.comment && saved.comment.list),
			createdAt: saved.createdAt,
			postID: saved.postID
		};
		return res.status(201).json({ post: resp });
	} catch (err) {
		console.error('createSocialPost error:', err);
		return res.status(500).json({ message: 'Failed to create post' });
	}
};

const getSocialPosts = async (req, res) => {
	try {
		// If DB connected, fetch from DB; otherwise use in-memory posts
		if (mongoose.connection.readyState === 1) {
			const raw = await SocialPost.find({ isDelete: false }).sort({ createdAt: -1 }).limit(50).lean();
			const mapComments = (list) => (list || []).map(c => ({ username: c.username, text: c.commentText || c.text || '' }));
			const posts = raw.map((p) => ({
				_id: p._id,
				user: { username: p.username, fullname: p.fullname },
				text: (p.postContent && p.postContent.text) ? p.postContent.text : "",
				image: (p.postContent && p.postContent.media && p.postContent.media[0] && p.postContent.media[0].url) || null,
				likes: (p.like && p.like.list) || [],
				comments: mapComments(p.comment && p.comment.list),
				createdAt: p.createdAt,
				postID: p.postID
			}));
			return res.json({ posts });
		}

		// In-memory fallback
		global.__INMEMORY_POSTS = global.__INMEMORY_POSTS || [];
		const posts = global.__INMEMORY_POSTS.map((p) => ({
			_id: p._id,
			user: { username: p.username, fullname: p.fullname },
			text: (p.postContent && p.postContent.text) ? p.postContent.text : "",
			image: (p.postContent && p.postContent.media && p.postContent.media[0] && p.postContent.media[0].url) || null,
			likes: (p.like && p.like.list) || [],
			comments: (p.comment && p.comment.list) ? p.comment.list.map(c => ({ username: c.username, text: c.commentText || c.text || '' })) : [],
			createdAt: p.createdAt,
			postID: p.postID
		}));
		return res.json({ posts });
	} catch (err) {
		console.error('getSocialPosts error:', err);
		return res.status(500).json({ message: 'Failed to fetch posts' });
	}
};

// Toggle like for a post. Expects { username } in body (if not provided, 'anonymous' used)
const toggleLikePost = async (req, res) => {
	try {
		const id = req.params.postID;
		const username = req.body.username;
		
		if (!username) {
			return res.status(400).json({ message: 'Username is required' });
		}

		// Support both DB-backed and in-memory posts (development fallback)
		let post;
		if (mongoose.connection.readyState === 1) {
			// build query in a safe way to avoid casting invalid _id values
			const or = [{ postID: id }];
			if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });
			post = await SocialPost.findOne({ $or: or });
			if (!post) return res.status(404).json({ message: 'Post not found' });

			const existing = (post.like && post.like.list) ? post.like.list.findIndex(l => l.username === username) : -1;
			if (existing !== -1) {
				// remove like
				post.like.list.splice(existing, 1);
				post.like.count = Math.max(0, (post.like.count || 1) - 1);
			} else {
				post.like.list = post.like.list || [];
				post.like.list.push({ username, likedAt: new Date() });
				post.like.count = (post.like.count || 0) + 1;
			}

			await post.save();
		} else {
			// operate on in-memory posts
			global.__INMEMORY_POSTS = global.__INMEMORY_POSTS || [];
			post = global.__INMEMORY_POSTS.find(p => p._id === id || p.postID === id);
			if (!post) return res.status(404).json({ message: 'Post not found' });

			post.like = post.like || { list: [], count: 0 };
			const existingIdx = post.like.list.findIndex(l => l.username === username);
			if (existingIdx !== -1) {
				post.like.list.splice(existingIdx, 1);
				post.like.count = Math.max(0, (post.like.count || 1) - 1);
			} else {
				post.like.list.push({ username, likedAt: new Date() });
				post.like.count = (post.like.count || 0) + 1;
			}
			// keep newest posts first
			const idx = global.__INMEMORY_POSTS.findIndex(p => p._id === post._id);
			if (idx > -1) global.__INMEMORY_POSTS[idx] = post;
		}

		// return normalized post
			const resp = {
				_id: post._id,
				user: { 
					username: post.username, 
					fullname: post.fullname,
					profileImage: post.profileImage
				},
				text: (post.postContent && post.postContent.text) ? post.postContent.text : "",
				image: (post.postContent && post.postContent.media && post.postContent.media[0] && post.postContent.media[0].url) || null,
				likes: post.like.list.map(l => ({
					username: l.username,
					timestamp: l.likedAt
				})) || [],
				likesCount: post.like.count || 0,
				comments: (post.comment && post.comment.list) ? post.comment.list
					.filter(c => !c.isDelete)
					.map(c => ({ 
						username: c.username,
						fullname: c.fullname || c.username,
						text: c.commentText || c.text || '',
						timestamp: c.commentedAt,
						profileImage: c.profileImage
					})) : [],
				commentsCount: (post.comment && post.comment.count) || 0,
				createdAt: post.createdAt,
				postID: post.postID
			};

		return res.json({ post: resp });
	} catch (err) {
		console.error('toggleLikePost error:', err);
		return res.status(500).json({ message: 'Failed to toggle like' });
	}
};

// Add a comment to a post. Expects { username, text }
const addComment = async (req, res) => {
	try {
		const id = req.params.postID;
		const username = req.body.username;
		const text = req.body.text;

		if (!username) {
			return res.status(400).json({ message: 'Username is required' });
		}

		if (!text) {
			return res.status(400).json({ message: 'Comment text is required' });
		}

		let post;
		if (mongoose.connection.readyState === 1) {
			// safe query to avoid casting errors when id is not an ObjectId
			const or = [{ postID: id }];
			if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });
			post = await SocialPost.findOne({ $or: or });
			if (!post) return res.status(404).json({ message: 'Post not found' });

			post.comment.list = post.comment.list || [];
			const commentObj = {
				username,
				fullname: req.body.fullname || username,
				profileImage: req.body.profileImage || null,
				commentText: text,
				commentedAt: new Date(),
				isDelete: false
			};
			post.comment.list.push(commentObj);
			post.comment.count = (post.comment.count || 0) + 1;

			await post.save();
		} else {
				// in-memory fallback
				global.__INMEMORY_POSTS = global.__INMEMORY_POSTS || [];
				post = global.__INMEMORY_POSTS.find(p => p._id === id || p.postID === id);
				if (!post) return res.status(404).json({ message: 'Post not found' });

				post.comment = post.comment || { list: [], count: 0 };
				const commentObj = {
					username,
					fullname: req.body.fullname || username,
					profileImage: req.body.profileImage || null,
					commentText: text,
					commentedAt: new Date(),
					isDelete: false
				};
				post.comment.list.push(commentObj);
				post.comment.count = (post.comment.count || 0) + 1;
				const idx = global.__INMEMORY_POSTS.findIndex(p => p._id === post._id);
				if (idx > -1) global.__INMEMORY_POSTS[idx] = post;
			}

		const resp = {
			_id: post._id,
			user: { username: post.username, fullname: post.fullname },
			text: (post.postContent && post.postContent.text) ? post.postContent.text : "",
			image: (post.postContent && post.postContent.media && post.postContent.media[0] && post.postContent.media[0].url) || null,
			likes: post.like.list || [],
			comments: post.comment.list || [],
			createdAt: post.createdAt,
			postID: post.postID
		};

		return res.json({ post: resp });
	} catch (err) {
		console.error('addComment error:', err);
		return res.status(500).json({ message: 'Failed to add comment' });
	}
};

module.exports = {
	getSocialPosts,
	createSocialPost,
	toggleLikePost,
	addComment,
	togglePostDelete: notImplemented,
	updatePostStatus: notImplemented,
	deleteRestoreComment: notImplemented,
	togglePostPin: notImplemented,
	getMyPosts: notImplemented,
	getPostById: async (req, res) => {
		try {
			const id = req.params.postId;
			let post;
			
			if (mongoose.connection.readyState === 1) {
				const or = [{ postID: id }];
				if (mongoose.Types.ObjectId.isValid(id)) or.push({ _id: id });
				post = await SocialPost.findOne({ $or: or });
			} else {
				// In-memory fallback
				global.__INMEMORY_POSTS = global.__INMEMORY_POSTS || [];
				post = global.__INMEMORY_POSTS.find(p => p._id === id || p.postID === id);
			}
			
			if (!post) {
				return res.status(404).json({ message: 'Post not found' });
			}

			const resp = {
				_id: post._id,
				user: { username: post.username, fullname: post.fullname },
				text: (post.postContent && post.postContent.text) ? post.postContent.text : "",
				image: (post.postContent && post.postContent.media && post.postContent.media[0] && post.postContent.media[0].url) || null,
				likes: (post.like && post.like.list) || [],
				comments: (post.comment && post.comment.list) ? post.comment.list.map(c => ({ 
					username: c.username, 
					text: c.commentText || c.text || '',
					createdAt: c.commentedAt 
				})) : [],
				createdAt: post.createdAt,
				postID: post.postID
			};

			return res.json({ post: resp });
		} catch (err) {
			console.error('getPostById error:', err);
			return res.status(500).json({ message: 'Failed to fetch post' });
		}
	},
};
