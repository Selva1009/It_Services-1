"use client";

import { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

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

export default function NotificationList({
  notifications = [],
  loading = false,
  onMarkRead,
  onMarkAllRead,
}) {
  const latestNotifications = useMemo(() => notifications.slice(0, 50), [notifications]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
        <Typography variant="h6" fontWeight={700}>
          Notifications
        </Typography>
        <Button size="small" onClick={onMarkAllRead}>
          Mark All as Read
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={26} />
        </Box>
      ) : latestNotifications.length ? (
        <List disablePadding>
          {latestNotifications.map((notification) => (
            <ListItemButton
              key={notification.id}
              divider
              onClick={() => onMarkRead(notification.id)}
              sx={{ backgroundColor: notification.is_read ? "inherit" : "#F0F7FF" }}
            >
              <ListItemText
                primary={notification.message || "-"}
                secondary={`${notification.ticket_number || "-"} • ${prettyDate(notification.created_at)}`}
              />
              {!notification.is_read ? <Chip label="Unread" color="info" size="small" /> : null}
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Typography p={3} color="text.secondary">
          No notifications available.
        </Typography>
      )}
    </Paper>
  );
}
