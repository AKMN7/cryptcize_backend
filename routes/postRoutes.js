const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protct all routed after this middleware
router.use(authController.protect);

router.get('/', postController.getAllPosts);
router.get('/userPosts', postController.getUserPosts);
router.post('/addPost', postController.addPost);
router.delete('/deletePost/:postId', postController.deletePost);
router.get('/coinPosts/:coinName', postController.getCoinPosts);
router.post('/addReact/:postId', postController.addReact)
router.get('/allReacts', postController.getAllUserReacts);

module.exports = router;