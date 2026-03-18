"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, Container, Snackbar, Stack } from "@mui/material";
import TicketDetail from "@/components/TicketDetail";
import StatusUpdateDialog from "@/components/StatusUpdateDialog";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/app/contexts/AuthContext";
import { getTicketDetail, updateTicketStatus } from "@/services/ticketService";

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { auth } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [activity, setActivity] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ open: false, text: "", severity: "success" });

  const canUpdateStatus = auth?.role?.startsWith("vendor");

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTicketDetail(id);
      setTicket(response.data.ticket || null);
      setActivity(response.data.activity || []);
    } catch (error) {
      setMessage({ open: true, text: error.message || "Unable to load ticket", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleStatusUpdate = async (payload) => {
    setUpdating(true);
    try {
      await updateTicketStatus(id, payload);
      await loadDetail();
      setDialogOpen(false);
      setMessage({ open: true, text: "Ticket status updated successfully", severity: "success" });
    } catch (error) {
      setMessage({ open: true, text: error.message || "Unable to update status", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => router.push("/tickets/list")}>
            Back to List
          </Button>
          {canUpdateStatus ? (
            <Button variant="contained" onClick={() => setDialogOpen(true)} disabled={loading || !ticket}>
              Update Status
            </Button>
          ) : null}
        </Stack>
        <NotificationBell onClick={() => router.push("/notifications")} />
      </Stack>

      <TicketDetail ticket={ticket} activity={activity} loading={loading} />

      <StatusUpdateDialog
        open={dialogOpen}
        currentStatus={ticket?.status || "Open"}
        loading={updating}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleStatusUpdate}
      />

      <Snackbar open={message.open} autoHideDuration={3000} onClose={() => setMessage((prev) => ({ ...prev, open: false }))}>
        <Alert severity={message.severity} variant="filled">
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}
