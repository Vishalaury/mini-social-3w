const express = require('express');
const router = express.Router();
const postController = require('../controllers/postControllers');

router.post('/create', postController.createPost);
router.get('/feed', postController.getFeed);
router.post('/like', postController.likePost);
router.post('/comment', postController.commentPost);

module.exports = router;
