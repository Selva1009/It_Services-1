"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigLeftDash, DiscAlbum } from "lucide-react";
import { FiEdit2 } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Navbar from "../components/Navbar";
import Swal from "sweetalert2";
import Footer from "@/app/LandingPage/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CUSTOMER_USER_UPDATED_EVENT,
  notifyCustomerUserUpdated,
} from "@/lib/events";

const CustomerProfile = () => {
  const [customerUser, setCustomerUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    personName: "",
    Email: "",
    contactNumber: "",
    status: "",
    id: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  const buildCustomerUserState = (user = {}) => ({
    companyName: user.companyName || "",
    personName: user.personName || "",
    Email: user.Email || "",
    contactNumber: user.contactNumber || "",
    status: user.status || "",
    id: user.id || "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      const storedUser = localStorage.getItem("customerUser");
      if (!storedUser) {
        router.push("/SignIn");
        return;
      }

      try {
        const userData = JSON.parse(storedUser);

        if (!userData?.id) {
          router.push("/SignIn");
          return;
        }

        try {
          const authToken = getAuthToken();
          const response = await fetch(
            `${API_BASE_URL}/api/customer-users/profile`,
            {
              cache: "no-store",
              headers: authToken
                ? { Authorization: `Bearer ${authToken}` }
                : undefined,
            }
          );

          if (response.ok) {
            const latestUser = await response.json();
            const completeUserData = {
              ...userData,
              ...latestUser,
            };
            const normalizedUser = {
              ...completeUserData,
              ...buildCustomerUserState(completeUserData),
            };

            if (isMounted) {
              setCustomerUser(normalizedUser);
              setFormData(buildCustomerUserState(normalizedUser));
              localStorage.setItem("customerUser", JSON.stringify(normalizedUser));
            }
            return;
          }
        } catch (fetchError) {
          console.error("Error fetching latest customer profile:", fetchError);
        }

        const fallbackUser = {
          ...userData,
          ...buildCustomerUserState(userData),
        };
        if (isMounted) {
          setCustomerUser(fallbackUser);
          setFormData(buildCustomerUserState(fallbackUser));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/SignIn");
      }
    };

    void loadUserData();

    const handleStorageChange = () => {
      void loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CUSTOMER_USER_UPDATED_EVENT, handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CUSTOMER_USER_UPDATED_EVENT, handleStorageChange);
    };
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/customer-users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            companyName: formData.companyName,
            personName: formData.personName,
            Email: formData.Email,
            contactNumber: formData.contactNumber,
            status: formData.status
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      const responseData = await response.json().catch(() => ({}));
      const updatedUser = responseData.user || responseData;
      const completeUserData = {
        ...customerUser,
        ...formData,
        ...updatedUser,
        id: formData.id
      };
      const normalizedUser = {
        ...completeUserData,
        ...buildCustomerUserState(completeUserData),
      };

      localStorage.setItem("customerUser", JSON.stringify(normalizedUser));
      setCustomerUser(normalizedUser);
      setFormData(buildCustomerUserState(normalizedUser));
      setIsEditing(false);
      notifyCustomerUserUpdated();

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your changes have been saved successfully",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Could not update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!customerUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const profileFields = [
    { label: "Company Name", name: "companyName", type: "text", disabled: true },
    { label: "Contact Person", name: "personName", type: "text" },
    { label: "Email", name: "Email", type: "email" },
    { label: "Contact Number", name: "contactNumber", type: "tel" },
    { label: "Status", name: "status", disabled: true }
  ];

  return (
    <>
      <Navbar disableFilters={ true } disableSearch={ true } />
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <button
              onClick={ () => router.push("/customer/products") }
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Back to products"
            >
              <ArrowBigLeftDash className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl -ml-4 font-bold text-gray-800">My Profile</h1>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex items-center">
              <div className="relative">
                <img
                  src="/User_Icon.jpg"
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                { isEditing && (
                  <div className="absolute bottom-0 right-0 bg-blue-100 p-1.5 rounded-full border-2 border-white">
                    <FiEdit2 className="text-blue-600 h-4 w-4" />
                  </div>
                ) }
              </div>
              <div className="ml-5">
                <h2 className="text-xl font-semibold text-gray-800">
                  { customerUser.personName }
                </h2>
                <p className="text-sm text-gray-600">Customer Account</p>
              </div>
            </div>

            <div className="p-6">
              { !isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  { profileFields.map(({ label, name }) => (
                    <div key={ name } className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        { label }
                      </p>
                      <p className="text-base font-medium text-gray-800 break-words">
                        { customerUser[name] || (
                          <span className="text-gray-400 italic">Not provided</span>
                        ) }
                      </p>
                    </div>
                  )) }
                </div>
              ) : (
                <form onSubmit={ handleSave } className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    { profileFields.map(({ label, name, type, disabled }) => (
                      <div key={ name } className="space-y-2">
                        <Label htmlFor={ name } className="text-gray-700">
                          { label }
                        </Label>
                        <Input
                          id={ name }
                          name={ name }
                          type={ type }
                          value={ formData[name] || "" }
                          onChange={ handleChange }
                          required
                          className="focus:ring-2 focus:ring-blue-500"
                          disabled={ disabled }
                        />
                      </div>
                    )) }
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={ () => {
                        setFormData(customerUser);
                        setIsEditing(false);
                      } }
                      disabled={ isLoading }
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={ isLoading }>
                      { isLoading ? (
                        <span className="flex items-center">
                          <AiOutlineLoading3Quarters className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      ) }
                    </Button>
                  </div>
                </form>
              ) }

              { !isEditing && (
                <div className="flex justify-end mt-8">
                  <Button
                    onClick={ () => setIsEditing(true) }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </Button>
                </div>
              ) }
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerProfile;

