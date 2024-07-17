const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const checkPermission = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.get('/contacts',verifyToken, checkPermission(['Phụ huynh','Giáo viên', 'Hiệu trưởng', 'Quản trị viên']), contactController.GetAllContacts)

module.exports = router;