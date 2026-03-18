"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Container, Snackbar } from "@mui/material";
import TicketForm from "@/components/TicketForm";
import { raiseTicket } from "@/services/ticketService";

const CATEGORIES = [
  "Hardware Support",
  "Operating System Support",
  "Networking Support",
  "Audio & Video Conferencing Support",
  "Antivirus & Malware Support",
  "Identity & Access Support",
  "Patch & Update Management",
  "Backup & Data Protection Support",
];

export default function RaiseTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      await raiseTicket(payload);
      setSuccessOpen(true);
      setTimeout(() => router.push("/tickets/list"), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box>
        <TicketForm categories={CATEGORIES} onSubmit={handleSubmit} loading={loading} />
      </Box>

      <Snackbar open={successOpen} autoHideDuration={2500} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" variant="filled">
          Ticket raised successfully.
        </Alert>
      </Snackbar>
    </Container>
  );
}
