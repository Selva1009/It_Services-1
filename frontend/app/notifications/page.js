"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Container, Snackbar, Stack, Typography } from "@mui/material";
import NotificationBell from "@/components/NotificationBell";
import NotificationList from "@/components/NotificationList";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationService";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: 1 } : item))
      );
    } catch (error) {
      setErrorMessage(error.message || "Unable to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: 1 })));
    } catch (error) {
      setErrorMessage(error.message || "Unable to update notifications");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
        <NotificationBell onClick={() => router.refresh()} />
      </Stack>

      <NotificationList
        notifications={notifications}
        loading={loading}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />

      <Snackbar open={Boolean(errorMessage)} autoHideDuration={3000} onClose={() => setErrorMessage("")}>
        <Alert severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
