const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateLogin, authenticateLocal, authenticateJWT } = require('../config/middleware');
const { uploadProfileImages } = require('../utils/multer');
const { setRedirectURIs } = require('../googleOAuth')

router.get('/users', userController.getAllUsers);
router.post('/register',userController.createUser);
router.post('/verify',userController.verifyUser)
router.post('/resend-otp',userController.reSendOtp)
router.get('/getUserById/:id',userController.getUserById)
router.post('/login',validateLogin,authenticateLocal, userController.loginUser)
router.get('/user-details',authenticateJWT, userController.getUserDetails)
router.put('/edit-user',authenticateJWT,userController.editUser)
router.put('/update-password',authenticateJWT,userController.updatePassword)
router.post('/email',userController.email)
router.put('/reset-password',userController.resetPassword)
router.post ('/upload-profile', authenticateJWT, uploadProfileImages, userController.uploadProfile);

router.get("/login/google", setRedirectURIs, userController.googleLogin);

router.post("/login/google/register-user", setRedirectURIs, userController.googleLoginUserRegistration);

router.post("/login/google/add-google-account", authenticateJWT, setRedirectURIs, userController.googleLoginAddGoogleAccount);

module.exports = router;
