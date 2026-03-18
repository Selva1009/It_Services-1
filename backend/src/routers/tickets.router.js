const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const ticketController = require("../controllers/ticket.controller");

router.post("/raise", authMiddleware, ticketController.raiseTicket);
router.get("/my", authMiddleware, ticketController.getMyTickets);
router.get("/my-count", authMiddleware, ticketController.getMyTicketCount);
router.get("/vendor/list", authMiddleware, ticketController.getVendorTickets);
router.get("/admin/list", authMiddleware, ticketController.getItAdminTickets);
router.get("/:id/detail", authMiddleware, ticketController.getTicketDetail);
router.patch("/:id/status", authMiddleware, ticketController.updateStatus);

module.exports = router;
