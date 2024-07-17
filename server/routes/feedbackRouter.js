const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const feedbacks = require("../controllers/feedbackController");
const checkPermission = require("../middleware/verifyRole");

router.get("/feedbacks/all", verifyToken, feedbacks.GetAllFeedBack);
router.get("/feedbacks/:feedbackId", verifyToken, feedbacks.GetDetailedFeedBack);
router.post("/feedbacks/add", verifyToken, checkPermission(['Phụ huynh']) , feedbacks.CreateFeedBack);
router.put("/feedbacks/update/:feedbackId", checkPermission(['Phụ huynh']), verifyToken, feedbacks.UpdateFeedBack);
router.delete("/feedbacks/delete/:feedbackId", verifyToken, checkPermission(['Phụ huynh']) , feedbacks.DeleteFeedBack);

module.exports = router;
