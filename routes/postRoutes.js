const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const postController = require('../controllers/postControllers');

router.get('/', postController.getSocialPosts);
router.get('/:postId', postController.getPostById);
router.get('/my-posts', postController.getMyPosts);

router.post('/', upload.array('media'), postController.createSocialPost);
router.post('/:postID/like', postController.toggleLikePost);
router.post('/:postID/comment', postController.addComment);

router.patch('/:postID/status', postController.updatePostStatus);
router.patch('/:postID/delete', postController.togglePostDelete);
router.patch('/:postID/pin', postController.togglePostPin);
router.patch('/:postID/comment/delete', postController.deleteRestoreComment);

module.exports = router;
