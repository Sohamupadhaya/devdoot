const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');
const {authenticateAdminLocal,
  authenticateAdminJWT,
    validateAdminLogin
}= require('../config/admin-middleware.js')

router.post('/admin-login',validateAdminLogin, authenticateAdminLocal, adminController.login);

router.get('/get-event-bookings', authenticateAdminJWT, adminController.getEventBookings);

module.exports = router;