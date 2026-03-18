"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Pagination,
  Select,
  TextField,
} from "@mui/material";
import ComputerIcon from "@mui/icons-material/Computer";
import TerminalIcon from "@mui/icons-material/Terminal";
import WifiIcon from "@mui/icons-material/Wifi";
import VideocamIcon from "@mui/icons-material/Videocam";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import BackupIcon from "@mui/icons-material/Backup";
import GroupsIcon from "@mui/icons-material/Groups";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import Navbar from "../components/Navbar";
import CategoryMenu from "../components/Categories";
import Footer from "@/app/LandingPage/Footer";
import { useAuth } from "@/app/contexts/AuthContext";
import "./CustomerHome.css";

const PRIORITY_CLASS = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Critical: "priority-critical",
};

const STATUS_CLASS = {
  Open: "status-open",
  Assigned: "status-assigned",
  "In Progress": "status-progress",
  InProgress: "status-progress",
  Escalated: "status-escalated",
  Resolved: "status-resolved",
  Closed: "status-closed",
};

const priorityOptions = ["Low", "Medium", "High", "Critical"];
const supportLevels = ["L1", "L2", "L3"];
const servicesPerPage = 6;

const serviceCatalog = [
  {
    name: "Hardware Support",
    desc: "Devices, peripherals, diagnostics, and OEM hardware escalations.",
    icon: ComputerIcon,
    toneClass: "tone-blue",
    levels: {
      L1: [
        "Device not powering ON",
        "Power cable or adapter verification",
        "Battery charging issues",
        "Restart loop basic diagnosis",
        "Sleep or hibernate issues",
        "System slow performance",
        "Intermittent freezing",
        "External monitor not detected",
        "Resolution or scaling issues",
        "Speaker or microphone not working",
        "Webcam not detected",
        "Keyboard or mouse not working",
        "USB device not detected",
        "Docking station connectivity issues",
        "Printer offline",
        "Print queue stuck",
        "Scanner not detected",
        "Basic printer configuration",
      ],
      L2: [
        "Motherboard failure",
        "POST failure",
        "BIOS corruption",
        "Hardware error codes",
        "System board replacement",
        "SSD/HDD failure",
        "Disk errors",
        "Disk not detected",
        "RAID failure or rebuild",
        "RAM failure",
        "Memory slot issues",
        "CPU hardware failure",
        "Power supply failure",
        "Charging port failure",
        "Internal power circuit issues",
        "UPS battery or board failure",
        "LCD panel replacement",
        "Backlight failure",
        "GPU hardware failure",
        "Display cable replacement",
        "Fan failure",
        "Thermal sensor failure",
        "Heat sink replacement",
        "USB port failure",
        "LAN port failure",
        "HDMI port failure",
        "Audio jack failure",
        "Dock connector failure",
        "Fuser assembly failure",
        "Roller replacement",
        "Print head failure",
        "Mechanical motor issues",
      ],
      L3: [
        "Hardware design defects",
        "Recurring component failure analysis",
        "Firmware-level hardware faults",
        "Microcode or chipset issues",
        "OEM engineering diagnostics",
        "Product recall cases",
      ],
    },
  },
  {
    name: "Operating System Support",
    desc: "OS health, boot issues, patch stability, and vendor-level defects.",
    icon: TerminalIcon,
    toneClass: "tone-purple",
    levels: {
      L1: [
        "Login failure",
        "Account lockout",
        "User profile loading issues",
        "Slow operating system response",
        "Startup application issues",
        "Display settings configuration",
        "Language or regional settings",
        "Time synchronization issues",
        "Pending update troubleshooting",
        "Driver reinstall assistance",
      ],
      L2: [
        "OS corruption",
        "Blue screen errors",
        "Kernel crashes",
        "OS reinstallation",
        "System image restoration",
        "Bootloader repair",
        "Encryption recovery issues",
      ],
      L3: [
        "OS kernel defects",
        "Persistent system crashes after patching",
        "OS security vulnerabilities",
        "Vendor-level bug fixes",
        "OS patch engineering escalation",
      ],
    },
  },
  {
    name: "Networking Support",
    desc: "Connectivity, routing, infrastructure, and vendor TAC escalations.",
    icon: WifiIcon,
    toneClass: "tone-cyan",
    levels: {
      L1: [
        "WiFi connectivity issues",
        "LAN connectivity issues",
        "IP renewal or refresh",
        "Limited connectivity messages",
        "Slow internet complaints",
        "VPN connection assistance",
        "Proxy configuration checks",
      ],
      L2: [
        "Switch port failure",
        "Router hardware malfunction",
        "Access point failure",
        "Firewall issues",
        "VLAN configuration problems",
        "Routing issues",
        "DHCP failure",
        "DNS configuration issues",
        "Packet loss investigation",
        "Wireless interference troubleshooting",
      ],
      L3: [
        "Firmware defects in network devices",
        "Routing protocol defects",
        "Hardware-software incompatibility",
        "Vendor TAC escalation",
        "Advanced packet-level analysis",
      ],
    },
  },
  {
    name: "Audio & Video Conferencing Support",
    desc: "Meeting audio-video setup, conference hardware, and codec reliability.",
    icon: VideocamIcon,
    toneClass: "tone-orange",
    levels: {
      L1: [
        "No audio during meetings",
        "Microphone not detected",
        "Camera not working",
        "Echo or feedback issues",
        "Video not displaying",
        "Screen sharing issues",
        "Headset configuration issues",
      ],
      L2: [
        "Conference hardware failure",
        "Camera replacement",
        "Microphone array failure",
        "Speaker system failure",
        "Codec configuration issues",
        "AV controller failures",
      ],
      L3: [
        "Firmware defects in conferencing systems",
        "Codec compatibility issues",
        "Manufacturer-level hardware failures",
        "Integration defects",
      ],
    },
  },
  {
    name: "Antivirus & Malware Support",
    desc: "Endpoint security, malware remediation, and advanced threat response.",
    icon: SecurityIcon,
    toneClass: "tone-red",
    levels: {
      L1: [
        "Antivirus not updating",
        "Antivirus scan not running",
        "Endpoint agent disconnected",
        "False positive alerts",
        "Basic malware scan initiation",
      ],
      L2: [
        "Malware infection removal",
        "Ransomware containment",
        "Endpoint isolation",
        "Antivirus agent corruption",
        "Advanced threat remediation",
      ],
      L3: [
        "Advanced malware investigation",
        "Zero-day vulnerability handling",
        "Endpoint protection engine failures",
        "Security signature defects",
      ],
    },
  },
  {
    name: "Identity & Access Support",
    desc: "Authentication, MFA, policy sync, and directory architecture support.",
    icon: LockIcon,
    toneClass: "tone-green",
    levels: {
      L1: [
        "Domain login issues",
        "Password reset assistance",
        "MFA failures",
        "Account lockouts",
      ],
      L2: [
        "Domain trust issues",
        "Certificate authentication failures",
        "Policy synchronization failures",
      ],
      L3: [
        "Directory service corruption",
        "Authentication architecture failures",
        "Federation or certificate infrastructure issues",
      ],
    },
  },
  {
    name: "Patch & Update Management",
    desc: "Update lifecycle support from basic install to vendor patch defects.",
    icon: SystemUpdateAltIcon,
    toneClass: "tone-teal",
    levels: {
      L1: [
        "Update installation assistance",
        "Restart scheduling issues",
        "Update pending notifications",
      ],
      L2: [
        "Patch failure causing instability",
        "Update rollback",
        "Firmware compatibility conflicts",
      ],
      L3: [
        "OS patch engineering escalation",
        "Vendor patch defects",
      ],
    },
  },
  {
    name: "Backup & Data Protection Support",
    desc: "Backup health, restore workflows, and engineering-level recovery support.",
    icon: BackupIcon,
    toneClass: "tone-violet",
    levels: {
      L1: [
        "Backup alerts",
        "Backup agent not running",
        "Restore request initiation",
      ],
      L2: [
        "Backup corruption",
        "Restore failure",
        "Backup storage failure",
        "Recovery validation issues",
      ],
      L3: [
        "Backup engine defects",
        "Data recovery engineering support",
        "Vendor-level restore failures",
      ],
    },
  },
  {
    name: "Collaboration Tools Support",
    desc: "Email, calendar, plugin, and collaboration platform reliability support.",
    icon: GroupsIcon,
    toneClass: "tone-indigo",
    levels: {
      L1: [
        "Email synchronization issues",
        "Calendar synchronization issues",
        "Meeting plugin issues",
        "Notification issues",
      ],
      L2: [
        "Persistent synchronization failures",
        "Client integration issues",
        "Policy configuration failures",
      ],
      L3: [
        "Service-side defects",
        "API or integration failures",
        "Vendor-side outages",
      ],
    },
  },
  {
    name: "Asset Lifecycle Support",
    desc: "Asset onboarding, lifecycle tracking, and OEM replacement escalation.",
    icon: Inventory2Icon,
    toneClass: "tone-pink",
    levels: {
      L1: [
        "Asset allocation assistance",
        "Device handover support",
        "Asset tagging verification",
        "Asset record update request",
      ],
      L2: [
        "Asset repair coordination",
        "Warranty lifecycle tracking",
        "Device replacement planning",
      ],
      L3: [
        "OEM asset replacement escalation",
        "Vendor lifecycle disputes",
      ],
    },
  },
  {
    name: "Environmental & Infrastructure Support",
    desc: "Power, cooling, workspace, and infrastructure design-level incidents.",
    icon: ApartmentIcon,
    toneClass: "tone-slate",
    levels: {
      L1: [
        "Overheating due to ventilation",
        "Power fluctuation complaints",
        "Workspace setup concerns",
      ],
      L2: [
        "Electrical grounding issues",
        "Rack cooling failure",
        "UPS load imbalance",
      ],
      L3: [
        "Design-level infrastructure issues",
        "Capacity architecture failures",
        "Environmental engineering defects",
      ],
    },
  },
  {
    name: "Software-Hardware Compatibility Support",
    desc: "Compatibility diagnostics for drivers, firmware, and upgrade planning.",
    icon: SettingsSuggestIcon,
    toneClass: "tone-amber",
    levels: {
      L1: [
        "Driver compatibility issues",
        "Software not detecting hardware",
        "Peripheral compatibility issues",
      ],
      L2: [
        "Driver conflicts causing crashes",
        "Hardware capacity mismatch",
        "Upgrade recommendations",
      ],
      L3: [
        "Driver engineering issues",
        "Firmware conflicts requiring vendor patch",
        "Compatibility defects requiring vendor updates",
      ],
    },
  },
];

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/support/g, "")
    .replace(/[^a-z0-9]/g, "");

export default function CustomerSupportHomePage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subCategory, setSubCategory] = useState("");
  const [supportLevel, setSupportLevel] = useState("L1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [servicePage, setServicePage] = useState(1);
  const [userName, setUserName] = useState("User");
  const [openCount, setOpenCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [myTickets, setMyTickets] = useState([]);
  const servicesRef = useRef(null);
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken() || auth?.authToken || null;
  const submitToken = token;

  const selectedService = useMemo(() => {
    return serviceCatalog.find((service) => service.name === selectedCategory) || null;
  }, [selectedCategory]);

  const subCategories = useMemo(() => {
    if (!selectedService) {
      return [];
    }

    return selectedService.levels[supportLevel] || [];
  }, [selectedService, supportLevel]);

  const filteredServices = useMemo(() => {
    const categoryQuery = normalizeText(categoryFilter);

    return serviceCatalog.filter((service) => {
      const matchesLevel = levelFilter === "All" || (service.levels[levelFilter] || []).length > 0;
      if (!matchesLevel) {
        return false;
      }

      if (!categoryQuery) {
        return true;
      }

      const nameMatch = normalizeText(service.name).includes(categoryQuery);
      if (nameMatch) {
        return true;
      }

      const levelValues = ["L1", "L2", "L3"];
      return levelValues.some((level) =>
        (service.levels[level] || []).some((item) => normalizeText(item).includes(categoryQuery))
      );
    });
  }, [categoryFilter, levelFilter]);

  const paginatedServices = useMemo(() => {
    const start = (servicePage - 1) * servicesPerPage;
    return filteredServices.slice(start, start + servicesPerPage);
  }, [filteredServices, servicePage]);

  const totalServicePages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredServices.length / servicesPerPage));
  }, [filteredServices.length]);

  const recentTickets = useMemo(() => {
    if (!Array.isArray(myTickets)) {
      return [];
    }

    return myTickets.slice(0, 5);
  }, [myTickets]);

  useEffect(() => {
    const resolvedUserName =
      auth?.customerUser?.name ||
      auth?.customer?.name ||
      auth?.userName ||
      "User";

    setUserName(resolvedUserName);
  }, [auth?.customerUser?.name, auth?.customer?.name, auth?.userName]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tickets/my-count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response?.data || {};
        setOpenCount(data.open || data.openCount || data?.counts?.open || 0);
        setResolvedCount(data.resolved || data.resolvedCount || data?.counts?.resolved || 0);
      } catch {
        setOpenCount(0);
        setResolvedCount(0);
      }
    };

    const loadMyTickets = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tickets/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMyTickets(response.data.tickets || []);
      } catch {
        setMyTickets([]);
      }
    };

    if (token) {
      loadCounts();
      loadMyTickets();
    }
  }, [token]);

  useEffect(() => {
    setSubCategory("");
  }, [selectedCategory, supportLevel]);

  useEffect(() => {
    setServicePage(1);
  }, [categoryFilter, levelFilter]);

  useEffect(() => {
    if (servicePage > totalServicePages) {
      setServicePage(totalServicePages);
    }
  }, [servicePage, totalServicePages]);

  const scrollToServices = () => {
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openDialog = (categoryName) => {
    setSelectedCategory(categoryName);
    setDialogOpen(true);
    setSupportLevel("L1");
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
      

      const response = await axios.post(
        "http://localhost:5000/api/tickets/raise",
        {
          category: selectedCategory,
          subCategory,
          supportLevel,
          title,
          description,
          priority,
        },
        {
          headers: { Authorization: `Bearer ${submitToken}` },
        }
      );

      Swal.fire(
        "Success",
        `Ticket ${response.data.ticketNumber} raised successfully. Our support team will reach out shortly.`,
        "success"
      );

      closeDialog();

      try {
        const ticketsResponse = await axios.get("http://localhost:5000/api/tickets/my", {
          headers: { Authorization: `Bearer ${submitToken}` },
        });
        setMyTickets(ticketsResponse.data.tickets || []);
      } catch {
        setMyTickets([]);
      }
    } catch (error) {
      Swal.fire("error", error.response?.data?.message || "Failed to raise ticket", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="customer-page">
      <Navbar
        setSearchQuery={() => {}}
        setCategoryFilter={() => {}}
        setPriceFilter={() => {}}
        disableFilters={false}
        disableSearch={false}
      />

      <div className="customer-offset">
        <CategoryMenu setCategoryFilter={setCategoryFilter} />
      </div>

      <section className="hero-section">
        <div className="hero-left">
          <h1>{`Welcome, ${userName}`}</h1>
          <p>
            Select a service category and raise a support ticket. Our team will resolve your issue quickly.
          </p>
          <Button className="hero-btn" onClick={scrollToServices}>
            Raise a Ticket
          </Button>
        </div>

        <div className="hero-right">
          <div className="hero-stat-card">
            <h2>{openCount}</h2>
            <p>My Open Tickets</p>
          </div>
          <div className="hero-stat-card">
            <h2>{resolvedCount}</h2>
            <p>Resolved</p>
          </div>
        </div>
      </section>

      <section className="services-section" ref={servicesRef}>
        <h2 className="section-title">What We Support</h2>
        <p className="section-subtitle">
          Full L1, L2, and L3 service classification. Pick a category to raise a ticket.
        </p>

        <div className="service-filter-bar">
          <div className="service-filter-row">
            <Chip
              label="All Categories"
              onClick={() => setCategoryFilter("")}
              className={`service-filter-chip${categoryFilter ? "" : " active"}`}
            />
            {serviceCatalog.map((service) => (
              <Chip
                key={service.name}
                label={service.name}
                onClick={() => setCategoryFilter(service.name)}
                className={`service-filter-chip${categoryFilter === service.name ? " active" : ""}`}
              />
            ))}
          </div>

          <div className="service-filter-row levels">
            {["All", "L1", "L2", "L3"].map((level) => (
              <Chip
                key={level}
                label={level}
                onClick={() => setLevelFilter(level)}
                className={`level-filter-chip${levelFilter === level ? " active" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="services-grid">
          {paginatedServices.length === 0 ? (
            <div className="services-empty">No services found for this filter.</div>
          ) : (
            paginatedServices.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  className={`service-card ${service.toneClass}`}
                  key={service.name}
                  onClick={() => openDialog(service.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      openDialog(service.name);
                    }
                  }}
                >
                  <div className="service-icon-wrap">
                    <Icon className="service-icon" />
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.desc}</p>
                  <div className="service-level-counts">
                    <span>{`L1: ${(service.levels.L1 || []).length}`}</span>
                    <span>{`L2: ${(service.levels.L2 || []).length}`}</span>
                    <span>{`L3: ${(service.levels.L3 || []).length}`}</span>
                  </div>
                  <span className="service-link">Raise Ticket -&gt;</span>
                </div>
              );
            })
          )}
        </div>

        <div className="services-pagination-wrap">
          <Pagination
            page={servicePage}
            count={totalServicePages}
            onChange={(_, value) => setServicePage(value)}
            color="primary"
          />
        </div>
      </section>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{`Raise Ticket - ${selectedCategory || ""}`}</DialogTitle>

        <DialogContent className="ticket-dialog-content">
          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="support-level-label">Support Level</InputLabel>
              <Select
                labelId="support-level-label"
                label="Support Level"
                value={supportLevel}
                onChange={(event) => setSupportLevel(event.target.value)}
              >
                {supportLevels.map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <span className="support-helper">L1 - Basic  L2 - Technical  L3 - Vendor level</span>
          </div>

          <div className="form-group">
            <FormControl fullWidth required>
              <InputLabel id="sub-category-label">Sub Category</InputLabel>
              <Select
                labelId="sub-category-label"
                label="Sub Category"
                value={subCategory}
                onChange={(event) => setSubCategory(event.target.value)}
              >
                {subCategories.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
              multiline
              rows={4}
              fullWidth
            />
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                label="Priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                renderValue={(value) => (
                  <Chip label={value} className={PRIORITY_CLASS[value] || "priority-medium"} size="small" />
                )}
              >
                {priorityOptions.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions className="dialog-actions">
          <Button variant="outlined" className="btn-cancel" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="contained" className="btn-raise" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} className="btn-spinner" /> : "Raise Ticket"}
          </Button>
        </DialogActions>
      </Dialog>

      <section className="my-tickets-section">
        <h2 className="section-title">My Recent Tickets</h2>
        <p className="section-subtitle">Track your support requests</p>

        {recentTickets.length === 0 ? (
          <div className="tickets-empty">No tickets raised yet. Click a service above to get started.</div>
        ) : (
          <div className="ticket-cards">
            {recentTickets.map((ticket) => (
              <div className="ticket-card-item" key={ticket.id || ticket.ticket_number}>
                <div className="ticket-card-left">
                  <span className="ticket-card-number">{ticket.ticket_number || "-"}</span>
                  <Chip label={ticket.category || "-"} size="small" className="category-chip" />
                </div>

                <div className="ticket-card-middle">
                  <div className="ticket-card-title">{ticket.title || "-"}</div>
                  <div className="ticket-card-date">{formatDate(ticket.created_at)}</div>
                </div>

                <div className="ticket-card-right">
                  <Chip
                    label={ticket.status || "Open"}
                    size="small"
                    className={STATUS_CLASS[ticket.status] || "status-open"}
                  />
                  <Chip
                    label={ticket.priority || "Medium"}
                    size="small"
                    className={PRIORITY_CLASS[ticket.priority] || "priority-medium"}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
