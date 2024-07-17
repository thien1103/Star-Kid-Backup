const express = require('express');
const router = express.Router();
const notification = require('../controllers/notificationController');
const checkPermission = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.get('/notifications',verifyToken, checkPermission(['Hiệu trưởng']), notification.GetAllNotifications)

module.exports = router;
