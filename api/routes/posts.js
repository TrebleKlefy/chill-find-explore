const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validatePost } = require('../middleware/validation');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  reportPost
} = require('../controllers/postController');

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/:id/comments', getComments);

// Protected routes
router.post('/', auth, validatePost, createPost);
router.put('/:id', auth, validatePost, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likePost);
router.delete('/:id/like', auth, unlikePost);
router.post('/:id/comment', auth, addComment);
router.post('/:id/report', auth, reportPost);

module.exports = router;