const {
  generateTicketNumber,
  createTicket,
  getVendorsByCategory,
  getVendorUserIdsByVendorId,
  getUnclaimedTickets,
  claimTicket,
  getTicketsByVendor,
  getTicketsByItAdmin,
  getTicketsByItUser,
  getTicketById,
  getTicketActivity,
  addTicketActivity,
  updateTicketStatus,
} = require("../services/tickets.service");
const { createNotification } = require("../services/notifications.service");

const getUser = (req) => req.user || req.users || null;
const isVendorRole = (role) => role === "vendor_admin" || role === "vendor_user";

const canAccessTicket = (user, ticket) => {
  if (!user || !ticket) return false;
  if (user.role === "it_admin") return ticket.it_admin_id === user.id;
  if (user.role === "it_user") return ticket.it_user_id === user.id;
  if (user.role === "vendor_admin") return ticket.vendor_id === user.id;
  if (user.role === "vendor_user") return ticket.vendor_id === user.parentId;
  return false;
};

exports.raiseTicket = async (req, res) => {
  try {
    const user = getUser(req);
    const itUserId = user?.id;
    const itAdminId = user?.parentId;

    const {
      category,
      subCategory,
      supportLevel,
      title,
      description,
      priority,
    } = req.body || {};

    if (!itUserId || !itAdminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!category || !subCategory || !title || !description) {
      return res.status(400).json({ message: "category, subCategory, title and description are required." });
    }

    const ticketResult = await createTicket({
      ticketNumber: generateTicketNumber(),
      itUserId,
      itAdminId,
      vendorId: null,
      vendorUserId: null,
      category,
      subCategory,
      supportLevel: supportLevel || "L1",
      title,
      description,
      priority: priority || "Medium",
    });

    await addTicketActivity({
      ticketId: ticketResult.ticketId,
      actorType: "it_user",
      actorId: itUserId,
      actionType: "status_change",
      message: "Ticket raised",
      oldValue: null,
      newValue: "Open",
    });

    const vendors = await getVendorsByCategory(category);

    await Promise.all(
      vendors.map(async (vendor) => {
        await createNotification({
          recipientType: "vendor_admin",
          recipientId: vendor.vendor_id,
          ticketId: ticketResult.ticketId,
          type: "ticket_raised",
          message: `New ticket ${ticketResult.ticketNumber} raised for ${category} support. Click to claim.`,
        });

        const vendorUserIds = await getVendorUserIdsByVendorId(vendor.vendor_id);

        await Promise.all(
          vendorUserIds.map((vendorUserId) =>
            createNotification({
              recipientType: "vendor_user",
              recipientId: vendorUserId,
              ticketId: ticketResult.ticketId,
              type: "ticket_raised",
              message: `New ticket ${ticketResult.ticketNumber} raised for ${category} support. Click to claim.`,
            })
          )
        );
      })
    );

    await createNotification({
      recipientType: "it_admin",
      recipientId: itAdminId,
      ticketId: ticketResult.ticketId,
      type: "ticket_raised",
      message: `Ticket ${ticketResult.ticketNumber} raised for ${category} support.`,
    });

    return res.status(201).json({
      message: "Ticket raised successfully",
      ticketNumber: ticketResult.ticketNumber,
      ticketId: ticketResult.ticketId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to raise ticket" });
  }
};

exports.claimTicket = async (req, res) => {
  try {
    const user = getUser(req);
    const ticketId = req.params.id;

    if (!isVendorRole(user?.role)) {
      return res.status(403).json({ message: "Only vendor users can claim tickets." });
    }

    const vendorId = user?.role === "vendor_user"
      ? user?.parentId
      : user?.id;

    const vendorUserId = user?.role === "vendor_user"
      ? user?.id
      : null;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.vendor_id !== null) {
      return res.status(400).json({ message: "Ticket already claimed by another vendor." });
    }

    const allowedVendors = await getVendorsByCategory(ticket.category);
    const canClaim = allowedVendors.some((row) => row.vendor_id === vendorId);
    if (!canClaim) {
      return res.status(403).json({ message: "Your vendor is not eligible for this ticket category." });
    }

    const affectedRows = await claimTicket(ticketId, vendorId, vendorUserId);
    if (!affectedRows) {
      return res.status(400).json({ message: "Ticket already claimed by another vendor." });
    }

    await addTicketActivity({
      ticketId,
      actorType: "vendor_user",
      actorId: user?.id,
      actionType: "assignment",
      message: "Ticket claimed by vendor user",
      oldValue: "Open",
      newValue: "Assigned",
    });

    await createNotification({
      recipientType: "it_admin",
      recipientId: ticket.it_admin_id,
      ticketId,
      type: "ticket_assigned",
      message: `Ticket ${ticket.ticket_number} has been claimed by a vendor.`,
    });

    await createNotification({
      recipientType: "it_user",
      recipientId: ticket.it_user_id,
      ticketId,
      type: "ticket_assigned",
      message: `Your ticket ${ticket.ticket_number} has been assigned to a support vendor.`,
    });

    return res.status(200).json({ message: "Ticket claimed successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to claim ticket" });
  }
};

exports.getUnclaimedTickets = async (req, res) => {
  try {
    const user = getUser(req);

    const vendorId = user?.role === "vendor_user"
      ? user?.parentId
      : user?.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tickets = await getUnclaimedTickets(vendorId);
    return res.status(200).json({ tickets });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load tickets" });
  }
};

exports.getVendorTickets = async (req, res) => {
  try {
    const user = getUser(req);

    const vendorId = user?.role === "vendor_user"
      ? user?.parentId
      : user?.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tickets = await getTicketsByVendor(vendorId);
    return res.status(200).json({ tickets });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load tickets" });
  }
};

exports.getItAdminTickets = async (req, res) => {
  try {
    const user = getUser(req);
    const itAdminId = user?.id;

    if (!itAdminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tickets = await getTicketsByItAdmin(itAdminId);
    return res.status(200).json({ tickets });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load tickets" });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const user = getUser(req);
    const itUserId = user?.id;

    if (!itUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tickets = await getTicketsByItUser(itUserId);
    return res.status(200).json({ tickets });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load tickets" });
  }
};

exports.getTicketDetail = async (req, res) => {
  try {
    const user = getUser(req);
    const ticketId = req.params.id;

    const [ticket, activity] = await Promise.all([
      getTicketById(ticketId),
      getTicketActivity(ticketId),
    ]);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccessTicket(user, ticket)) {
      return res.status(403).json({ message: "You are not allowed to view this ticket." });
    }

    return res.status(200).json({ ticket, activity });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load ticket" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const user = getUser(req);
    const ticketId = req.params.id;
    const { status, comment } = req.body || {};

    if (!status) {
      return res.status(400).json({ message: "Status required" });
    }

    const currentTicket = await getTicketById(ticketId);
    if (!currentTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!canAccessTicket(user, currentTicket)) {
      return res.status(403).json({ message: "You are not allowed to update this ticket." });
    }

    await updateTicketStatus(ticketId, status, status === "Resolved" ? new Date() : null);

    await addTicketActivity({
      ticketId,
      actorType: user?.role,
      actorId: user?.id,
      actionType: "status_change",
      message: comment || "Status updated",
      oldValue: currentTicket.status,
      newValue: status,
    });

    await createNotification({
      recipientType: "it_user",
      recipientId: currentTicket.it_user_id,
      ticketId,
      type: "status_update",
      message: `Your ticket ${currentTicket.ticket_number} status updated to ${status}.`,
    });

    await createNotification({
      recipientType: "it_admin",
      recipientId: currentTicket.it_admin_id,
      ticketId,
      type: "status_update",
      message: `Ticket ${currentTicket.ticket_number} updated to ${status} by vendor.`,
    });

    return res.status(200).json({ message: "Status updated successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to update status" });
  }
};
