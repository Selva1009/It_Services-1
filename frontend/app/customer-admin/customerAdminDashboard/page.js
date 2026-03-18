"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchItAdminTickets, fetchItAdminUsersSummary } from "@/app/services/customerAdminService";
import "./customerAdminDashboard.css";

const TicketsRaisedChart = dynamic(() => import("./TicketsRaisedChart"), {
  ssr: false,
  loading: () => <div className="it-admin-chart-loading">Loading chart...</div>,
});

const TicketStatusChart = dynamic(() => import("./TicketStatusChart"), {
  ssr: false,
  loading: () => <div className="it-admin-chart-loading">Loading chart...</div>,
});

const TicketPriorityChart = dynamic(() => import("./TicketPriorityChart"), {
  ssr: false,
  loading: () => <div className="it-admin-chart-loading">Loading chart...</div>,
});

const STATUS_BUCKETS = ["Open", "Assigned", "In Progress", "Escalated", "Resolved", "Closed"];
const PRIORITY_BUCKETS = ["High", "Medium", "Low"];

const toDateKey = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const formatDay = (value) => {
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export default function CustomerAdminDashboard() {
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken() || auth?.authToken || null;

  const [tickets, setTickets] = useState([]);
  const [userSummary, setUserSummary] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchedTokenRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setTickets([]);
      setUserSummary({ total: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [ticketResponse, usersResponse] = await Promise.all([
        fetchItAdminTickets(token),
        fetchItAdminUsersSummary(token),
      ]);

      setTickets(Array.isArray(ticketResponse?.tickets) ? ticketResponse.tickets : []);
      setUserSummary({ total: Number(usersResponse?.total || usersResponse?.users?.length || 0) });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
      setTickets([]);
      setUserSummary({ total: 0 });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      fetchedTokenRef.current = null;
      return;
    }

    if (fetchedTokenRef.current === token) return;
    fetchedTokenRef.current = token;
    loadDashboard();
  }, [token, loadDashboard]);

  const ticketsRaisedSeries = useMemo(() => {
    const counts = tickets.reduce((acc, ticket) => {
      const key = toDateKey(ticket.created_at);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sortedDates = Object.keys(counts).sort((a, b) => new Date(a) - new Date(b));

    return {
      labels: sortedDates.map(formatDay),
      values: sortedDates.map((date) => counts[date]),
    };
  }, [tickets]);

  const statusDistribution = useMemo(() => {
    const counts = STATUS_BUCKETS.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    tickets.forEach((ticket) => {
      const key = ticket.status || "Open";
      if (counts[key] !== undefined) counts[key] += 1;
    });

    return {
      labels: STATUS_BUCKETS,
      values: STATUS_BUCKETS.map((status) => counts[status]),
    };
  }, [tickets]);

  const priorityDistribution = useMemo(() => {
    const counts = PRIORITY_BUCKETS.reduce((acc, priority) => {
      acc[priority] = 0;
      return acc;
    }, {});

    tickets.forEach((ticket) => {
      const key = ticket.priority || "Medium";
      if (counts[key] !== undefined) counts[key] += 1;
    });

    return {
      labels: PRIORITY_BUCKETS,
      values: PRIORITY_BUCKETS.map((priority) => counts[priority]),
    };
  }, [tickets]);

  return (
    <Box className="it-admin-dashboard-page">
      <CustomerAdminNavbar />

      <Box className="it-admin-dashboard-main">
        <Typography variant="h4" className="it-admin-dashboard-title">
          IT Admin Dashboard
        </Typography>
        <Typography className="it-admin-dashboard-subtitle">
          Company-level ticket visibility and trends.
        </Typography>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {loading ? (
          <Box className="it-admin-dashboard-loading">
            <CircularProgress size={26} />
            <Typography>Loading dashboard...</Typography>
          </Box>
        ) : (
          <>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box className="it-admin-top-card">
                <Typography className="it-admin-top-card-label">Total Users</Typography>
                <Typography className="it-admin-top-card-value">{userSummary.total}</Typography>
              </Box>

              <Box className="it-admin-top-card">
                <Typography className="it-admin-top-card-label">Total Tickets</Typography>
                <Typography className="it-admin-top-card-value">{tickets.length}</Typography>
              </Box>
            </Stack>

            <Box className="it-admin-charts-grid">
              <Box className="it-admin-chart-card">
                <Typography className="it-admin-chart-title">Tickets Raised</Typography>
                <div className="it-admin-chart-box">
                  <TicketsRaisedChart
                    labels={ticketsRaisedSeries.labels}
                    values={ticketsRaisedSeries.values}
                  />
                </div>
              </Box>

              <Box className="it-admin-chart-card">
                <Typography className="it-admin-chart-title">Ticket Status Distribution</Typography>
                <div className="it-admin-chart-box">
                  <TicketStatusChart
                    labels={statusDistribution.labels}
                    values={statusDistribution.values}
                  />
                </div>
              </Box>

              <Box className="it-admin-chart-card">
                <Typography className="it-admin-chart-title">Priority Distribution</Typography>
                <div className="it-admin-chart-box">
                  <TicketPriorityChart
                    labels={priorityDistribution.labels}
                    values={priorityDistribution.values}
                  />
                </div>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
