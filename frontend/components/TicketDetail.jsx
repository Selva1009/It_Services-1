"use client";

import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  Stack,
  Typography,
} from "@mui/material";

const PRIORITY_COLOR = {
  Low: "success",
  Medium: "warning",
  High: "error",
  Critical: "error",
};

const STATUS_COLOR = {
  Open: "default",
  Assigned: "info",
  "In Progress": "primary",
  Escalated: "warning",
  Resolved: "success",
  Closed: "success",
};

const prettyDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function TicketDetail({ ticket, activity = [], loading = false }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) return null;

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Stack spacing={1}>
              <Typography variant="h5" fontWeight={700}>
                {ticket.ticket_number}
              </Typography>
              <Typography variant="subtitle1">{ticket.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {ticket.description}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip label={ticket.priority || "-"} color={PRIORITY_COLOR[ticket.priority] || "default"} />
              <Chip label={ticket.status || "-"} color={STATUS_COLOR[ticket.status] || "default"} />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Typography variant="body2">
              <strong>Category:</strong> {ticket.category || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Sub Category:</strong> {ticket.sub_category || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Support Level:</strong> {ticket.support_level || "-"}
            </Typography>
            <Typography variant="body2">
              <strong>Created:</strong> {prettyDate(ticket.created_at)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Activity Timeline
          </Typography>
          <List disablePadding>
            {activity.length ? (
              activity.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={item.message || item.action_type}
                    secondary={`${item.actor_type || "system"} • ${prettyDate(item.created_at)}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No activity yet.
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
}
