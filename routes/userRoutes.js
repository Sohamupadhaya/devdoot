const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {  authenticateLocal, authenticateJWT } = require('../config/middleware');

router.get('/users', userController.getAllUsers);
router.post('/register',userController.createUser);
router.post('/verify',userController.verifyUser)
router.post('/rsendeotp',userController.reSendOtp)
router.get('/getUserById/:id',userController.getUserById)
router.post('/reotp',userController.reSendOtp)
router.post('/login',authenticateLocal, userController.loginUser)
router.get('/user-details',authenticateJWT, userController.getUserDetails)
router.post('/edit-user',authenticateJWT,userController.editUser)

module.exports = router;
