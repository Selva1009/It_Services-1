const notificationService = require("../services/notifications.service");

const resolveRecipient = (user) => {
  if (!user) return null;

  switch (user.role) {
    case "vendor_admin":
      return { type: "vendor_admin", id: user.id };
    case "vendor_user":
      return { type: "vendor_user", id: user.id };
    case "it_admin":
      return { type: "it_admin", id: user.id };
    case "it_user":
      return { type: "it_user", id: user.id };
    default:
      return null;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const recipient = resolveRecipient(req.users);
    if (!recipient) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await notificationService.getNotificationsByRecipient(
      recipient.type,
      recipient.id
    );

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to load notifications" });
  }
};

exports.markRead = async (req, res) => {
  try {
    await notificationService.markNotificationRead(req.params.id);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to update notification" });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const recipient = resolveRecipient(req.users);
    if (!recipient) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await notificationService.markAllNotificationsRead(recipient.type, recipient.id);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to update notifications" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const recipient = resolveRecipient(req.users);
    if (!recipient) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const unreadCount = await notificationService.getUnreadCount(
      recipient.type,
      recipient.id
    );

    res.status(200).json({ unreadCount, unread_count: unreadCount });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to load unread count" });
  }
};
