"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { VendorAddUser } from "@/app/Components/auth/VendorAddUser";
import { PasswordSection } from "@/app/Components/auth/PasswordSection";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useUserFormValidation } from "@/app/hooks/useUserFormValidation";

const Page = () => {
  const router = useRouter();
  const { validateForm } = useUserFormValidation();
  const [formValues, setFormValues] = useState({
    companyName: "",
    personName: "",
    phoneNumber: "",
    Email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [vendorId, setVendorId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedVendor = localStorage.getItem("vendor");
    if (storedVendor) {
      try {
        const vendorData = JSON.parse(storedVendor);
        setVendorId(vendorData.id);
      } catch (err) {
        console.error("Invalid vendor data:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      const storedVendor = localStorage.getItem("vendor");
      if (storedVendor) {
        try {
          const vendorData = JSON.parse(storedVendor);
          setAdminId(vendorData.id);

          const response = await fetch(
            `${API_BASE_URL}/api/vendor-users/company-name/${vendorData.id}`
          );

          if (response.ok) {
            const data = await response.json();
            setFormValues((prev) => ({
              ...prev,
              companyName: data.companyName,
              adminID: vendorData.id,
            }));
          } else {
            console.error("Failed to fetch vendor admin details");
          }
        } catch (err) {
          console.error("Error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAdminData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "companyName" && formValues.companyName) {
      return;
    }
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!vendorId) {
      Swal.fire({
        title: "Error",
        text: "Vendor session not found. Please login again.",
        icon: "error",
      });
      setIsSubmitting(false);
      return;
    }

    // Use the validation hook
    const { isValid, errors: validationErrors } = validateForm(formValues);
    if (!isValid) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formValues,
        vendorId: vendorId,
        vendorAdminId: adminId,
      };

      const response = await fetch(`${API_BASE_URL}/api/vendor-users/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('vendorToken')}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Vendor user created successfully",
          icon: "success",
          confirmButtonColor: "#4BB543",
        }).then(() => {
          router.push("/vendor-admin/usersprofile");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message || "Failed to create vendor user",
          icon: "error",
          confirmButtonColor: "#D9534F",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Network error occurred",
        icon: "error",
        confirmButtonColor: "#D9534F",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6 w-full">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-gray-200 mx-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <UserPlus className="text-blue-600" size={ 22 } />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Create New Vendor User</h2>
                <p className="text-sm text-gray-500">Add a user to your vendor organization</p>
              </div>
            </div>
          </div>

          <form onSubmit={ handleSubmit } className="px-6 py-6 space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-700 bg-blue-50 rounded-md px-3 py-1 inline-block mb-3">
                Basic Information
              </div>
              <div className="grid grid-cols-2 gap-2">
                <VendorAddUser
                  formValues={ formValues }
                  handleInputChange={ handleInputChange }
                  errors={ errors }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PasswordSection
                  formValues={ formValues }
                  handleInputChange={ handleInputChange }
                  errors={ errors }
                  showPassword={ showPassword }
                  togglePasswordVisibility={ togglePasswordVisibility }
                  showConfirmPassword={ showConfirmPassword }
                  toggleConfirmPasswordVisibility={ toggleConfirmPasswordVisibility }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                className="text-sm text-gray-700 px-4 py-2 border-gray-300 hover:bg-gray-50"
                onClick={ () => window.history.back() }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-sm px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={ isSubmitting }
              >
                { isSubmitting ? "Creating..." : "Create User" }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
