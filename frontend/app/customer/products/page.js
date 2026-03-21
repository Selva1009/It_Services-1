"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  tooltipClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import CategoryMenu from "../components/Categories";
import Footer from "@/app/LandingPage/Footer";
import { useAuth } from "@/app/contexts/AuthContext";
import { apiRequest } from "@/app/services/apiClient";
import { toApiUrl } from "@/lib/api/config";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import "./CustomerHome.css";

/* ── Styled Tooltip ──────────────────────────────────────── */
const ChTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: { color: "#1e293b" },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    fontWeight: 400,
    lineHeight: 1.5,
    padding: "7px 12px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(15,23,42,0.22)",
    maxWidth: 280,
  },
}));

/* ── Chip colour maps ────────────────────────────────────── */
const STATUS_CHIP = {
  Open:          { bg: "#eff6ff", color: "#1d4ed8" },
  Assigned:      { bg: "#f5f3ff", color: "#6d28d9" },
  "In Progress": { bg: "#fffbeb", color: "#b45309" },
  InProgress:    { bg: "#fffbeb", color: "#b45309" },
  Escalated:     { bg: "#fff1f2", color: "#be123c" },
  Resolved:      { bg: "#f0fdf4", color: "#16a34a" },
  Closed:        { bg: "#f1f5f9", color: "#475569" },
};

const PRIORITY_CHIP = {
  Low:      { bg: "#f0fdf4", color: "#16a34a" },
  Medium:   { bg: "#fffbeb", color: "#b45309" },
  High:     { bg: "#fff1f2", color: "#be123c" },
  Critical: { bg: "#fce7f3", color: "#9f1239" },
};

const chipSx = (map, key, fallback) => {
  const s = map[key] || map[fallback] || map["Medium"];
  return {
    backgroundColor: s.bg,
    color: s.color,
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    height: 23,
    borderRadius: "6px",
    border: "none",
  };
};

const priorityOptions = ["Low", "Medium", "High", "Critical"];
const supportLevels   = ["L1", "L2", "L3"];
const SERVICES_PER_PAGE = 6;
const PAGE_SIZE_OPTIONS = [5, 10, 25];

const TICKET_COLUMNS = [
  { label: "Ticket #" },
  { label: "Title" },
  { label: "Category" },
  { label: "Sub Category" },
  { label: "Level" },
  { label: "Vendor User" },
  { label: "Company" },
  { label: "Work Status" },
  { label: "Priority" },
  { label: "Status" },
  { label: "Raised On" },
  { label: "Action" },
];

/* ── Service catalog ─────────────────────────────────────── */
const serviceCatalog = [
  {
    name: "Hardware Support",
    desc: "Devices, peripherals, diagnostics, and OEM hardware escalations.",
    icon: ComputerIcon,
    toneClass: "tone-blue",
    levels: {
      L1: ["Device not powering ON","Power cable or adapter verification","Battery charging issues","Restart loop basic diagnosis","Sleep or hibernate issues","System slow performance","Intermittent freezing","External monitor not detected","Resolution or scaling issues","Speaker or microphone not working","Webcam not detected","Keyboard or mouse not working","USB device not detected","Docking station connectivity issues","Printer offline","Print queue stuck","Scanner not detected","Basic printer configuration"],
      L2: ["Motherboard failure","POST failure","BIOS corruption","Hardware error codes","System board replacement","SSD/HDD failure","Disk errors","Disk not detected","RAID failure or rebuild","RAM failure","Memory slot issues","CPU hardware failure","Power supply failure","Charging port failure","Internal power circuit issues","UPS battery or board failure","LCD panel replacement","Backlight failure","GPU hardware failure","Display cable replacement","Fan failure","Thermal sensor failure","Heat sink replacement","USB port failure","LAN port failure","HDMI port failure","Audio jack failure","Dock connector failure","Fuser assembly failure","Roller replacement","Print head failure","Mechanical motor issues"],
      L3: ["Hardware design defects","Recurring component failure analysis","Firmware-level hardware faults","Microcode or chipset issues","OEM engineering diagnostics","Product recall cases"],
    },
  },
  {
    name: "Operating System Support",
    desc: "OS health, boot issues, patch stability, and vendor-level defects.",
    icon: TerminalIcon,
    toneClass: "tone-purple",
    levels: {
      L1: ["Login failure","Account lockout","User profile loading issues","Slow operating system response","Startup application issues","Display settings configuration","Language or regional settings","Time synchronization issues","Pending update troubleshooting","Driver reinstall assistance"],
      L2: ["OS corruption","Blue screen errors","Kernel crashes","OS reinstallation","System image restoration","Bootloader repair","Encryption recovery issues"],
      L3: ["OS kernel defects","Persistent system crashes after patching","OS security vulnerabilities","Vendor-level bug fixes","OS patch engineering escalation"],
    },
  },
  {
    name: "Networking Support",
    desc: "Connectivity, routing, infrastructure, and vendor TAC escalations.",
    icon: WifiIcon,
    toneClass: "tone-cyan",
    levels: {
      L1: ["WiFi connectivity issues","LAN connectivity issues","IP renewal or refresh","Limited connectivity messages","Slow internet complaints","VPN connection assistance","Proxy configuration checks"],
      L2: ["Switch port failure","Router hardware malfunction","Access point failure","Firewall issues","VLAN configuration problems","Routing issues","DHCP failure","DNS configuration issues","Packet loss investigation","Wireless interference troubleshooting"],
      L3: ["Firmware defects in network devices","Routing protocol defects","Hardware-software incompatibility","Vendor TAC escalation","Advanced packet-level analysis"],
    },
  },
  {
    name: "Audio & Video Conferencing",
    desc: "Meeting audio-video setup, conference hardware, and codec reliability.",
    icon: VideocamIcon,
    toneClass: "tone-orange",
    levels: {
      L1: ["No audio during meetings","Microphone not detected","Camera not working","Echo or feedback issues","Video not displaying","Screen sharing issues","Headset configuration issues"],
      L2: ["Conference hardware failure","Camera replacement","Microphone array failure","Speaker system failure","Codec configuration issues","AV controller failures"],
      L3: ["Firmware defects in conferencing systems","Codec compatibility issues","Manufacturer-level hardware failures","Integration defects"],
    },
  },
  {
    name: "Antivirus & Malware",
    desc: "Endpoint security, malware remediation, and advanced threat response.",
    icon: SecurityIcon,
    toneClass: "tone-red",
    levels: {
      L1: ["Antivirus not updating","Antivirus scan not running","Endpoint agent disconnected","False positive alerts","Basic malware scan initiation"],
      L2: ["Malware infection removal","Ransomware containment","Endpoint isolation","Antivirus agent corruption","Advanced threat remediation"],
      L3: ["Advanced malware investigation","Zero-day vulnerability handling","Endpoint protection engine failures","Security signature defects"],
    },
  },
  {
    name: "Identity & Access",
    desc: "Authentication, MFA, policy sync, and directory architecture support.",
    icon: LockIcon,
    toneClass: "tone-green",
    levels: {
      L1: ["Domain login issues","Password reset assistance","MFA failures","Account lockouts"],
      L2: ["Domain trust issues","Certificate authentication failures","Policy synchronization failures"],
      L3: ["Directory service corruption","Authentication architecture failures","Federation or certificate infrastructure issues"],
    },
  },
  {
    name: "Patch & Update Management",
    desc: "Update lifecycle support from basic install to vendor patch defects.",
    icon: SystemUpdateAltIcon,
    toneClass: "tone-teal",
    levels: {
      L1: ["Update installation assistance","Restart scheduling issues","Update pending notifications"],
      L2: ["Patch failure causing instability","Update rollback","Firmware compatibility conflicts"],
      L3: ["OS patch engineering escalation","Vendor patch defects"],
    },
  },
  {
    name: "Backup & Data Protection",
    desc: "Backup health, restore workflows, and engineering-level recovery support.",
    icon: BackupIcon,
    toneClass: "tone-violet",
    levels: {
      L1: ["Backup alerts","Backup agent not running","Restore request initiation"],
      L2: ["Backup corruption","Restore failure","Backup storage failure","Recovery validation issues"],
      L3: ["Backup engine defects","Data recovery engineering support","Vendor-level restore failures"],
    },
  },
  {
    name: "Collaboration Tools",
    desc: "Email, calendar, plugin, and collaboration platform reliability support.",
    icon: GroupsIcon,
    toneClass: "tone-indigo",
    levels: {
      L1: ["Email synchronization issues","Calendar synchronization issues","Meeting plugin issues","Notification issues"],
      L2: ["Persistent synchronization failures","Client integration issues","Policy configuration failures"],
      L3: ["Service-side defects","API or integration failures","Vendor-side outages"],
    },
  },
  {
    name: "Asset Lifecycle",
    desc: "Asset onboarding, lifecycle tracking, and OEM replacement escalation.",
    icon: Inventory2Icon,
    toneClass: "tone-pink",
    levels: {
      L1: ["Asset allocation assistance","Device handover support","Asset tagging verification","Asset record update request"],
      L2: ["Asset repair coordination","Warranty lifecycle tracking","Device replacement planning"],
      L3: ["OEM asset replacement escalation","Vendor lifecycle disputes"],
    },
  },
  {
    name: "Environmental & Infrastructure",
    desc: "Power, cooling, workspace, and infrastructure design-level incidents.",
    icon: ApartmentIcon,
    toneClass: "tone-slate",
    levels: {
      L1: ["Overheating due to ventilation","Power fluctuation complaints","Workspace setup concerns"],
      L2: ["Electrical grounding issues","Rack cooling failure","UPS load imbalance"],
      L3: ["Design-level infrastructure issues","Capacity architecture failures","Environmental engineering defects"],
    },
  },
  {
    name: "Software–Hardware Compatibility",
    desc: "Compatibility diagnostics for drivers, firmware, and upgrade planning.",
    icon: SettingsSuggestIcon,
    toneClass: "tone-amber",
    levels: {
      L1: ["Driver compatibility issues","Software not detecting hardware","Peripheral compatibility issues"],
      L2: ["Driver conflicts causing crashes","Hardware capacity mismatch","Upgrade recommendations"],
      L3: ["Driver engineering issues","Firmware conflicts requiring vendor patch","Compatibility defects requiring vendor updates"],
    },
  },
];

const normalizeText = (value) =>
  String(value || "").toLowerCase().replace(/&/g, "and").replace(/support/g, "").replace(/[^a-z0-9]/g, "");

const fmtDate = (v) =>
  v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const ACTOR_LABEL = {
  it_user: "IT User",
  vendor_user: "Vendor User",
  vendor: "Vendor User",
  it_admin: "IT Admin",
  system: "System",
};

const normalizeStatus = (v) => (v === "InProgress" ? "In Progress" : v || "-");

const getSortedActivity = (activity = []) =>
  [...activity].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const getVendorStatusFromActivity = (activity = [], fallback = "-") => {
  const sorted = getSortedActivity(activity);
  const vendorRows = sorted.filter((row) => row.actor_type === "vendor_user" || row.actor_type === "vendor");
  const latestVendor = vendorRows[vendorRows.length - 1];
  return latestVendor?.new_value || fallback;
};

const getVendorUserName = (ticket) =>
  ticket?.vendor_user_name ||
  ticket?.assigned_vendor_user_name ||
  ticket?.assigned_to_name ||
  "-";

const getVendorCompanyName = (ticket) =>
  ticket?.vendor_company_name ||
  ticket?.vendor_company ||
  ticket?.company_name ||
  ticket?.assigned_vendor_company_name ||
  "-";

const getWorkStatus = (ticket) =>
  ticket?.vendor_status ||
  getVendorStatusFromActivity(ticket?.__activity || [], "") ||
  ticket?.vendor_work_status ||
  ticket?.work_status ||
  ticket?.assignment_status ||
  normalizeStatus(ticket?.status) ||
  "-";

function TicketDetailModal({ open, ticket, activity, loading, activeTab, onTabChange, onClose }) {
  if (!open) return null;

  const sortedActivity = getSortedActivity(activity);

  return (
    <>
      <div className="ch-detail-backdrop" onClick={onClose} />
      <div className="ch-detail-modal" role="dialog" aria-modal="true">
        <div className="ch-detail-header">
          <div>
            <h3 className="ch-detail-title">Ticket {ticket?.ticket_number || "-"}</h3>
            <p className="ch-detail-subtitle">{ticket?.title || "-"}</p>
          </div>
          <button className="ch-detail-close" onClick={onClose}>x</button>
        </div>

        <div className="ch-detail-tabs">
          <button className={`ch-detail-tab${activeTab === "overview" ? " active" : ""}`} onClick={() => onTabChange("overview")}>
            Details
          </button>
          <button className={`ch-detail-tab${activeTab === "timeline" ? " active" : ""}`} onClick={() => onTabChange("timeline")}>
            Timeline
          </button>
        </div>

        {loading ? (
          <div className="ch-detail-loading"><CircularProgress size={20} /> Loading ticket details...</div>
        ) : activeTab === "overview" ? (
          <div className="ch-detail-body">
            <div className="ch-detail-grid">
              <div><span>Raised By</span><strong>{ticket?.raised_by_name || "-"}</strong></div>
              <div><span>Email</span><strong>{ticket?.raised_by_email || "-"}</strong></div>
              <div><span>IT Company</span><strong>{ticket?.it_company || "-"}</strong></div>
              <div><span>Claimed At</span><strong>{fmtDate(ticket?.claimed_at)}</strong></div>
              <div><span>Resolved At</span><strong>{fmtDate(ticket?.resolved_at)}</strong></div>
              <div><span>Vendor Status</span><strong>{getVendorStatusFromActivity(sortedActivity, normalizeStatus(ticket?.status))}</strong></div>
            </div>
            <div className="ch-detail-description">
              <span>Description</span>
              <p>{ticket?.description || "-"}</p>
            </div>
          </div>
        ) : (
          <div className="ch-detail-body">
            {sortedActivity.length === 0 ? (
              <div className="ch-detail-empty">No activity available.</div>
            ) : (
              <div className="ch-timeline">
                {sortedActivity.map((row, idx) => (
                  <div key={row.id || idx} className="ch-timeline-item">
                    <div className="ch-timeline-dot" />
                    <div className="ch-timeline-content">
                      <div className="ch-timeline-head">
                        <strong>{ACTOR_LABEL[row.actor_type] || row.actor_type || "Actor"}</strong>
                        <span>{fmtDate(row.created_at)}</span>
                      </div>
                      <p>{row.message || "-"}</p>
                      {(row.old_value || row.new_value) ? (
                        <div className="ch-timeline-change">
                          <span>{normalizeStatus(row.old_value) || "-"}</span>
                          <span>to</span>
                          <span>{normalizeStatus(row.new_value) || "-"}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Component ───────────────────────────────────────────── */
export default function CustomerSupportHomePage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen]             = useState(false);
  const [subCategory, setSubCategory]           = useState("");
  const [supportLevel, setSupportLevel]         = useState("L1");
  const [title, setTitle]                       = useState("");
  const [description, setDescription]           = useState("");
  const [priority, setPriority]                 = useState("Medium");
  const [submitting, setSubmitting]             = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState("");
  const [serviceSearch, setServiceSearch]       = useState("");
  const [serviceSubCategoryFilter, setServiceSubCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter]           = useState("");
  const [servicePage, setServicePage]           = useState(1);
  const [userName, setUserName]                 = useState("User");
  const [openCount, setOpenCount]               = useState(0);
  const [resolvedCount, setResolvedCount]       = useState(0);
  const [myTickets, setMyTickets]               = useState([]);

  // Table state
  const [ticketSearch, setTicketSearch]         = useState("");
  const [ticketStatusFilter, setTicketStatus]   = useState("All");
  const [ticketQuickFilter, setTicketQuickFilter] = useState("all"); // all | active | closed
  const [ticketPage, setTicketPage]             = useState(0);
  const [ticketPageSize, setTicketPageSize]     = useState(10);
  const [ticketDetailCache, setTicketDetailCache] = useState({}); // { [ticketId]: { ticket, activity } }
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [selectedTicketActivity, setSelectedTicketActivity] = useState([]);
  const [detailTab, setDetailTab] = useState("overview");

  const servicesRef = useRef(null);
  const ticketsRef  = useRef(null);
  const ticketDetailCacheRef = useRef({});
  const ticketDetailPromiseRef = useRef({});
  const ticketEnrichDoneRef = useRef(new Set());
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken() || auth?.authToken || null;

  const resolveTicketId = (ticket) =>
    ticket?.id || ticket?.ticket_id || ticket?.ticketId || null;

  const getDetailForTicket = useCallback(async (ticket) => {
    const ticketId = resolveTicketId(ticket);
    if (!ticketId || !token) return null;
    if (ticketDetailCacheRef.current[ticketId]) return ticketDetailCacheRef.current[ticketId];
    if (ticketDetailPromiseRef.current[ticketId]) return ticketDetailPromiseRef.current[ticketId];

    const promise = (async () => {
      const response = await apiRequest({ path: API_ENDPOINTS.tickets.detail(ticketId), token });
      const payload = {
        ticket: response?.ticket || null,
        activity: Array.isArray(response?.activity) ? response.activity : [],
      };
      if (payload.ticket) {
        ticketDetailCacheRef.current[ticketId] = payload;
        setTicketDetailCache((prev) => ({ ...prev, [ticketId]: payload }));
      }
      return payload;
    })().finally(() => {
      delete ticketDetailPromiseRef.current[ticketId];
    });

    ticketDetailPromiseRef.current[ticketId] = promise;
    return promise;
  }, [token]);

  const selectedService = useMemo(() =>
    serviceCatalog.find((s) => s.name === selectedCategory) || null,
  [selectedCategory]);

  const subCategories = useMemo(() =>
    selectedService ? selectedService.levels[supportLevel] || [] : [],
  [selectedService, supportLevel]);

  const availableServiceSubCategories = useMemo(() => {
    if (!activeServiceCategory) return [];
    const service = serviceCatalog.find((item) => normalizeText(item.name) === normalizeText(activeServiceCategory));
    if (!service) return [];
    const levels = !levelFilter || levelFilter === "All" ? ["L1", "L2", "L3"] : [levelFilter];
    return Array.from(new Set(levels.flatMap((level) => service.levels[level] || [])));
  }, [activeServiceCategory, levelFilter]);

  const filteredServices = useMemo(() => {
    const q = normalizeText(serviceSearch);
    return serviceCatalog.filter((service) => {
      const matchCategory = !activeServiceCategory || normalizeText(service.name) === normalizeText(activeServiceCategory);
      if (!matchCategory) return false;
      const scopedLevels = !levelFilter || levelFilter === "All" ? ["L1","L2","L3"] : [levelFilter];
      const matchSubCategory = !serviceSubCategoryFilter ||
        scopedLevels.some((l) => (service.levels[l] || []).some((sub) => normalizeText(sub) === normalizeText(serviceSubCategoryFilter)));
      if (!matchSubCategory) return false;
      const matchLevel = !levelFilter || levelFilter === "All" || (service.levels[levelFilter] || []).length > 0;
      if (!matchLevel) return false;
      if (!q) return true;
      if (normalizeText(service.name).includes(q)) return true;
      if (normalizeText(service.desc).includes(q)) return true;
      return ["L1","L2","L3"].some((l) => (service.levels[l] || []).some((i) => normalizeText(i).includes(q)));
    });
  }, [serviceSearch, activeServiceCategory, serviceSubCategoryFilter, levelFilter]);

  const paginatedServices = useMemo(() => {
    const start = (servicePage - 1) * SERVICES_PER_PAGE;
    return filteredServices.slice(start, start + SERVICES_PER_PAGE);
  }, [filteredServices, servicePage]);

  const totalServicePages = useMemo(() =>
    Math.max(1, Math.ceil(filteredServices.length / SERVICES_PER_PAGE)),
  [filteredServices.length]);

  // Ticket table filtering
  const filteredTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
    return myTickets.filter((t) => {
      const normalizedStatus = normalizeStatus(t.status);
      const quickMatch =
        ticketQuickFilter === "all" ? true :
        ticketQuickFilter === "active" ? !["Resolved", "Closed"].includes(normalizedStatus) :
        ["Resolved", "Closed"].includes(normalizedStatus);
      const matchQ = !q ||
        String(t.ticket_number || "").toLowerCase().includes(q) ||
        String(t.title || "").toLowerCase().includes(q) ||
        String(t.category || "").toLowerCase().includes(q) ||
        String(t.sub_category || "").toLowerCase().includes(q) ||
        String(getVendorUserName(t)).toLowerCase().includes(q) ||
        String(getVendorCompanyName(t)).toLowerCase().includes(q);
      const matchStatus = ticketStatusFilter === "All" || normalizedStatus === ticketStatusFilter;
      return matchQ && matchStatus && quickMatch;
    });
  }, [myTickets, ticketSearch, ticketStatusFilter, ticketQuickFilter]);

  const ticketTotalPages = Math.max(1, Math.ceil(filteredTickets.length / ticketPageSize));
  const pagedTickets = filteredTickets.slice(ticketPage * ticketPageSize, (ticketPage + 1) * ticketPageSize);
  const ticketFrom = filteredTickets.length === 0 ? 0 : ticketPage * ticketPageSize + 1;
  const ticketTo   = Math.min((ticketPage + 1) * ticketPageSize, filteredTickets.length);

  useEffect(() => {
    if (!token || pagedTickets.length === 0) return;
    let active = true;

    (async () => {
      for (const row of pagedTickets) {
        const ticketId = resolveTicketId(row);
        if (!ticketId || ticketEnrichDoneRef.current.has(ticketId)) continue;
        const hasVendor = Boolean(row?.vendor_company && row.vendor_company !== "-");
        const hasAssigned = Boolean(row?.assigned_vendor_user && row.assigned_vendor_user !== "-");
        const hasWork = Boolean(getWorkStatus(row) && getWorkStatus(row) !== "-");
        if (hasVendor && hasAssigned && hasWork) {
          ticketEnrichDoneRef.current.add(ticketId);
          continue;
        }
        // Mark once to avoid re-fetch loops that make UI unresponsive.
        ticketEnrichDoneRef.current.add(ticketId);
        try {
          const payload = await getDetailForTicket(row);
          if (!active || !payload?.ticket) continue;
          const detailTicket = payload.ticket;
          const derivedStatus = getVendorStatusFromActivity(payload.activity, normalizeStatus(detailTicket.status));
          setMyTickets((prev) =>
            prev.map((item) =>
              resolveTicketId(item) === resolveTicketId(row)
                ? {
                    ...item,
                    vendor_company: detailTicket.vendor_company || item.vendor_company || "-",
                    assigned_vendor_user: detailTicket.assigned_vendor_user || item.assigned_vendor_user || "-",
                    vendor_status: derivedStatus || item.vendor_status || "-",
                    __activity: payload.activity || item.__activity || [],
                  }
                : item
            )
          );
        } catch {
          // no-op: keep table stable even if one detail fetch fails
        }
      }
    })();

    return () => { active = false; };
  }, [pagedTickets, token, getDetailForTicket]);

  useEffect(() => {
    setUserName(auth?.customerUser?.name || auth?.customer?.name || auth?.userName || "User");
  }, [auth?.customerUser?.name, auth?.customer?.name, auth?.userName]);

  const loadMyTickets = async (tkn) => {
    try {
      const res = await axios.get(toApiUrl(API_ENDPOINTS.tickets.my), { headers: { Authorization: `Bearer ${tkn}` } });
      const tickets = (res.data.tickets || []).map((ticket) => ({
        ...ticket,
        status: normalizeStatus(ticket.status),
        vendor_company: ticket.vendor_company || ticket.vendor_company_name || "-",
        assigned_vendor_user: ticket.assigned_vendor_user || ticket.vendor_user_name || "-",
      }));
      ticketEnrichDoneRef.current = new Set();
      setMyTickets(tickets);
      setOpenCount(tickets.filter((t) => t.status === "Open").length);
      setResolvedCount(tickets.filter((t) => t.status === "Resolved").length);
    } catch { setMyTickets([]); }
  };

  useEffect(() => { if (token) loadMyTickets(token); }, [token]);
  useEffect(() => { setSubCategory(""); }, [selectedCategory, supportLevel]);
  useEffect(() => { setServiceSubCategoryFilter(""); }, [activeServiceCategory]);
  useEffect(() => { setServicePage(1); }, [serviceSearch, activeServiceCategory, serviceSubCategoryFilter, levelFilter]);
  useEffect(() => { if (servicePage > totalServicePages) setServicePage(totalServicePages); }, [servicePage, totalServicePages]);
  useEffect(() => { setTicketPage(0); }, [ticketSearch, ticketStatusFilter, ticketQuickFilter, ticketPageSize]);

  const scrollToServices = () => {
    setTimeout(() => servicesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const scrollToTickets = () => {
    setTimeout(() => ticketsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
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

  const openTicketDetail = useCallback(async (ticket, tab = "overview") => {
    if (!ticket) return;
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailTab(tab);
    const initial = {
      ...ticket,
      ticket_number: ticket.ticket_number || "-",
      title: ticket.title || "-",
      description: ticket.description || "-",
      category: ticket.category || "-",
      sub_category: ticket.sub_category || "-",
      priority: ticket.priority || "-",
      status: normalizeStatus(ticket.status),
      support_level: ticket.support_level || "-",
      created_at: ticket.created_at || null,
      claimed_at: ticket.claimed_at || null,
      resolved_at: ticket.resolved_at || null,
      raised_by_name: ticket.raised_by_name || "-",
      raised_by_email: ticket.raised_by_email || "-",
      it_company: ticket.it_company || "-",
      vendor_company: ticket.vendor_company || "-",
      assigned_vendor_user: ticket.assigned_vendor_user || "-",
    };
    setSelectedTicketDetail(initial);
    setSelectedTicketActivity(ticket.__activity || []);

    try {
      const payload = await getDetailForTicket(ticket);
      if (payload?.ticket) {
        const mapped = {
          ...initial,
          ...payload.ticket,
          status: normalizeStatus(payload.ticket.status),
        };
        setSelectedTicketDetail(mapped);
        setSelectedTicketActivity(payload.activity || []);
      }
    } catch {
      // keep initial row data
    } finally {
      setDetailLoading(false);
    }
  }, [getDetailForTicket]);

  const handleSubmit = async () => {
    if (!selectedCategory || !subCategory || !title.trim() || !description.trim()) {
      Swal.fire("Error", "Please fill all required fields.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        toApiUrl(API_ENDPOINTS.tickets.raise),
        { category: selectedCategory, subCategory, supportLevel, title, description, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", `Ticket ${res.data.ticketNumber} raised successfully. Our support team will reach out shortly.`, "success");
      closeDialog();
      await loadMyTickets(token);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to raise ticket", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Stat summary ── */
  const totalTickets    = myTickets.length;
  const inProgressCount = myTickets.filter((t) => t.status === "In Progress" || t.status === "InProgress").length;
  const escalatedCount  = myTickets.filter((t) => t.status === "Escalated").length;

  return (
    <div className="ch-page">
      <Navbar
        setSearchQuery={setServiceSearch}
        disableSearch={false}
        onGoServices={scrollToServices}
        onGoTickets={scrollToTickets}
      />

      <div className="ch-offset">
        <CategoryMenu
          categories={serviceCatalog}
          activeCategory={activeServiceCategory}
          setCategoryFilter={(val) => { setActiveServiceCategory(val); scrollToServices(); }}
        />
      </div>

      {/* ── Hero ── */}
      <section className="ch-hero">
        <div className="ch-hero-left">
          <div className="ch-hero-badge">IT Support Portal</div>
          <h1 className="ch-hero-title">Welcome back,<br /><span className="ch-hero-name">{userName}</span></h1>
          <p className="ch-hero-sub">Select a service category to raise a support ticket. Our team resolves your issue at every level — L1, L2, and L3.</p>
          <div className="ch-hero-actions">
            <button className="ch-btn-primary" onClick={scrollToServices}>
              <AddIcon style={{ fontSize: 18 }} /> Raise a Ticket
            </button>
            <button className="ch-btn-secondary" onClick={scrollToTickets}>
              View My Tickets
            </button>
          </div>
        </div>
        <div className="ch-hero-stats">
          {[
            { n: totalTickets,    label: "Total",       cls: "" },
            { n: openCount,       label: "Open",        cls: "amber" },
            { n: inProgressCount, label: "In Progress", cls: "amber" },
            { n: escalatedCount,  label: "Escalated",   cls: "red" },
            { n: resolvedCount,   label: "Resolved",    cls: "green" },
          ].map((s) => (
            <div className="ch-stat" key={s.label}>
              <div className={`ch-stat-n ${s.cls}`}>{s.n}</div>
              <div className="ch-stat-l">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section className="ch-services" ref={servicesRef}>
        <div className="ch-section-head">
          <div>
            <h2 className="ch-section-title">Support Catalog</h2>
            <p className="ch-section-sub">L1/L2/L3 indicates escalation path. Choose category and sub-category to keep mapping strict and relevant.</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="ch-filter-bar">
          <div className="ch-filter-row">
            <span className="ch-filter-label">Active Filters</span>
            <div className="ch-chips-wrap">
              <Chip
                label={activeServiceCategory ? `Category: ${activeServiceCategory}` : "Category: All"}
                className={`ch-chip${activeServiceCategory ? " active" : ""}`}
                size="small"
              />
              <Chip
                label={serviceSearch ? `Search: ${serviceSearch}` : "Search: All"}
                className={`ch-chip${serviceSearch ? " active" : ""}`}
                size="small"
              />
              {(activeServiceCategory || serviceSearch || levelFilter) ? (
                <Chip
                  label="Reset"
                  onClick={() => {
                    setActiveServiceCategory("");
                    setServiceSearch("");
                    setServiceSubCategoryFilter("");
                    setLevelFilter("");
                  }}
                  className="ch-chip"
                  size="small"
                />
              ) : null}
            </div>
          </div>
          {activeServiceCategory ? (
            <div className="ch-filter-row">
              <span className="ch-filter-label">Support Level</span>
              <FormControl size="small" className="ch-subcat-select-wrap">
                <Select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="ch-ticket-select ch-filter-select"
                  MenuProps={{ className: "ch-filter-menu" }}
                  displayEmpty
                  renderValue={(value) => value || <span style={{ color: "#94a3b8" }}>Select support level</span>}
                >
                  <MenuItem value="" disabled>Select support level</MenuItem>
                  {["All","L1","L2","L3"].map((l) => (
                    <MenuItem key={l} value={l}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          ) : null}
          {activeServiceCategory ? (
            <div className="ch-filter-row">
              <span className="ch-filter-label">Sub Category</span>
              <FormControl size="small" className="ch-subcat-select-wrap">
                <Select
                  value={serviceSubCategoryFilter}
                  onChange={(e) => setServiceSubCategoryFilter(e.target.value)}
                  className="ch-ticket-select ch-filter-select"
                  MenuProps={{ className: "ch-filter-menu" }}
                  displayEmpty
                  renderValue={(value) => value || <span style={{ color: "#94a3b8" }}>Select sub category</span>}
                >
                  <MenuItem value="" disabled>Select sub category</MenuItem>
                  <MenuItem value="">All Sub Categories</MenuItem>
                  {availableServiceSubCategories.map((sub) => (
                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          ) : null}
        </div>

        {/* Grid */}
        <div className="ch-grid">
          {paginatedServices.length === 0 ? (
            <div className="ch-empty">No services found for this filter.</div>
          ) : (
            paginatedServices.map((service) => {
              const Icon = service.icon;
              return (
                <div className={`ch-card ${service.toneClass}`} key={service.name} role="button" tabIndex={0}
                  onClick={() => openDialog(service.name)}
                  onKeyDown={(e) => e.key === "Enter" && openDialog(service.name)}>
                  <div className="ch-card-top">
                    <div className="ch-card-icon-wrap"><Icon className="ch-card-icon" /></div>
                    <div className="ch-card-levels">
                      <span>L1 · {(service.levels.L1 || []).length}</span>
                      <span>L2 · {(service.levels.L2 || []).length}</span>
                      <span>L3 · {(service.levels.L3 || []).length}</span>
                    </div>
                  </div>
                  <h3 className="ch-card-title">{service.name}</h3>
                  <p className="ch-card-desc">{service.desc}</p>
                  <button className="ch-card-btn" onClick={(e) => { e.stopPropagation(); openDialog(service.name); }}>
                    <AddIcon style={{ fontSize: 15 }} /> Raise Ticket
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="ch-pagination">
          <span className="ch-page-info">{`${(servicePage - 1) * SERVICES_PER_PAGE + 1}–${Math.min(servicePage * SERVICES_PER_PAGE, filteredServices.length)} of ${filteredServices.length}`}</span>
          <button className="ch-page-btn" onClick={() => setServicePage((p) => Math.max(1, p - 1))} disabled={servicePage === 1} aria-label="prev"><ChevronLeft size={16} /></button>
          <button className="ch-page-btn" onClick={() => setServicePage((p) => Math.min(totalServicePages, p + 1))} disabled={servicePage >= totalServicePages} aria-label="next"><ChevronRight size={16} /></button>
        </div>
      </section>

      {/* ── Raise Ticket Dialog ── */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth PaperProps={{ className: "ch-dialog-paper" }}>
        <DialogTitle className="ch-dialog-title">
          <span className="ch-dialog-title-text">Raise Support Ticket</span>
          {selectedCategory && <span className="ch-dialog-category">{selectedCategory}</span>}
        </DialogTitle>

        <DialogContent className="ch-dialog-content">
          <div className="ch-form-row">
            <div className="ch-form-group">
              <label className="ch-form-label">Support Level</label>
              <FormControl fullWidth size="small">
                <Select value={supportLevel} onChange={(e) => setSupportLevel(e.target.value)} className="ch-select">
                  {supportLevels.map((l) => <MenuItem key={l} value={l}>{l} — {l === "L1" ? "Basic" : l === "L2" ? "Technical" : "Vendor / Escalation"}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
            <div className="ch-form-group">
              <label className="ch-form-label">Sub Category <span className="ch-required">*</span></label>
              <FormControl fullWidth size="small" required>
                <Select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="ch-select" displayEmpty renderValue={(v) => v || <span style={{ color: "#94a3b8" }}>Select sub-category</span>}>
                  {subCategories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="ch-form-group">
            <label className="ch-form-label">Title <span className="ch-required">*</span></label>
            <TextField value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary of your issue" fullWidth size="small" className="ch-textfield" />
          </div>

          <div className="ch-form-group">
            <label className="ch-form-label">Description <span className="ch-required">*</span></label>
            <TextField value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your issue in detail…" multiline rows={4} fullWidth size="small" className="ch-textfield" />
          </div>

          <div className="ch-form-group">
            <label className="ch-form-label">Priority</label>
            <FormControl fullWidth size="small">
              <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="ch-select"
                renderValue={(v) => <Chip label={v} size="small" sx={chipSx(PRIORITY_CHIP, v, "Medium")} />}>
                {priorityOptions.map((item) => (
                  <MenuItem key={item} value={item}>
                    <Chip label={item} size="small" sx={chipSx(PRIORITY_CHIP, item, "Medium")} style={{ marginRight: 8 }} />
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>

        <DialogActions className="ch-dialog-actions">
          <button className="ch-btn-cancel" onClick={closeDialog}>Cancel</button>
          <button className="ch-btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={16} style={{ color: "#fff" }} /> : <><AddIcon style={{ fontSize: 16 }} /> Submit Ticket</>}
          </button>
        </DialogActions>
      </Dialog>

      {/* ── My Tickets Table ── */}
      <section className="ch-tickets" ref={ticketsRef}>
        <div className="ch-section-head">
          <div>
            <h2 className="ch-section-title">My Tickets</h2>
            <p className="ch-section-sub">Track and manage all your support requests.</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ch-ticket-toolbar">
          <div className="ch-ticket-tabs">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "closed", label: "Resolved / Closed" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`ch-ticket-tab${ticketQuickFilter === tab.key ? " active" : ""}`}
                onClick={() => setTicketQuickFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="ch-ticket-toolbar-left">
            <div className="ch-tf-group ch-tf-search">
              <p className="ch-tf-label">Search</p>
              <TextField value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)} placeholder="Ticket #, title, category, vendor…" size="small" fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon style={{ fontSize: 18, color: "#94a3b8" }} /></InputAdornment> }}
                className="ch-ticket-search" />
            </div>
          </div>
          <div className="ch-ticket-toolbar-right">
            <div className="ch-tf-group ch-tf-select">
              <p className="ch-tf-label">Status</p>
              <FormControl fullWidth size="small">
                <Select value={ticketStatusFilter} onChange={(e) => setTicketStatus(e.target.value)} className="ch-ticket-select">
                  {["All","Open","Assigned","In Progress","Escalated","Resolved","Closed"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {myTickets.length === 0 ? (
          <div className="ch-tickets-empty">
            <div className="ch-tickets-empty-icon">🎫</div>
            No tickets raised yet. Click a service above to get started.
          </div>
        ) : (
          <Paper className="ch-table-card" variant="outlined">
            <div className="ch-table-scroll">
              <Table className="ch-table" size="small">
                <TableHead className="ch-thead">
                  <TableRow>
                    {TICKET_COLUMNS.map((c) => (
                      <TableCell key={c.label} className="ch-th">{c.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={TICKET_COLUMNS.length} className="ch-td-empty">
                        No tickets match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedTickets.map((t, i) => (
                      <TableRow key={t.id || t.ticket_number} className="ch-tr" style={{ animationDelay: `${i * 20}ms` }}>
                        <TableCell className="ch-td ch-td-id">{t.ticket_number || "-"}</TableCell>
                        <ChTooltip title={t.title || ""} placement="top" enterDelay={300}>
                          <TableCell className="ch-td ch-td-tip">{t.title || "-"}</TableCell>
                        </ChTooltip>
                        <TableCell className="ch-td ch-td-soft">{t.category || "-"}</TableCell>
                        <TableCell className="ch-td ch-td-soft">{t.sub_category || "-"}</TableCell>
                        <TableCell className="ch-td ch-td-soft">{t.support_level || "-"}</TableCell>
                        <TableCell className="ch-td ch-td-soft">{t.assigned_vendor_user || getVendorUserName(t)}</TableCell>
                        <TableCell className="ch-td ch-td-soft">{t.vendor_company || getVendorCompanyName(t)}</TableCell>
                        <TableCell className="ch-td ch-td-soft">{getWorkStatus(t)}</TableCell>
                        <TableCell className="ch-td">
                          <Chip size="small" label={t.priority || "-"} sx={chipSx(PRIORITY_CHIP, t.priority, "Medium")} />
                        </TableCell>
                        <TableCell className="ch-td">
                          <Chip size="small" label={t.status === "InProgress" ? "In Progress" : (t.status || "Open")} sx={chipSx(STATUS_CHIP, t.status, "Open")} />
                        </TableCell>
                        <TableCell className="ch-td ch-td-soft">{fmtDate(t.created_at)}</TableCell>
                        <TableCell className="ch-td">
                          <IconButton size="small" className="ch-row-action" onClick={() => openTicketDetail(t, "overview")}>
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="ch-table-footer">
              <div className="ch-table-footer-left">
                <span className="ch-rows-label">Rows per page:</span>
                <select className="ch-rows-select" value={ticketPageSize} onChange={(e) => setTicketPageSize(Number(e.target.value))}>
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="ch-table-footer-right">
                <span className="ch-page-count">{filteredTickets.length === 0 ? "0–0 of 0" : `${ticketFrom}–${ticketTo} of ${filteredTickets.length}`}</span>
                <button className="ch-nav-btn" onClick={() => setTicketPage((p) => Math.max(0, p - 1))} disabled={ticketPage === 0} aria-label="prev"><ChevronLeft size={16} /></button>
                <button className="ch-nav-btn" onClick={() => setTicketPage((p) => Math.min(ticketTotalPages - 1, p + 1))} disabled={ticketPage >= ticketTotalPages - 1} aria-label="next"><ChevronRight size={16} /></button>
              </div>
            </div>
          </Paper>
        )}
      </section>

      <TicketDetailModal
        open={detailOpen}
        ticket={selectedTicketDetail}
        activity={selectedTicketActivity}
        loading={detailLoading}
        activeTab={detailTab}
        onTabChange={setDetailTab}
        onClose={() => {
          setDetailOpen(false);
          setDetailLoading(false);
          setSelectedTicketDetail(null);
          setSelectedTicketActivity([]);
          setDetailTab("overview");
        }}
      />

      <Footer />
    </div>
  );
}
