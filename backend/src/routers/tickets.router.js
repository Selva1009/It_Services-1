const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const ticketController = require("../controllers/ticket.controller");

router.post("/raise", verifyToken, ticketController.raiseTicket);
router.get("/my", verifyToken, ticketController.getMyTickets);
router.get("/vendor/unclaimed", verifyToken, ticketController.getUnclaimedTickets);
router.get("/vendor/list", verifyToken, ticketController.getVendorTickets);
router.get("/admin/list", verifyToken, ticketController.getItAdminTickets);
router.get("/:id/detail", verifyToken, ticketController.getTicketDetail);
router.patch("/:id/claim", verifyToken, ticketController.claimTicket);
router.patch("/:id/status", verifyToken, ticketController.updateStatus);

module.exports = router;
