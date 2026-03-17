"use client";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import { CustomerAddUser } from "@/app/Components/auth/CustomerAddUser";
import { PasswordSection } from "@/app/Components/auth/PasswordSection";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useUserFormValidation } from "@/app/hooks/useUserFormValidation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { createCustomerUser, fetchCustomerAdminCompanyName } from "@/app/services/customerAdminService";

const Page = () => {
  const router = useRouter();
  useEffect(() => {
    ["/customer-admin/user-profile"].forEach((path) => router.prefetch(path));
  }, []);
  const { validateForm } = useUserFormValidation();
  const { auth } = useAuth();
  const [adminID, setAdminId] = useState(null);
  const [formValues, setFormValues] = useState({

    personName: "",
    contactNumber: "",
    Email: "",
    password: "",
    confirmPassword: "",
    adminID: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const customerData = auth.customer;
    if (customerData?.id) {
      setAdminId(customerData.id);
      setFormValues((prev) => ({
        ...prev,
        adminID: customerData.id,
      }));
    }
  }, [auth.customer]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formValues.adminID) {
      Swal.fire({
        title: "Error",
        text: "Admin session not found. Please login again.",
        icon: "error",
      });
      setIsSubmitting(false);
      return;
    }

    const { isValid, errors: validationErrors } = validateForm(formValues);
    if (!isValid) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createCustomerUser(formValues);
      if (result) {
        Swal.fire({
          title: "Success!",
          text: "User created successfully",
          icon: "success",
          confirmButtonColor: "#4BB543",
        }).then(() => {
          router.push("/customer-admin/user-profile");
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

useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const customerData = auth.customer;
        if (customerData?.id) {
          setAdminId(customerData.id);

          const data = await fetchCustomerAdminCompanyName(customerData.id);
          if (data?.companyName) {
            setFormValues((prev) => ({
              ...prev,
              companyName: data.companyName,
              adminID: customerData.id,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      }
    };  // ← fetchAdminData closes here

    fetchAdminData();
  }, [auth.customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "companyName" && formValues.companyName) {
      return;
    }
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <CustomerAdminNavbar />
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-gray-200">
          {/* Form Header */ }
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <UserPlus className="text-blue-600" size={ 22 } />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Create New User</h2>
                <p className="text-sm text-gray-500">Add a user to your organization</p>
              </div>
            </div>
          </div>

          <form onSubmit={ handleSubmit } className="px-6 py-6 space-y-6">
            {/* Basic Info Section */ }
            <div>
              <div className="text-sm font-medium text-gray-700 bg-blue-50 rounded-md px-3 py-1 inline-block mb-3">
                Basic Information
              </div>
              <div className="grid grid-cols-2 gap-2">
                <CustomerAddUser
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



            {/* Action Buttons */ }
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
                { isSubmitting ? "Creating..." : "Create" }
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>

  );
};

export default Page;
