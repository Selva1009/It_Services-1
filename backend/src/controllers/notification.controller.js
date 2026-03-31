const {
  getNotificationsByRecipient,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../services/notifications.service");

const getUser = (req) => req.user || req.users || null;

exports.getNotifications = async (req, res) => {
  try {
    const user = getUser(req);
    const recipientType = user?.role;
    const recipientId = user?.id;

    if (!recipientType || !recipientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await getNotificationsByRecipient(recipientType, recipientId);
    return res.status(200).json({ notifications });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load notifications" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const user = getUser(req);
    const recipientType = user?.role;
    const recipientId = user?.id;

    if (!recipientType || !recipientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const unreadCount = await getUnreadCount(recipientType, recipientId);
    return res.status(200).json({ unreadCount });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load unread count" });
  }
};

exports.markRead = async (req, res) => {
  try {
    const user = getUser(req);
    const recipientType = user?.role;
    const recipientId = user?.id;
    if (!recipientType || !recipientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notificationId = req.params.id;
    const updatedRows = await markNotificationRead(notificationId, recipientType, recipientId);
    if (!updatedRows) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to update notification" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const user = getUser(req);
    const recipientType = user?.role;
    const recipientId = user?.id;

    if (!recipientType || !recipientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await markAllNotificationsRead(recipientType, recipientId);
    return res.status(200).json({ message: "All marked as read" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to update notifications" });
  }
};
