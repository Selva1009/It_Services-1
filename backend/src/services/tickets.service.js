const db = require("../../db");

const generateTicketNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `TCK-${ts}-${rand}`;
};

const resolveVendorId = async ({ itAdminId, category }) => {
  if (!category || !itAdminId) return null;

  const [rows] = await db.query(
    `SELECT vs.vendor_id 
     FROM vendor_services vs
     INNER JOIN it_admin_vendors iav ON iav.vendor_id = vs.vendor_id
     WHERE vs.service_name = ? 
     AND iav.it_admin_id = ?
     LIMIT 1`,
    [category, itAdminId]
  );

  return rows.length ? rows[0].vendor_id : null;
};

exports.createTicket = async (data) => {
  const {
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

  if (!itUserId) throw { status: 400, message: "IT user id required" };
  if (!category || !title || !description) throw { status: 400, message: "Missing required fields" };

  const resolvedVendorId = await resolveVendorId({ itAdminId, category });
  if (!resolvedVendorId) throw { status: 400, message: "Vendor not found for category" };

  const ticketNumber = generateTicketNumber();

  const [result] = await db.query(
    `INSERT INTO tickets
      (ticket_number, it_user_id, it_admin_id, vendor_id, vendor_user_id,
       category, sub_category, title, description, priority, support_level, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ticketNumber,
      itUserId,
      itAdminId,
      resolvedVendorId,
      vendorUserId || null,
      category,
      subCategory || null,
      title,
      description,
      priority || "Medium",
      supportLevel || "L1",
      "Open",
    ]
  );

  return {
    ticketId: result.insertId,
    ticketNumber,
    vendorId: resolvedVendorId,
  };
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

exports.getVendorUserIdsByVendorId = async (vendorId) => {
  if (!vendorId) return [];

  try {
    const [rows] = await db.query(
      `SELECT id FROM vendor_users WHERE vendor_id = ?`,
      [vendorId]
    );
    return rows.map((row) => row.id).filter(Boolean);
  } catch {
    // Keep ticket flow resilient even if vendor-user lookup cannot be resolved.
    return [];
  }
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

exports.getTicketCountByItUser = async (itUserId) => {
  const [rows] = await db.query(
    `SELECT
      SUM(CASE WHEN status IN ('Open', 'Assigned', 'In Progress', 'Escalated') THEN 1 ELSE 0 END) AS open_count,
      SUM(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS resolved_count
     FROM tickets
     WHERE it_user_id = ?`,
    [itUserId]
  );

  const openCount = Number(rows?.[0]?.open_count || 0);
  const resolvedCount = Number(rows?.[0]?.resolved_count || 0);

  return { openCount, resolvedCount };
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
    `UPDATE tickets SET status = ?,
      resolved_at = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, resolvedAt, ticketId]
  );
};
