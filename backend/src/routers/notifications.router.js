const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const notificationController = require("../controllers/notification.controller");

router.get("/", verifyToken, notificationController.getNotifications);
router.get("/unread-count", verifyToken, notificationController.getUnreadCount);
router.patch("/read-all", verifyToken, notificationController.markAllRead);
router.patch("/:id/read", verifyToken, notificationController.markRead);

module.exports = router;
