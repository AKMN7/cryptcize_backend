const express = require('express');
const mainController = require('../controllers/mainController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protct all routed after this middleware
router.use(authController.protect);

router.get('/dashboard', mainController.getDashBoard);
router.post('/favourites', mainController.getFavs);
router.get('/coininfo/:coinID', mainController.getCoinInfo);
router.get('/getTopFavs', mainController.getTopFavs);
router.get('/getUser/:userID', mainController.getUserData);

module.exports = router;