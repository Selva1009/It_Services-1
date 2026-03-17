"use client";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api/config";
import Navbar from "../components/navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  InputAdornment,
  TextField,
  TablePagination,
} from "@mui/material";
import { Search, GroupOutlined } from "@mui/icons-material";
import "./vendorUsers.css";
import { useAuth } from "@/app/contexts/AuthContext";

const VendorUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { getAuthToken: getAuthTokenFromContext } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = getAuthTokenFromContext() || sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/vendor-admin/vendor-users`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.users);
        setTotal(data.total);
      } catch (error) {
        console.error("Error fetching vendor users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.includes(searchTerm)
  );

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = ["#4f6ef7", "#e05c97", "#f5a623", "#2ec4b6", "#8b5cf6", "#ef4444"];
  const getAvatarColor = (id) => avatarColors[id % avatarColors.length];

  return (
    <div className="vu-page">
      {/* <Navbar /> */}
      <div className="vu-container">

        {/* Header */}
        <div className="vu-header">
          <div className="vu-header-left">
            <div className="vu-icon-box">
              <GroupOutlined style={{ fontSize: 24, color: "#4f6ef7" }} />
            </div>
            <div>
              <h1 className="vu-title">Vendor Users</h1>
              <p className="vu-subtitle">
                {total} user{total !== 1 ? "s" : ""} in your organization
              </p>
            </div>
          </div>

          <TextField
            size="small"
            placeholder="Search name, email, designation..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search style={{ color: "#9ca3af", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 280,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                "& fieldset": { borderColor: "#e5e7eb" },
                "&:hover fieldset": { borderColor: "#4f6ef7" },
                "&.Mui-focused fieldset": { borderColor: "#4f6ef7" },
              },
            }}
          />
        </div>

        {/* Stats */}
        <div className="vu-stats-row">
          <div className="vu-stat-card">
            <span className="vu-stat-value">{total}</span>
            <span className="vu-stat-label">Total Users</span>
          </div>
          <div className="vu-stat-card">
            <span className="vu-stat-value">{filteredUsers.length}</span>
            <span className="vu-stat-label">Filtered Results</span>
          </div>
          <div className="vu-stat-card">
            <span className="vu-stat-value">
              {users.length > 0
                ? [...new Set(users.map((u) => u.designation))].length
                : 0}
            </span>
            <span className="vu-stat-label">Designations</span>
          </div>
        </div>

        {/* Table Card */}
        <div className="vu-table-card">
          {loading ? (
            <div className="vu-loading">
              <CircularProgress size={34} style={{ color: "#4f6ef7" }} />
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="vu-empty">
              <GroupOutlined style={{ fontSize: 52, color: "#d1d5db" }} />
              <p className="vu-empty-title">No users found</p>
              <p className="vu-empty-sub">
                {searchTerm ? "Try a different search term" : "No users added yet"}
              </p>
            </div>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow className="vu-thead-row">
                      {["#", "User", "Email", "Mobile", "Designation", "Joined On"].map((h) => (
                        <TableCell key={h} className="vu-th">{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user, index) => (
                      <TableRow key={user.id} className="vu-tr">
                        <TableCell className="vu-td">
                          <span className="vu-serial">{page * rowsPerPage + index + 1}</span>
                        </TableCell>

                        <TableCell className="vu-td">
                          <div className="vu-user-cell">
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: getAvatarColor(user.id),
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(user.name)}
                            </Avatar>
                            <span className="vu-user-name">{user.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className="vu-td">
                          <a href={`mailto:${user.email}`} className="vu-email">
                            {user.email}
                          </a>
                        </TableCell>

                        <TableCell className="vu-td">
                          <span className="vu-mobile">{user.mobile}</span>
                        </TableCell>

                        <TableCell className="vu-td">
                          <Chip
                            label={user.designation}
                            size="small"
                            sx={{
                              backgroundColor: "#f0f4ff",
                              color: "#4f6ef7",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              fontFamily: "'DM Sans', sans-serif",
                              border: "1px solid #c7d4fd",
                              borderRadius: "6px",
                              height: "26px",
                            }}
                          />
                        </TableCell>

                        <TableCell className="vu-td">
                          <span className="vu-date">{formatDate(user.created_at)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredUsers.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                  borderTop: "1px solid #f3f4f6",
                  "& *": { fontFamily: "'DM Sans', sans-serif !important" },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  },
                }}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default VendorUsersPage;
