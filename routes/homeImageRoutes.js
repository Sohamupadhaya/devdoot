const express = require('express');
const router = express.Router();
const homeImageController = require('../controllers/homeImageController');
const { authenticateJWT } = require('../config/middleware');

router.get('/home-images/',authenticateJWT,homeImageController.homeImages);
router.get('/home-images-by-id/:id',authenticateJWT,homeImageController.homeImageById);

module.exports = router;
