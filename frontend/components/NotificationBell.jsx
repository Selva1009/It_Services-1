"use client";

import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge, IconButton } from "@mui/material";
import { getUnreadCount } from "@/services/notificationService";

export default function NotificationBell({ onClick }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadUnread = async () => {
      try {
        const response = await getUnreadCount();
        if (mounted) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <IconButton onClick={onClick}>
      <Badge color="error" badgeContent={unreadCount}>
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
}
