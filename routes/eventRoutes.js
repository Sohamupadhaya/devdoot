const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController.js')
const { authenticateJWT } = require('../config/middleware.js')

router.post('/book-event', authenticateJWT, eventController.bookEvents);

router.get('/user-events', authenticateJWT, eventController.getUserEvents);

router.get('/user-events/:id', authenticateJWT, eventController.getOneEvent);

module.exports = router;
