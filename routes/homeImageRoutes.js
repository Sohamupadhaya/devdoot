const express = require('express');
const router = express.Router();
const homeImageController = require('../controllers/homeImageController');
const { authenticateJWT } = require('../config/middleware');

router.get('/kundalis/',authenticateJWT,homeImageController.homeImages);
router.get('/kundali-by-id/:id',authenticateJWT,homeImageController.homeImageById);

module.exports = router;
