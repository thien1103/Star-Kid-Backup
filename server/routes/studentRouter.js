const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const checkPermission = require("../middleware/verifyRole");
const verifyToken = require("../middleware/verifyToken");

router.get("/student/all", verifyToken, checkPermission(['Giáo viên', 'Quản trị viên', 'Hiệu trưởng']), studentController.GetAllStudent);
router.get("/student/:id", verifyToken, checkPermission(['Giáo viên', 'Quản trị viên', 'Hiệu trưởng']), studentController.GetStudent);
router.post("/student/add", verifyToken, checkPermission(['Giáo viên', 'Quản trị viên', 'Hiệu trưởng']), studentController.AddStudent);
// router.get("/user/avatar/:filename", userController.GetUserAvatar);
router.put("/student/update/:id", verifyToken, checkPermission(['Giáo viên', 'Quản trị viên', 'Hiệu trưởng']), studentController.UpdateStudentInfo);
router.delete("/student/delete/:id", verifyToken, checkPermission(['Giáo viên', 'Quản trị viên', 'Hiệu trưởng']), studentController.DeleteStudent);
// router.put('/user/changeAvatar/:userId', verifyToken, userController.ChangeAvatar);

module.exports = router;
