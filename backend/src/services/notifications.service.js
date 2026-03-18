const db = require("../../db");

exports.createNotification = async (data) => {
  const { recipientType, recipientId, ticketId, type, message } = data;

  await db.query(
    `INSERT INTO notifications
      (recipient_type, recipient_id, ticket_id, type, message)
     VALUES (?, ?, ?, ?, ?)`,
    [recipientType, recipientId, ticketId, type, message]
  );
};

exports.getNotificationsByRecipient = async (recipientType, recipientId) => {
  const [rows] = await db.query(
    `SELECT n.*, t.ticket_number, t.category, t.status
     FROM notifications n
     LEFT JOIN tickets t ON t.id = n.ticket_id
     WHERE n.recipient_type = ? AND n.recipient_id = ?
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [recipientType, recipientId]
  );

  return rows;
};

exports.markNotificationRead = async (notificationId) => {
  await db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [notificationId]
  );
};

exports.markAllNotificationsRead = async (recipientType, recipientId) => {
  await db.query(
    `UPDATE notifications SET is_read = 1
     WHERE recipient_type = ? AND recipient_id = ?`,
    [recipientType, recipientId]
  );
};

exports.getUnreadCount = async (recipientType, recipientId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS unread_count FROM notifications
     WHERE recipient_type = ? AND recipient_id = ? AND is_read = 0`,
    [recipientType, recipientId]
  );

  return rows.length ? rows[0].unread_count : 0;
};
