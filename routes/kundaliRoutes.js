const express = require('express');
const router = express.Router();
const kundaliController = require('../controllers/kundaliController');
const { authenticateJWT } = require('../config/middleware');

router.post('/create-kundali',authenticateJWT,kundaliController.createKundali);
router.get('/kundali-by-user/',authenticateJWT,kundaliController.kundaliById);

module.exports = router;
