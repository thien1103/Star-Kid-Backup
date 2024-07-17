const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const verifyToken = require("../middleware/verifyToken");
const checkPermission = require("../middleware/verifyRole");

router.get("/employee/all", verifyToken, checkPermission(['Quản trị viên', 'Hiệu trưởng']),employeeController.GetAllEmployee);
router.get("/employee/:id", verifyToken, checkPermission(['Quản trị viên', 'Hiệu trưởng']),employeeController.GetEmployee);
// router.post("/employee/add", verifyToken, studentController.AddStudent);
// // router.get("/user/avatar/:filename", userController.GetUserAvatar);
// router.put("/employee/employee/:id", verifyToken, studentController.UpdateStudentInfo);
// router.delete("/employee/delete/:id", verifyToken, studentController.DeleteStudent);
// // router.put('/user/changeAvatar/:userId', verifyToken, userController.ChangeAvatar);

module.exports = router;
