const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateLogin, authenticateLocal, authenticateJWT } = require('../config/middleware');
const { uploadProfileImages } = require('../utils/multer');

router.get('/users', userController.getAllUsers);
router.post('/register',userController.createUser);
router.post('/verify',userController.verifyUser)
router.post('/rsendeotp',userController.reSendOtp)
router.get('/getUserById/:id',userController.getUserById)
router.post('/reotp',userController.reSendOtp)
router.post('/login',validateLogin,authenticateLocal, userController.loginUser)
router.get('/user-details',authenticateJWT, userController.getUserDetails)
router.put('/edit-user',authenticateJWT,userController.editUser)
router.post ('/update-profile', authenticateJWT, uploadProfileImages, userController.updateProfile);

module.exports = router;
