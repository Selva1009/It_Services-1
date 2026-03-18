const ticketService = require("../services/tickets.service");
const notificationService = require("../services/notifications.service");

const resolveVendorIdFromUser = (user) => {
  if (!user) return null;
  if (user.role === "vendor_user") return user.parentId || null;
  if (user.role === "vendor_admin") return user.id || null;
  return null;
};

const resolveItAdminIdFromUser = (user) => {
  if (!user) return null;
  if (user.role === "it_user") return user.parentId || null;
  if (user.role === "it_admin") return user.id || null;
  return null;
};

exports.raiseTicket = async (req, res) => {
  try {
    if (!req.users?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      category,
      subCategory,
      title,
      description,
      priority,
      supportLevel,
      vendorId,
      itAdminId,
    } = req.body;

    const itUserId = req.users.id;
    const resolvedItAdminId = itAdminId || resolveItAdminIdFromUser(req.users);

    const ticketResult = await ticketService.createTicket({
      itUserId,
      itAdminId: resolvedItAdminId,
      vendorId: vendorId || null,
      vendorUserId: null,
      category,
      subCategory,
      title,
      description,
      priority,
      supportLevel,
    });

    await ticketService.addTicketActivity({
      ticketId: ticketResult.ticketId,
      actorType: "it_user",
      actorId: itUserId,
      actionType: "status_change",
      message: "Ticket raised",
      oldValue: null,
      newValue: "Open",
    });

    if (ticketResult.vendorId) {
      await notificationService.createNotification({
        recipientType: "vendor_admin",
        recipientId: ticketResult.vendorId,
        ticketId: ticketResult.ticketId,
        type: "ticket_raised",
        message: `New ticket ${ticketResult.ticketNumber} raised for ${category} support.`,
      });

      const vendorUserIds = await ticketService.getVendorUserIdsByVendorId(ticketResult.vendorId);
      await Promise.all(
        vendorUserIds.map((vendorUserId) =>
          notificationService.createNotification({
            recipientType: "vendor_user",
            recipientId: vendorUserId,
            ticketId: ticketResult.ticketId,
            type: "ticket_raised",
            message: `New ticket ${ticketResult.ticketNumber} raised for ${category} support.`,
          })
        )
      );
    }

    if (resolvedItAdminId) {
      await notificationService.createNotification({
        recipientType: "it_admin",
        recipientId: resolvedItAdminId,
        ticketId: ticketResult.ticketId,
        type: "ticket_raised",
        message: `Ticket ${ticketResult.ticketNumber} has been raised and assigned to vendor.`,
      });
    }

    return res.status(201).json({
      message: "Ticket raised successfully",
      ticketNumber: ticketResult.ticketNumber,
      ticketId: ticketResult.ticketId,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to raise ticket" });
  }
};

exports.getVendorTickets = async (req, res) => {
  try {
    const vendorId = resolveVendorIdFromUser(req.users);
    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tickets = await ticketService.getTicketsByVendor(vendorId);
    res.status(200).json({ tickets });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to load tickets" });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.users?.id;
    const role = req.users?.role;

    if (!userId || role !== "it_user") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tickets = await ticketService.getTicketsByItUser(userId);
    return res.status(200).json({ tickets });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to load tickets" });
  }
};

exports.getMyTicketCount = async (req, res) => {
  try {
    const userId = req.users?.id;
    const role = req.users?.role;

    if (!userId || role !== "it_user") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { openCount, resolvedCount } = await ticketService.getTicketCountByItUser(userId);

    return res.status(200).json({
      open: openCount,
      resolved: resolvedCount,
      openCount,
      resolvedCount,
      counts: {
        open: openCount,
        resolved: resolvedCount,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Failed to load ticket counts" });
  }
};

exports.getItAdminTickets = async (req, res) => {
  try {
    const itAdminId = resolveItAdminIdFromUser(req.users);
    if (!itAdminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tickets = await ticketService.getTicketsByItAdmin(itAdminId);
    res.status(200).json({ tickets });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to load tickets" });
  }
};

exports.getTicketDetail = async (req, res) => {
  try {
    const ticketId = req.params.id;

    const [ticket, activity] = await Promise.all([
      ticketService.getTicketById(ticketId),
      ticketService.getTicketActivity(ticketId),
    ]);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ ticket, activity });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to load ticket" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    if (!req.users?.role || !req.users.role.startsWith("vendor")) {
      return res.status(403).json({ message: "Only vendor users can update ticket status" });
    }

    const ticketId = req.params.id;
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status required" });
    }

    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const actorType = req.users?.role === "vendor_admin" ? "vendor_admin" : "vendor_user";

    const actorId = req.users?.id || null;

    const resolvedAt = status === "Resolved" ? new Date() : null;
    await ticketService.updateTicketStatus(ticketId, status, resolvedAt);

    await ticketService.addTicketActivity({
      ticketId,
      actorType,
      actorId,
      actionType: "status_change",
      message: comment || "Status updated",
      oldValue: ticket.status || null,
      newValue: status,
    });

    if (ticket.it_user_id) {
      await notificationService.createNotification({
        recipientType: "it_user",
        recipientId: ticket.it_user_id,
        ticketId: ticket.id,
        type: "status_update",
        message: `Your ticket ${ticket.ticket_number} status updated to ${status}.`,
      });
    }

    if (ticket.it_admin_id) {
      const adminMessage = actorType === "vendor_user"
        ? `Ticket ${ticket.ticket_number} updated to ${status} by vendor.`
        : `Ticket ${ticket.ticket_number} updated to ${status} by IT admin.`;

      await notificationService.createNotification({
        recipientType: "it_admin",
        recipientId: ticket.it_admin_id,
        ticketId: ticket.id,
        type: "status_update",
        message: adminMessage,
      });
    }

    if (status === "Escalated" && ticket.vendor_id) {
      await notificationService.createNotification({
        recipientType: "vendor_admin",
        recipientId: ticket.vendor_id,
        ticketId: ticket.id,
        type: "status_update",
        message: `Ticket ${ticket.ticket_number} escalated by vendor to ${status}.`,
      });
    }

    res.status(200).json({ message: "Status updated successfully." });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Failed to update status" });
  }
};

