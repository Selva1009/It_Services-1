const db = require("../../db");

const generateTicketNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TCK-${date}-${rand}`;
};

exports.generateTicketNumber = generateTicketNumber;

exports.createTicket = async (data) => {
  const {
    ticketNumber,
    itUserId,
    itAdminId,
    vendorId,
    vendorUserId,
    category,
    subCategory,
    title,
    description,
    priority,
    supportLevel,
  } = data;

  const resolvedTicketNumber = ticketNumber || generateTicketNumber();

  const [result] = await db.query(
    `INSERT INTO tickets
      (ticket_number, it_user_id, it_admin_id, vendor_id, vendor_user_id,
       category, sub_category, title, description, priority, support_level, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resolvedTicketNumber,
      itUserId,
      itAdminId,
      vendorId ?? null,
      vendorUserId ?? null,
      category,
      subCategory,
      title,
      description,
      priority || "Medium",
      supportLevel || "L1",
      "Open",
    ]
  );

  return {
    ticketId: result.insertId,
    ticketNumber: resolvedTicketNumber,
  };
};

exports.getVendorsByCategory = async (category) => {
  const [rows] = await db.query(
    `SELECT DISTINCT vendor_id
     FROM vendor_services
     WHERE TRIM(service_name) = ?`,
    [category]
  );

  return rows;
};

exports.getVendorUserIdsByVendorId = async (vendorId) => {
  const [rows] = await db.query(
    `SELECT id FROM vendor_users WHERE vendor_id = ?`,
    [vendorId]
  );

  return rows.map((row) => row.id).filter(Boolean);
};

exports.getUnclaimedTickets = async (vendorId) => {
  const [rows] = await db.query(
    `SELECT t.*,
      iu.name AS raised_by_name,
      iu.email AS raised_by_email,
      ia.company_name AS it_company
     FROM tickets t
     LEFT JOIN it_users_employee iu ON iu.id = t.it_user_id
     LEFT JOIN it_user_admin_signup ia ON ia.id = t.it_admin_id
     WHERE t.vendor_id IS NULL
     AND t.status = 'Open'
     AND t.category IN (
       SELECT TRIM(service_name)
       FROM vendor_services
       WHERE vendor_id = ?
     )
     ORDER BY t.created_at DESC`,
    [vendorId]
  );

  return rows;
};

exports.claimTicket = async (ticketId, vendorId, vendorUserId) => {
  const [result] = await db.query(
    `UPDATE tickets
     SET vendor_id = ?,
         vendor_user_id = ?,
         status = 'Assigned',
         claimed_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND vendor_id IS NULL`,
    [vendorId, vendorUserId ?? null, ticketId]
  );

  return result.affectedRows;
};

exports.getTicketsByVendor = async (vendorId) => {
  const [rows] = await db.query(
    `SELECT t.*,
      iu.name AS raised_by_name,
      iu.email AS raised_by_email,
      ia.company_name AS it_company
     FROM tickets t
     LEFT JOIN it_users_employee iu ON iu.id = t.it_user_id
     LEFT JOIN it_user_admin_signup ia ON ia.id = t.it_admin_id
     WHERE t.vendor_id = ?
     ORDER BY t.created_at DESC`,
    [vendorId]
  );

  return rows;
};

exports.getTicketsByItAdmin = async (itAdminId) => {
  const [rows] = await db.query(
    `SELECT t.*,
      iu.name AS raised_by_name,
      iu.email AS raised_by_email,
      v.company_name AS vendor_company,
      vu.name AS assigned_vendor_user,
      ta.message AS latest_comment,
      ta.created_at AS latest_activity_at
     FROM tickets t
     LEFT JOIN it_users_employee iu ON iu.id = t.it_user_id
     LEFT JOIN vendor_engineers_signup v ON v.id = t.vendor_id
     LEFT JOIN vendor_users vu ON vu.id = t.vendor_user_id
     LEFT JOIN ticket_activity ta ON ta.ticket_id = t.id
       AND ta.id = (SELECT MAX(id) FROM ticket_activity WHERE ticket_id = t.id)
     WHERE t.it_admin_id = ?
     ORDER BY t.created_at DESC`,
    [itAdminId]
  );

  return rows;
};

exports.getTicketsByItUser = async (itUserId) => {
  const [rows] = await db.query(
    `SELECT t.*,
      v.company_name AS vendor_company,
      vu.name AS assigned_vendor_user
     FROM tickets t
     LEFT JOIN vendor_engineers_signup v ON v.id = t.vendor_id
     LEFT JOIN vendor_users vu ON vu.id = t.vendor_user_id
     WHERE t.it_user_id = ?
     ORDER BY t.created_at DESC`,
    [itUserId]
  );

  return rows;
};

exports.getTicketById = async (ticketId) => {
  const [rows] = await db.query(
    `SELECT t.*,
      iu.name AS raised_by_name,
      iu.email AS raised_by_email,
      ia.company_name AS it_company,
      v.company_name AS vendor_company,
      vu.name AS assigned_vendor_user
     FROM tickets t
     LEFT JOIN it_users_employee iu ON iu.id = t.it_user_id
     LEFT JOIN it_user_admin_signup ia ON ia.id = t.it_admin_id
     LEFT JOIN vendor_engineers_signup v ON v.id = t.vendor_id
     LEFT JOIN vendor_users vu ON vu.id = t.vendor_user_id
     WHERE t.id = ?`,
    [ticketId]
  );

  return rows.length ? rows[0] : null;
};

exports.getTicketActivity = async (ticketId) => {
  const [rows] = await db.query(
    `SELECT * FROM ticket_activity
     WHERE ticket_id = ?
     ORDER BY created_at ASC`,
    [ticketId]
  );

  return rows;
};

exports.addTicketActivity = async (data) => {
  const {
    ticketId,
    actorType,
    actorId,
    actionType,
    message,
    oldValue,
    newValue,
  } = data;

  const [result] = await db.query(
    `INSERT INTO ticket_activity
      (ticket_id, actor_type, actor_id, action_type, message, old_value, new_value)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [ticketId, actorType, actorId, actionType, message, oldValue, newValue]
  );

  return result.insertId;
};

exports.updateTicketStatus = async (ticketId, status, resolvedAt) => {
  await db.query(
    `UPDATE tickets SET status = ?, resolved_at = ?,
      updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, resolvedAt, ticketId]
  );
};
