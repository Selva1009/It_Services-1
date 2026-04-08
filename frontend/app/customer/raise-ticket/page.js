"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import TerminalIcon from "@mui/icons-material/Terminal";
import WifiIcon from "@mui/icons-material/Wifi";
import VideocamIcon from "@mui/icons-material/Videocam";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import BackupIcon from "@mui/icons-material/Backup";
import Navbar from "../components/Navbar";
import CategoryMenu from "../components/Categories";
import Footer from "@/app/LandingPage/Footer";
import { useAuth } from "@/app/contexts/AuthContext";
import { toApiUrl } from "@/lib/api/config";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import "./RaiseTicket.css";

const categories = [
  {
    name: "Hardware Support",
    desc: "Devices, peripherals, printers, monitors",
    icon: ComputerIcon,
  },
  {
    name: "Operating System Support",
    desc: "OS errors, updates, performance issues",
    icon: TerminalIcon,
  },
  {
    name: "Networking Support",
    desc: "Connectivity, VPN, DNS, LAN issues",
    icon: WifiIcon,
  },
  {
    name: "Audio & Video Conferencing Support",
    desc: "Camera, mic, screen sharing issues",
    icon: VideocamIcon,
  },
  {
    name: "Antivirus & Malware Support",
    desc: "Threats, endpoint protection, scans",
    icon: SecurityIcon,
  },
  {
    name: "Identity & Access Support",
    desc: "Login, passwords, MFA, account access",
    icon: LockIcon,
  },
  {
    name: "Backup & Data Protection Support",
    desc: "Backup failures, restore requests",
    icon: BackupIcon,
  },
];

const subCategoryMap = {
  "Hardware Support": [
    "Device not powering ON",
    "Battery charging issues",
    "System slow performance",
    "External monitor not detected",
    "Keyboard or mouse not working",
    "USB device not detected",
    "Printer offline",
    "Webcam not detected",
  ],
  "Operating System Support": [
    "Login failure",
    "Account lockout",
    "Slow OS response",
    "Startup application issues",
    "Display settings",
    "Pending update troubleshooting",
    "OS corruption",
    "Blue screen errors",
    "OS reinstallation",
  ],
  "Networking Support": [
    "WiFi connectivity issues",
    "LAN connectivity issues",
    "IP renewal or refresh",
    "Slow internet",
    "VPN connection assistance",
    "Proxy configuration",
    "DNS configuration issues",
    "DHCP failure",
  ],
  "Audio & Video Conferencing Support": [
    "No audio during meetings",
    "Microphone not detected",
    "Camera not working",
    "Echo or feedback issues",
    "Screen sharing issues",
    "Headset configuration",
  ],
  "Antivirus & Malware Support": [
    "Antivirus not updating",
    "Antivirus scan not running",
    "False positive alerts",
    "Malware infection removal",
    "Ransomware containment",
    "Endpoint isolation",
  ],
  "Identity & Access Support": [
    "Domain login issues",
    "Password reset",
    "MFA failures",
    "Account lockouts",
    "Certificate authentication failures",
  ],
  "Backup & Data Protection Support": [
    "Backup alerts",
    "Backup agent not running",
    "Restore request",
    "Backup corruption",
    "Restore failure",
  ],
};

const priorityOptions = ["Low", "Medium", "High", "Critical"];
const supportLevels = ["L1", "L2", "L3"];

const priorityClassMap = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Critical: "priority-critical",
};

export default function RaiseTicketPage() {
  const { auth, getAuthToken } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subCategory, setSubCategory] = useState("");
  const [supportLevel, setSupportLevel] = useState("L1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);
  const token = getAuthToken() || auth?.authToken || null;

  const subCategories = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }
    return subCategoryMap[selectedCategory] || [];
  }, [selectedCategory]);

  useEffect(() => {
    setSubCategory("");
  }, [selectedCategory]);

  const openDialog = (categoryName) => {
    setSelectedCategory(categoryName);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setSubCategory("");
    setSupportLevel("L1");
    setTitle("");
    setDescription("");
    setPriority("Medium");
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !subCategory || !title.trim() || !description.trim()) {
      Swal.fire("Error", "Please fill all required fields.", "error");
      return;
    }

    setSubmitting(true);

    try {
      if (!token) {
        Swal.fire("Error", "Session expired. Please sign in again.", "error");
        return;
      }

      const response = await axios.post(
        toApiUrl(API_ENDPOINTS.tickets.raise),
        {
          category: selectedCategory,
          subCategory,
          supportLevel,
          title,
          description,
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("Success", `Ticket ${response.data.ticketNumber} raised successfully`, "success");
      closeDialog();
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="raise-ticket-page">
      <Navbar
        setSearchQuery={() => {}}
        setCategoryFilter={() => {}}
        setPriceFilter={() => {}}
        disableFilters
        disableSearch
      />

      <div className="customer-offset">
        <CategoryMenu setCategoryFilter={() => {}} />
      </div>

      <div className="page-header">
        <h1>Raise a Support Ticket</h1>
        <p>Select a service category and submit your issue details.</p>
      </div>

      <div className="category-grid">
        {categories.map((category) => {
          const Icon = category.icon;
          const selected = selectedCategory === category.name;

          return (
            <div
              key={category.name}
              className={`category-card${selected ? " selected" : ""}`}
              onClick={() => openDialog(category.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  openDialog(category.name);
                }
              }}
            >
              <div className="category-icon">
                <Icon className="category-icon-svg" />
              </div>
              <h3>{category.name}</h3>
              <p>{category.desc}</p>
            </div>
          );
        })}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        className="ticket-dialog"
      >
        <DialogTitle>{`Raise Ticket - ${selectedCategory || ""}`}</DialogTitle>
        <DialogContent className="ticket-dialog-content">
          <div className="form-group">
            <FormControl fullWidth required>
              <InputLabel id="sub-category-label">Sub Category</InputLabel>
              <Select
                labelId="sub-category-label"
                value={subCategory}
                label="Sub Category"
                onChange={(event) => setSubCategory(event.target.value)}
              >
                {subCategories.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="support-level-label">Support Level</InputLabel>
              <Select
                labelId="support-level-label"
                value={supportLevel}
                label="Support Level"
                onChange={(event) => setSupportLevel(event.target.value)}
              >
                {supportLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <span className="support-helper">L1 - Basic  L2 - Technical  L3 - Vendor level</span>
          </div>

          <div className="form-group">
            <TextField
              label="Title"
              placeholder="Brief summary of your issue"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              fullWidth
            />
          </div>

          <div className="form-group">
            <TextField
              label="Description"
              placeholder="Describe your issue in detail"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              fullWidth
              multiline
              rows={4}
            />
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={priority}
                label="Priority"
                onChange={(event) => setPriority(event.target.value)}
                renderValue={(value) => (
                  <Chip
                    label={value}
                    className={`priority-chip ${priorityClassMap[value] || "priority-medium"}`}
                  />
                )}
              >
                {priorityOptions.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions className="dialog-actions">
          <Button className="btn-outline" variant="outlined" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            className="btn-primary"
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} className="btn-spinner" /> : "Raise Ticket"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
}
