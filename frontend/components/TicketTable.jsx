"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

const PRIORITY_COLORS = {
  Low: "success",
  Medium: "warning",
  High: "error",
  Critical: "error",
};

const STATUS_COLORS = {
  Open: "default",
  Assigned: "info",
  "In Progress": "primary",
  Escalated: "warning",
  Resolved: "success",
  Closed: "success",
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TicketTable({ rows = [], columns = [], loading = false, onView }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const visibleRows = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
        <Typography color="text.secondary">No tickets found.</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} sx={{ fontWeight: 700 }}>
                  {column.label}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow hover key={row.id}>
                {columns.map((column) => {
                  const value = row[column.key];
                  if (column.key === "priority") {
                    return (
                      <TableCell key={column.key}>
                        <Chip size="small" label={value || "-"} color={PRIORITY_COLORS[value] || "default"} />
                      </TableCell>
                    );
                  }
                  if (column.key === "status") {
                    return (
                      <TableCell key={column.key}>
                        <Chip size="small" label={value || "-"} color={STATUS_COLORS[value] || "default"} />
                      </TableCell>
                    );
                  }
                  if (column.type === "date") {
                    return <TableCell key={column.key}>{formatDate(value)}</TableCell>;
                  }
                  return <TableCell key={column.key}>{value || "-"}</TableCell>;
                })}
                <TableCell>
                  <Button size="small" onClick={() => onView(row.id)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Paper>
  );
}
