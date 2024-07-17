const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Authentication = require('../controllers/authenticateController');

router.post('/signup', Authentication.SignUp);
router.post('/signin', Authentication.SignIn);
router.post('/signout',verifyToken, Authentication.logoutExecute);
// router.get('/', verifyToken, Authentication.showVerifyUser);
router.post('/changePassword',verifyToken, Authentication.ChangePassword);
router.get('/verify-email', Authentication.VerifyEmail);


module.exports = router;