"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";

const UpdateUserPage = () => {
  const router = useRouter();
  const { getVendorUserId } = useAuth();
  const [form, setForm] = useState({
    companyName: "",
    personName: "",
    phoneNumber: "",
    email: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorUserId, setVendorUserId] = useState(null); // <-- New state for vendorUserId

  useEffect(() => {
    const id = getVendorUserId() || sessionStorage.getItem("vendorUserId");
    if (!id) {
      Swal.fire("Error", "No user ID found in localStorage", "error");
      return;
    }
    setVendorUserId(id); // <-- Store the vendorUserId

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/vendor-users/profile/${id}`);
        const data = await res.json();

        if (res.ok && data) {
          setForm({
            companyName: data.companyName || "",
            personName: data.personName || "",
            phoneNumber: data.phoneNumber || "",
            email: data.Email || data.email || "",
            status: data.status || "Active",
          });
        } else {
          Swal.fire("Error", data.message || "Failed to load user data", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Failed to fetch user details", "error");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setForm((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { companyName, personName, phoneNumber, email, status } = form;

    if (!companyName || !personName || !phoneNumber || !email) {
      setIsSubmitting(false);
      return Swal.fire("Error", "All fields are required", "error");
    }

    // Check for vendorUserId state (which is set from localStorage)
    if (!vendorUserId) {
      setIsSubmitting(false);
      return Swal.fire("Error", "No user ID found in localStorage", "error");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor-users/profile/${vendorUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName, personName, phoneNumber, Email: email, status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update user");
      }

      await Swal.fire({
        title: "Success!",
        text: result.message || "User updated successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8fafc",
      });

      router.push("/vendor-admin/usersprofile");
    } catch (error) {
      Swal.fire("Update Failed", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <Card className="shadow-2xl rounded-xl border-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Edit Vendor User</CardTitle>
          <CardDescription className="mt-1">
            Update the user information below
          </CardDescription>
        </CardHeader>

        <form onSubmit={ handleSubmit }>
          <CardContent className="px-6 py-4 grid gap-4">
            { [
              { id: "companyName", label: "Company Name" },
              { id: "personName", label: "Contact Person" },
              { id: "phoneNumber", label: "Phone Number" },
              { id: "email", label: "Email", type: "email" },
            ].map(({ id, label, type = "text" }) => (
              <div className="space-y-3" key={ id }>
                <Label htmlFor={ id }>{ label }</Label>
                <Input
                  id={ id }
                  name={ id }
                  value={ form[id] }
                  type={ type }
                  onChange={ handleChange }
                  required
                  className="focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            )) }

            <div className="space-y-3">
              <Label htmlFor="status">Status</Label>
              <Select value={ form.status } onValueChange={ handleStatusChange }>
                <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      Active
                    </span>
                  </SelectItem>
                  <SelectItem value="Inactive">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                      Inactive
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={ () => router.push("/vendor-admin/usersprofile") }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={ isSubmitting }
            >
              { isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update User"
              ) }
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UpdateUserPage;

