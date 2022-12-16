const express = require('express');
const topicContoller = require('../controllers/topicContoller');
const authController = require('../controllers/authController');

const router = express.Router();

// Protct all routed after this middleware
router.use(authController.protect);

router.post('/createTopic', topicContoller.createTopic);
router.post('/addComment/:topicId', topicContoller.addComment);
router.get('/getComments/:topicId', topicContoller.getAllComments);
router.post('/searchTopic', topicContoller.searchTopic);
router.get('/getTopTopics', topicContoller.getTopTopics);

module.exports = router;