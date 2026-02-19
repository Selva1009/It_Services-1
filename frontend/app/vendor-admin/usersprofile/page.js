"use client";
import { API_BASE_URL } from "@/lib/api/config";
import Navbar from "../components/navbar";
import { Input } from "@/components/ui/input";
import { EditUserForm } from "../components/editUserProfile";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Search,
  Edit,
  Trash2,
  UserCog,
  Loader2,
  Building2,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  FolderSearch,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import ExportMenu from "@/app/Components/auth/ExportMenu";
import TransferProducts from "../components/transferData"; // Import the TransferProducts component

const Page = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorID, setVendorID] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false); // New state for transfer modal
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const vendorRef = useRef();

  useEffect(() => {
    const fetchVendorId = () => {
      const storedVendor =
        localStorage.getItem("vendor") ||
        localStorage.getItem("vendorUserId") ||
        localStorage.getItem("vendorAdminId");

      if (storedVendor) {
        try {
          let vendorData;
          if (storedVendor.startsWith("{")) {
            vendorData = JSON.parse(storedVendor);
          } else {
            vendorData = { id: storedVendor };
          }

          if (vendorData.id) {
            vendorRef.current = vendorData.id;
            setVendorID(Number(vendorData.id));
          } else {
            console.error("Vendor ID not found in vendor data");
          }
        } catch (err) {
          console.error("Invalid vendor data:", err);
        }
      } else {
        console.error("No vendor ID found in localStorage");
      }
    };

    fetchVendorId();
  }, []);

  useEffect(() => {
    if (!vendorID) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/vendor-users/users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ vendorId: vendorID }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        const usersWithIds = data.map((user) => ({
          ...user,
          id: user.id,
        }));

        setUsers(usersWithIds);
      } catch (error) {
        console.error("Error fetching users:", error);
        Swal.fire("Error", `Failed to load users: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [vendorID]);

  const handleDelete = async (userId) => {
    if (!vendorID) {
      Swal.fire(
        "Error",
        "Vendor ID is missing. Please refresh the page.",
        "error"
      );
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete the user account.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(
        `${API_BASE_URL}/api/vendor-users/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            vendorId: vendorID,
            userId: userId,
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      let data = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Unexpected response format:", text);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      Swal.fire("Deleted!", "The user has been removed.", "success");
    } catch (error) {
      console.error("Delete operation failed:", error);
      let errorMsg = "Failed to delete user";
      if (error.message.includes("foreign key constraint")) {
        errorMsg =
          "Cannot delete user with associated records. Please remove records first.";
      }
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const handleUserUpdate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vendor-users/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ vendorId: vendorID }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", `Failed to reload users: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.personName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm) ||
      user.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <UserCog className="text-blue-600" size={ 28 } />
              </div>
              <span className="pt-1">Vendor Users</span>
            </h1>
            <p className="text-sm text-gray-500 mt-2 ml-1">
              Manage all users created under your vendor account
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={ () => setShowTransfer(true) }
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Transfer Products</span>
            </Button>

            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 pr-4 py-2 rounded-xl bg-white shadow-sm border border-gray-300 
               hover:border-blue-500 focus:border-blue-500 focus:ring-0 focus:outline-none transition-all"
                placeholder="Search by name, email, or company"
                value={ searchTerm }
                onChange={ (e) => setSearchTerm(e.target.value) }
              />
            </div>
            <ExportMenu users={ filteredUsers } dataType="users" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          { loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-500">Loading user data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <FolderSearch className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">
                No users found
              </h3>
              <p className="text-gray-500 mt-1">
                { searchTerm
                  ? "Try a different search term"
                  : "Create your first user" }
              </p>
            </div>
          ) : (
            <>
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="pl-7 py-4 font-medium text-gray-700 tracking-wider">
                      Company Name
                    </TableHead>
                    <TableHead className="py-4 font-medium text-gray-700 tracking-wider">
                      Contact Person
                    </TableHead>
                    <TableHead className="py-4 font-medium text-gray-700 tracking-wider">
                      Contact
                    </TableHead>
                    <TableHead className="py-4 font-medium text-gray-700 tracking-wider">
                      Email
                    </TableHead>
                    <TableHead className="py-4 font-medium text-gray-700 tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="pr-6 py-4 font-medium text-gray-700 tracking-wider text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  { currentUsers.map((user) => (
                    <TableRow
                      key={ user.id }
                      className="border-t border-gray-100 transition-colors hover:bg-blue-50/50"
                    >
                      <TableCell className="pl-6 py-4 font-medium text-gray-800">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="font-medium">
                            { user.companyName || "N/A" }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          { user.personName || "N/A" }
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          { user.phoneNumber || "N/A" }
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <a
                          href={ `mailto:${user.Email}` }
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        >
                          <Mail className="h-4 w-4" />
                          <span className="truncate max-w-[180px]">
                            { user.Email || "N/A" }
                          </span>
                        </a>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={ `px-3 py-1 rounded-full text-xs font-medium ${user.status === "Active"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                            } flex items-center gap-1` }
                        >
                          { user.status === "Active" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          ) }
                          { user.status || "Inactive" }
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors h-8 w-8 p-0"
                            onClick={ () => setEditingUser(user) }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors h-8 w-8 p-0"
                            onClick={ () => handleDelete(user.id) }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) }
                </TableBody>
              </Table>

              <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-sm text-gray-500">
                  Showing{ " " }
                  <span className="font-medium">
                    { (currentPage - 1) * usersPerPage + 1 }
                  </span>{ " " }
                  to{ " " }
                  <span className="font-medium">
                    { Math.min(currentPage * usersPerPage, filteredUsers.length) }
                  </span>{ " " }
                  of <span className="font-medium">{ filteredUsers.length }</span>{ " " }
                  users
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ currentPage === 1 }
                    onClick={ () => setCurrentPage((prev) => prev - 1) }
                    className="px-3 py-1 rounded-lg border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  { Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={ `page-${i}` }
                      variant={ i + 1 === currentPage ? "default" : "outline" }
                      size="sm"
                      onClick={ () => setCurrentPage(i + 1) }
                      className={ `px-3 py-1 rounded-lg min-w-[40px] ${i + 1 === currentPage
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "border-gray-300 hover:bg-gray-100"
                        } transition-colors` }
                    >
                      { i + 1 }
                    </Button>
                  )) }
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ currentPage === totalPages }
                    onClick={ () => setCurrentPage((prev) => prev + 1) }
                    className="px-3 py-1 rounded-lg border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) }
        </div>
      </div>

      { editingUser && (
        <EditUserForm
          user={ editingUser }
          onClose={ () => setEditingUser(null) }
          onUpdate={ handleUserUpdate }
        />
      ) }

      { showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={ () => setShowTransfer(false) }
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <TransferProducts onClose={ () => setShowTransfer(false) } />
          </div>
        </div>
      ) }
    </div>
  );
};

export default Page;
