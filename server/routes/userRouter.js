const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkPermission = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');


router.get("/user/all", verifyToken, checkPermission(['Quản trị viên']), userController.GetAllUserInfo);
router.get('/user/:userId',verifyToken, checkPermission(['Quản trị viên']), userController.GetUserInfo);
// router.get("/user/avatar/:filename", userController.GetUserAvatar);
router.put('/user/update/:userId',verifyToken, checkPermission(['Quản trị viên']), userController.UpdateUserInfo);
// router.put('/user/changeAvatar/:userId', verifyToken, userController.ChangeAvatar);


module.exports = router;