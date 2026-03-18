"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuth } from "@/app/contexts/AuthContext";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import { apiRequest } from "@/app/services/apiClient";
import { fetchItAdminTickets } from "@/app/services/customerAdminService";
import "./AdminTickets.css";

const STATUS_OPTIONS = ["All", "Open", "Assigned", "In Progress", "Escalated", "Resolved", "Closed"];
const PRIORITY_OPTIONS = ["All", "High", "Medium", "Low"];

const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };
const STATUS_ORDER = {
  Open: 1,
  Assigned: 2,
  "In Progress": 3,
  Escalated: 4,
  Resolved: 5,
  Closed: 6,
};

const getPriorityColor = (priority) => {
  if (priority === "High") return "error";
  if (priority === "Medium") return "warning";
  if (priority === "Low") return "success";
  return "default";
};

const getStatusColor = (status) => {
  if (status === "In Progress") return "info";
  if (status === "Resolved") return "success";
  if (status === "Closed") return "default";
  if (status === "Escalated") return "error";
  return "default";
};

const toDateTime = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const date = toDateTime(value);
  if (!date) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminTicketsPage() {
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken() || auth?.authToken || null;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([{ field: "createdAt", sort: "desc" }]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const fetchedTokenRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadTickets = useCallback(async () => {
    if (!token) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetchItAdminTickets(token);
      setTickets(Array.isArray(response?.tickets) ? response.tickets : []);
    } catch (err) {
      setError(err.message || "Failed to load tickets.");
      setTickets([]);
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
    loadTickets();
  }, [token, loadTickets]);

  const filteredRows = useMemo(() => {
    return tickets
      .filter((ticket) => {
        const createdAt = toDateTime(ticket.created_at);
        const dateValue = createdAt ? createdAt.toISOString().slice(0, 10) : "";

        const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter;
        const matchesDate = !dateFilter || dateValue === dateFilter;
        const matchesSearch =
          !debouncedSearch ||
          String(ticket.ticket_number || "").toLowerCase().includes(debouncedSearch) ||
          String(ticket.title || "").toLowerCase().includes(debouncedSearch) ||
          String(ticket.vendor_company || "").toLowerCase().includes(debouncedSearch);

        return matchesStatus && matchesPriority && matchesDate && matchesSearch;
      })
      .map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticket_number || "-",
        title: ticket.title || "-",
        category: ticket.category || "-",
        vendorCompany: ticket.vendor_company || "-",
        assignedVendorUser: ticket.assigned_vendor_user || "Unassigned",
        priority: ticket.priority || "Medium",
        status: ticket.status || "Open",
        latestComment: ticket.latest_comment || "-",
        lastActivityTime: ticket.latest_activity_at || ticket.updated_at || ticket.created_at,
        createdAt: ticket.created_at,
        raw: ticket,
      }));
  }, [tickets, statusFilter, priorityFilter, dateFilter, debouncedSearch]);

  const openTicketDetail = useCallback(async (row) => {
    if (!token || !row?.id) return;
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const response = await apiRequest({
        path: `/api/tickets/${row.id}/detail`,
        token,
      });
      setSelectedTicket(response?.ticket || null);
      setActivity(Array.isArray(response?.activity) ? response.activity : []);
    } catch {
      setSelectedTicket(row.raw || null);
      setActivity([]);
    } finally {
      setDetailLoading(false);
    }
  }, [token]);

  const columns = useMemo(
    () => [
      { field: "ticketNumber", headerName: "Ticket Number", flex: 1, minWidth: 150 },
      { field: "title", headerName: "Title", flex: 1.3, minWidth: 200 },
      { field: "category", headerName: "Category", flex: 1, minWidth: 130 },
      { field: "vendorCompany", headerName: "Vendor Company", flex: 1.2, minWidth: 180 },
      { field: "assignedVendorUser", headerName: "Assigned Vendor User", flex: 1.2, minWidth: 190 },
      {
        field: "priority",
        headerName: "Priority",
        minWidth: 120,
        flex: 0.8,
        sortComparator: (a, b) => (PRIORITY_ORDER[a] || 0) - (PRIORITY_ORDER[b] || 0),
        renderCell: (params) => (
          <Chip
            label={params.value}
            size="small"
            color={getPriorityColor(params.value)}
            variant="outlined"
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 130,
        flex: 0.9,
        sortComparator: (a, b) => (STATUS_ORDER[a] || 0) - (STATUS_ORDER[b] || 0),
        renderCell: (params) => (
          <Chip label={params.value} size="small" color={getStatusColor(params.value)} variant="filled" />
        ),
      },
      { field: "latestComment", headerName: "Latest Comment", flex: 1.4, minWidth: 220 },
      {
        field: "lastActivityTime",
        headerName: "Last Activity Time",
        flex: 1,
        minWidth: 170,
        renderCell: (params) => formatDate(params.value),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        minWidth: 100,
        getActions: (params) => [
          <GridActionsCellItem
            key={`view-${params.id}`}
            icon={<VisibilityIcon fontSize="small" />}
            label="View"
            onClick={() => openTicketDetail(params.row)}
          />,
        ],
      },
    ],
    [openTicketDetail]
  );

  return (
    <Box className="it-admin-tickets-page">
      <CustomerAdminNavbar />

      <Box className="it-admin-content">
        <Typography variant="h4" className="it-admin-title">
          IT Admin Tickets
        </Typography>
        <Typography className="it-admin-subtitle">
          All tickets raised by IT users under your company.
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} className="it-admin-filters">
          <TextField
            label="Search"
            placeholder="Ticket number, title, vendor company"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            fullWidth
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(event) => setStatusFilter(event.target.value)}>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="Created Date"
            InputLabelProps={{ shrink: true }}
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          />

          <Button
            variant="outlined"
            onClick={() => {
              setStatusFilter("All");
              setPriorityFilter("All");
              setDateFilter("");
              setSearchInput("");
            }}
          >
            Reset
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box className="it-admin-grid-wrapper">
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pagination
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            getRowHeight={() => "auto"}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc", fontWeight: 600 },
              "& .MuiDataGrid-cell": { alignItems: "center", py: 1 },
              "& .MuiDataGrid-overlay": { fontFamily: "DM Sans, sans-serif" },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box className="it-admin-empty-state">No tickets found for the selected filters.</Box>
              ),
              loadingOverlay: () => (
                <Box className="it-admin-loading-state">
                  <CircularProgress size={24} />
                  <Typography>Loading tickets...</Typography>
                </Box>
              ),
            }}
          />
        </Box>
      </Box>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <Box className="it-admin-loading-state">
              <CircularProgress size={24} />
              <Typography>Loading ticket details...</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              <Typography>
                <strong>Ticket:</strong> {selectedTicket?.ticket_number || "-"}
              </Typography>
              <Typography>
                <strong>Title:</strong> {selectedTicket?.title || "-"}
              </Typography>
              <Typography>
                <strong>Description:</strong> {selectedTicket?.description || "-"}
              </Typography>
              <Typography>
                <strong>Vendor Company:</strong> {selectedTicket?.vendor_company || "-"}
              </Typography>
              <Typography>
                <strong>Latest Comment:</strong> {selectedTicket?.latest_comment || "-"}
              </Typography>

              <Box>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  Activity
                </Typography>
                {activity.length === 0 ? (
                  <Typography color="text.secondary">No activity found.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {activity.map((item) => (
                      <Box key={item.id} className="it-admin-activity-item">
                        <Typography fontWeight={600}>{item.message || "-"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item.created_at)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
