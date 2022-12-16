const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.singin);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protct all routed after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch('/updatePersonal', userController.updatePersonal);
router.get('/getLikes', userController.getLikes);
router.post('/addLike/:coinID', userController.addLike);
router.get('/removeLike/:coinID', userController.removeLike);

module.exports = router;