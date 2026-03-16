"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCog, Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

export const EditUserForm = ({ user, onClose, onUpdate }) => {
  const { getAuthToken: getAuthTokenFromContext } = useAuth();
  const [formData, setFormData] = useState({
    companyName: "",
    personName: "",
    Email: "",
    contactNumber: "",
    status: "Active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || "",
        personName: user.personName || "",
        Email: user.Email || "",
        contactNumber: user.contactNumber || "",
        status: user.status || "Active",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { companyName, personName, contactNumber, Email, status } = formData;

    try {
      let userId = user?.id;

      if (!userId) {
        throw new Error("No user ID found in user object");
      }

      // Force userId to be number
      userId = Number(userId);
      if (isNaN(userId)) {
        throw new Error(`Invalid user ID format: ${user.id}`);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/customer-users/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthTokenFromContext() || sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            companyName,
            personName,
            contactNumber,
            Email,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      Swal.fire("Success", data.message, "success");
      onUpdate(); // Refresh the user list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Update error details:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={ { opacity: 0 } }
        animate={ { opacity: 1 } }
        exit={ { opacity: 0 } }
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={ { y: 20, opacity: 0 } }
          animate={ { y: 0, opacity: 1 } }
          exit={ { y: 20, opacity: 0 } }
          transition={ { type: "spring", damping: 30 } }
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl rounded-xl border-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-blue-600" />
                    Edit User Details
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Update the user information below
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ onClose }
                  className="rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={ handleSubmit }>
              <CardContent className=" px-6 py-4 grid grid-cols-2 gap-2">
                <div className="space-y-3">
                  <Label
                    htmlFor="companyName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={ formData.companyName }
                    onChange={ handleChange }
                    className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="personName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Contact Person
                  </Label>
                  <Input
                    id="personName"
                    name="personName"
                    value={ formData.personName }
                    onChange={ handleChange }
                    className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="Email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="Email"
                    name="Email"
                    type="email"
                    value={ formData.Email }
                    onChange={ handleChange }
                    className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="contactNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={ formData.contactNumber }
                    onChange={ handleChange }
                    className="focus-visible:ring-2 focus-visible:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700"
                  >
                    Status
                  </Label>
                  <Select
                    value={ formData.status }
                    onValueChange={ handleStatusChange }
                  >
                    <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active" className="focus:bg-blue-50">
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Active
                        </span>
                      </SelectItem>
                      <SelectItem value="Inactive" className="focus:bg-blue-50">
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                          Inactive
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={ onClose }
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  disabled={ isSubmitting }
                >
                  { isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  ) }
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
