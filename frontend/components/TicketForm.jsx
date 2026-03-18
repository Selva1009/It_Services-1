"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const DEFAULT_FORM = {
  category: "",
  subCategory: "",
  supportLevel: "L1",
  title: "",
  description: "",
  priority: "Medium",
};

const PRIORITIES = ["Low", "Medium", "High"];
const SUPPORT_LEVELS = ["L1", "L2", "L3"];

export default function TicketForm({ categories = [], onSubmit, loading = false }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const categoryOptions = useMemo(
    () => (Array.isArray(categories) && categories.length ? categories : ["Hardware Support", "Network Support"]),
    [categories]
  );

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.category) next.category = "Category is required";
    if (!form.subCategory.trim()) next.subCategory = "Sub category is required";
    if (!form.supportLevel) next.supportLevel = "Support level is required";
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.priority) next.priority = "Priority is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    try {
      await onSubmit({
        category: form.category,
        subCategory: form.subCategory.trim(),
        supportLevel: form.supportLevel,
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      setForm(DEFAULT_FORM);
      setErrors({});
    } catch (error) {
      setSubmitError(error.message || "Unable to raise ticket");
    }
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Raise Ticket
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}

            <FormControl fullWidth error={Boolean(errors.category)}>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => setField("category", e.target.value)}
              >
                {categoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Sub Category"
              value={form.subCategory}
              onChange={(e) => setField("subCategory", e.target.value)}
              error={Boolean(errors.subCategory)}
              helperText={errors.subCategory}
              fullWidth
            />

            <FormControl fullWidth error={Boolean(errors.supportLevel)}>
              <InputLabel>Support Level</InputLabel>
              <Select
                value={form.supportLevel}
                label="Support Level"
                onChange={(e) => setField("supportLevel", e.target.value)}
              >
                {SUPPORT_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title}
              fullWidth
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description}
              fullWidth
              multiline
              minRows={4}
            />

            <FormControl fullWidth error={Boolean(errors.priority)}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={form.priority}
                label="Priority"
                onChange={(e) => setField("priority", e.target.value)}
              >
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Submitting..." : "Raise Ticket"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
