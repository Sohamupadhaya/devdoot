const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/users', userController.getAllUsers);
router.post('/register',userController.createUser);
router.post('/verify',userController.verifyUser)
router.post('/rsendeotp',userController.reSendOtp)
router.get('/getUserById/:id',userController.getUserById)

module.exports = router;
