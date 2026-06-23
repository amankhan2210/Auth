const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth.controller');

authRouter.post('/register',authController.register);
authRouter.get('/getme',authController.getme),
authRouter.get('/refreshtoken',authController.refreshToken)
authRouter.get('/logout',authController.logout),
authRouter.get('/logoutall',authController.logoutall)
authRouter.post('/login',authController.login)
authRouter.post('/send',authController.sendMailToUser)
authRouter.post('/emailverify',authController.verifyEmail)

module.exports = authRouter;