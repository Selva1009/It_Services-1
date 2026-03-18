"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Container, Snackbar, Stack, Typography } from "@mui/material";
import NotificationBell from "@/components/NotificationBell";
import TicketTable from "@/components/TicketTable";
import { useAuth } from "@/app/contexts/AuthContext";
import { getAdminTickets, getMyTickets, getVendorTickets } from "@/services/ticketService";

const VENDOR_COLUMNS = [
  { key: "ticket_number", label: "Ticket Number" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "raised_by_name", label: "Raised By" },
  { key: "it_company", label: "Company" },
  { key: "created_at", label: "Created Date", type: "date" },
];

const ADMIN_COLUMNS = [
  { key: "ticket_number", label: "Ticket Number" },
  { key: "title", label: "Title" },
  { key: "vendor_company", label: "Vendor Company" },
  { key: "assigned_vendor_user", label: "Assigned Vendor User" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "latest_comment", label: "Latest Comment" },
  { key: "latest_activity_at", label: "Last Activity", type: "date" },
];

const IT_USER_COLUMNS = [
  { key: "ticket_number", label: "Ticket Number" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "vendor_company", label: "Vendor Company" },
  { key: "assigned_vendor_user", label: "Assigned Vendor User" },
  { key: "created_at", label: "Created Date", type: "date" },
];

export default function TicketListPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const role = auth?.role || "";

  const columns = useMemo(() => {
    if (role.startsWith("vendor")) return VENDOR_COLUMNS;
    if (role === "it_admin") return ADMIN_COLUMNS;
    return IT_USER_COLUMNS;
  }, [role]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (role.startsWith("vendor")) {
        response = await getVendorTickets();
      } else if (role === "it_admin") {
        response = await getAdminTickets();
      } else {
        response = await getMyTickets();
      }
      setRows(response.data.tickets || []);
    } catch (error) {
      setRows([]);
      setErrorMessage(error.message || "Unable to load tickets");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Tickets
        </Typography>
        <NotificationBell onClick={() => router.push("/notifications")} />
      </Stack>

      <TicketTable rows={rows} columns={columns} loading={loading} onView={(id) => router.push(`/tickets/${id}`)} />

      <Snackbar open={Boolean(errorMessage)} autoHideDuration={3000} onClose={() => setErrorMessage("")}>
        <Alert severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
