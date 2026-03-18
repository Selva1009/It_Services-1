const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const notificationController = require("../controllers/notification.controller");

router.get("/", authMiddleware, notificationController.getNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markRead);
router.patch("/read-all", authMiddleware, notificationController.markAllRead);
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

module.exports = router;
