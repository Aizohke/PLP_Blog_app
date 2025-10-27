const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  searchPosts,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { validatePost, checkValidation } = require('../middleware/validation');
const upload = require('../middleware/upload');

router.get('/search', searchPosts);
router.get('/', getAllPosts);
router.get('/:id', getPost);
router.post(
  '/',
  protect,
  upload.single('featuredImage'),
  validatePost,
  checkValidation,
  createPost
);
router.put(
  '/:id',
  protect,
  upload.single('featuredImage'),
  validatePost,
  checkValidation,
  updatePost
);
router.delete('/:id', protect, deletePost);
router.post('/:id/comments', protect, addComment);

module.exports = router;