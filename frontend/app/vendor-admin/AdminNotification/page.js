"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect } from "react";
import React from "react";
import {
  Bell,
  User,
  Package,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  Mail,
  Tag,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Building2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Navbar from "../components/navbar";
import ExportMenu from "@/app/Components/auth/ExportMenu";
import { useAuth } from "@/app/contexts/AuthContext";

const VendorAdminNotifications = () => {
  const { auth, getAuthToken } = useAuth();
  const NOTIFICATION_LIMIT = 200;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const token = getAuthToken() || auth?.authToken || null;

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }
      console.log('jf');
      
      const data = await response.json();
      console.log('hi')
      console.log(data,'Noti')
      setNotifications((data.notifications || []).slice(0, NOTIFICATION_LIMIT));
      console.log("Sample notification:", (data.notifications || [])[0]); 
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setError(null);
    fetchNotifications();
    setCurrentPage(1);
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchNotifications();
  }, [token]);

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    setSortConfig({ key, direction });
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp className="h-4 w-4 ml-1 inline opacity-30" />;
    return sortConfig.direction === "asc"
      ? <ChevronUp className="h-4 w-4 ml-1 inline" />
      : <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  const filteredNotifications = sortedNotifications.filter((n) => {
    const search = searchTerm.toLowerCase();
    return (
      n.message?.toLowerCase().includes(search) ||
      n.ticket_number?.toLowerCase().includes(search) ||
      n.type?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  /* ── helper: is this notification's priority Critical? ── */
  const isCritical = (n) =>
    String(n.priority || "").toLowerCase() === "critical";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="p-6">
          <Card className="border border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Error Loading Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-red-200 hover:bg-red-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="p-6 space-y-6">
        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Notifications</h2>
              <p className="text-sm text-muted-foreground">
                {notifications.length} total notifications
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="w-full md:w-auto">
              <ExportMenu users={filteredNotifications} dataType="notifications" />
            </div>
          </div>
        </div>

        {/* ── Empty state ── */}
        {filteredNotifications.length === 0 ? (
          <Card className="border border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {searchTerm ? (
                  <><Search className="h-5 w-5" />No matching notifications found</>
                ) : (
                  <><Bell className="h-5 w-5" />No notifications yet</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "New order notifications will appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border shadow-sm">
            <div className="overflow-hidden rounded-lg">
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-gray-200 px-4 py-3" onClick={() => handleSort("ticket_number")}>
                      <div className="flex items-center font-medium text-gray-700 tracking-wider">
                        Ticket <SortIcon columnKey="ticket_number" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-200 px-4 py-3" onClick={() => handleSort("type")}>
                      <div className="flex items-center font-medium text-gray-700 tracking-wider">
                        Type <SortIcon columnKey="type" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-200 px-4 py-3" onClick={() => handleSort("message")}>
                      <div className="flex items-center font-medium text-gray-700 tracking-wider">
                        Message <SortIcon columnKey="message" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-200 px-4 py-3" onClick={() => handleSort("category")}>
                      <div className="flex items-center font-medium text-gray-700 tracking-wider">
                        Category <SortIcon columnKey="category" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell cursor-pointer hover:bg-gray-200 px-4 py-3" onClick={() => handleSort("status")}>
                      <div className="flex items-center font-medium text-gray-700 tracking-wider">
                        Status <SortIcon columnKey="status" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell cursor-pointer hover:bg-gray-200 px-4 py-3" onClick={() => handleSort("is_read")}>
                      <div className="flex items-center font-medium text-gray-700 tracking-wider">
                        Read <SortIcon columnKey="is_read" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-gray-200 px-4 py-3" onClick={() => handleSort("created_at")}>
                      <div className="flex items-center font-medium text-gray-700 tracking-wider">
                        Date <SortIcon columnKey="created_at" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentNotifications.map((notification, idx) => {
                    const critical = isCritical(notification);

                    /*
                     * Row background logic:
                     *  - Critical  → always red-tinted (red-50), red border-left accent
                     *  - Even row  → white
                     *  - Odd row   → very light gray
                     */
                    const rowBg = critical
                      ? "bg-red-50 hover:bg-red-100/70 border-l-4 border-l-red-500"
                      : idx % 2 === 0
                        ? "bg-white hover:bg-blue-50/50"
                        : "bg-gray-50/50 hover:bg-blue-50/50";

                    return (
                      <TableRow key={idx} className={`transition-colors ${rowBg}`}>

                        {/* Ticket # */}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${critical ? "bg-red-100" : "bg-primary/10"}`}>
                              <User className={`h-4 w-4 ${critical ? "text-red-600" : "text-primary"}`} />
                            </div>
                            <span className={`font-medium ${critical ? "text-red-700" : ""}`}>
                              {notification.ticket_number || "-"}
                            </span>
                            {/* "Critical" badge — only shown on critical rows */}
                            {critical && (
                              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-300 px-2 py-0.5 text-[11px] font-600 text-red-700 leading-none">
                                <AlertCircle className="h-3 w-3" />
                                Critical
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell className="px-4 py-3">
                          <div className={`flex items-center gap-2 ${critical ? "text-red-600" : "text-blue-600"}`}>
                            <div className={`p-2 rounded-full ${critical ? "bg-red-100" : "bg-blue-100"}`}>
                              <Mail className={`h-4 w-4 ${critical ? "text-red-600" : "text-blue-600"}`} />
                            </div>
                            <span className="truncate max-w-[180px]">
                              {notification.type || "-"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Message */}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${critical ? "bg-red-100" : "bg-purple-100"}`}>
                              <Package className={`h-4 w-4 ${critical ? "text-red-500" : "text-purple-600"}`} />
                            </div>
                            <span className={critical ? "text-red-800 font-medium" : ""}>
                              {notification.message || "-"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${critical ? "bg-red-100" : "bg-green-100"}`}>
                              <Building2 className={`h-4 w-4 ${critical ? "text-red-500" : "text-green-600"}`} />
                            </div>
                            <span className={critical ? "text-red-800" : ""}>
                              {notification.category || "-"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="hidden lg:table-cell px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${critical ? "bg-red-100" : "bg-yellow-100"}`}>
                              <IndianRupee className={`h-4 w-4 ${critical ? "text-red-500" : "text-yellow-600"}`} />
                            </div>
                            <span className={`font-medium ${critical ? "text-red-800" : ""}`}>
                              {notification.status || "-"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Read */}
                        <TableCell className="hidden lg:table-cell px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${critical ? "bg-red-100" : "bg-orange-100"}`}>
                              <Tag className={`h-4 w-4 ${critical ? "text-red-500" : "text-orange-600"}`} />
                            </div>
                            <span className={`font-medium ${critical ? "text-red-800" : ""}`}>
                              {notification.is_read ? "Read" : "Unread"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${critical ? "bg-red-100" : "bg-gray-100"}`}>
                              <Calendar className={`h-4 w-4 ${critical ? "text-red-500" : "text-gray-600"}`} />
                            </div>
                            <span className={`text-sm ${critical ? "text-red-800" : ""}`}>
                              {format(new Date(notification.created_at), "MMM dd, yyyy")}
                              <br />
                              <span className={critical ? "text-red-500" : "text-muted-foreground"}>
                                {format(new Date(notification.created_at), "HH:mm")}
                              </span>
                            </span>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{(currentPage - 1) * notificationsPerPage + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * notificationsPerPage, filteredNotifications.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredNotifications.length}</span>{" "}
                  notifications
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1 rounded-lg border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={i + 1 === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg min-w-[40px] ${
                        i + 1 === currentPage
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "border-gray-300 hover:bg-gray-100"
                      } transition-colors`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1 rounded-lg border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorAdminNotifications;