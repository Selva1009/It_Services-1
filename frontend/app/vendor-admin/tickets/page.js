"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { getVendorTickets } from "@/services/ticketService";

const STATUS_CLASS = {
  Open: { bg: "#dbeafe", color: "#1d4ed8" },
  Assigned: { bg: "#ede9fe", color: "#6d28d9" },
  "In Progress": { bg: "#fef3c7", color: "#b45309" },
  Escalated: { bg: "#fee2e2", color: "#b91c1c" },
  Resolved: { bg: "#dcfce7", color: "#166534" },
  Closed: { bg: "#e2e8f0", color: "#334155" },
};

const PRIORITY_CLASS = {
  Low: { bg: "#dcfce7", color: "#166534" },
  Medium: { bg: "#fef3c7", color: "#b45309" },
  High: { bg: "#fee2e2", color: "#b91c1c" },
  Critical: { bg: "#fecaca", color: "#991b1b" },
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function VendorAdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getVendorTickets();
        if (mounted) setTickets(response.data.tickets || []);
      } catch {
        if (mounted) setTickets([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tickets;
    return tickets.filter((ticket) =>
      String(ticket.ticket_number || "").toLowerCase().includes(query) ||
      String(ticket.title || "").toLowerCase().includes(query) ||
      String(ticket.category || "").toLowerCase().includes(query) ||
      String(ticket.raised_by_name || "").toLowerCase().includes(query)
    );
  }, [search, tickets]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Vendor Tickets
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Total tickets assigned to your vendor account.
      </Typography>

      <TextField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by ticket number, title, category, or raised by"
        fullWidth
      />

      {loading ? (
        <Stack alignItems="center" py={5}>
          <CircularProgress />
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ticket Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Raised By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.ticket_number || "-"}</TableCell>
                    <TableCell>{ticket.title || "-"}</TableCell>
                    <TableCell>{ticket.category || "-"}</TableCell>
                    <TableCell>{ticket.raised_by_name || "-"}</TableCell>
                    <TableCell>{ticket.raised_by_email || "-"}</TableCell>
                    <TableCell>{ticket.it_company || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ticket.priority || "-"}
                        sx={PRIORITY_CLASS[ticket.priority] || PRIORITY_CLASS.Medium}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ticket.status || "-"}
                        sx={STATUS_CLASS[ticket.status] || STATUS_CLASS.Open}
                      />
                    </TableCell>
                    <TableCell>{formatDate(ticket.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
