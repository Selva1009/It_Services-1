"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Download,
  ArrowLeft,
  Loader2,
  Search,
  MapPin,
  ChevronDown,
  Edit,
  Check,
  X,
  Building2,
  User,
  Truck,
  ListOrdered,
  Pencil,
  Tag,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "@/app/LandingPage/Footer";
import SignaturePad from "@/app/Components/auth/SignaturePad";
import { Button } from "@/components/ui/button";

const DetailField = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{ label }</p>
    <p className="text-sm font-medium text-gray-900 break-words">
      { value || "N/A" }
    </p>
  </div>
);

const ShipToEditForm = ({ form, onChange }) => (
  <div className="space-y-3">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Address</label>
      <input
        name="address"
        value={ form.address }
        onChange={ onChange }
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">City</label>
        <input
          name="city"
          value={ form.city }
          onChange={ onChange }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">State</label>
        <input
          name="state"
          value={ form.state }
          onChange={ onChange }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Country</label>
        <input
          name="country"
          value={ form.country }
          onChange={ onChange }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Postal Code</label>
        <input
          name="postalCode"
          value={ form.postalCode }
          onChange={ onChange }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);

const POAutomationPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingShipTo, setEditingShipTo] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [currentPOForSignature, setCurrentPOForSignature] = useState(null);
  const sigRef = useRef();
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");

  const [shipToForm, setShipToForm] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const itemsPerPage = 5;
  useEffect(() => {
    const fetchAvailableVouchers = async () => {
      if (!selectedPO) return;

      try {
        setVoucherLoading(true);
        const storedCustomer = localStorage.getItem("customerUser");
        if (!storedCustomer) return;

        const customerData = JSON.parse(storedCustomer);
        const response = await fetch(
          `${API_BASE_URL}/api/voucher-management/customer-users/${customerData.id}/vouchers`
        );

        if (response.ok) {
          const data = await response.json();
          setAvailableVouchers(data);
        } else {
          toast.error("Failed to load available vouchers");
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        toast.error("Error fetching vouchers");
      } finally {
        setVoucherLoading(false);
      }
    };

    fetchAvailableVouchers();
  }, [selectedPO]);

  // Add this function to handle voucher application
  // In your handleApplyVoucher function
  const handleApplyVoucher = async (voucherCode) => {
    if (!selectedPO || !voucherCode) return;

    try {
      setVoucherLoading(true);
      const storedCustomer = localStorage.getItem("customerUser");
      if (!storedCustomer) return;

      const customerData = JSON.parse(storedCustomer);

      const response = await fetch(
        `${API_BASE_URL}/api/voucher-management/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_user_id: customerData.id,
            voucher_code: voucherCode,
            po_id: selectedPO.id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Voucher applied successfully!");

        // Ensure numbers are properly formatted
        const updatedPO = {
          ...selectedPO,
          voucher_code: voucherCode,
          discount_amount: Number(data.discount_amount.toFixed(2)),
          discount_percent: Number(data.discount_percent.toFixed(2)),
          total_amount: Number(data.new_total.toFixed(2)),
        };

        setSelectedPO(updatedPO);
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.id === selectedPO.id ? updatedPO : po))
        );
        setShowVoucherModal(false);
      } else {
        toast.error(data.message || "Failed to apply voucher");
      }
    } catch (error) {
      console.error("Error applying voucher:", error);
      toast.error("Error applying voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  // Add this function to handle voucher removal
  const handleRemoveVoucher = async () => {
    if (!selectedPO || !selectedPO.voucher_code) return;

    try {
      setVoucherLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/voucher-management/purchase-orders/${selectedPO.id}/voucher`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Voucher removed successfully!");

        // Update the selected PO with new values
        const updatedPO = {
          ...selectedPO,
          voucher_code: null,
          discount_amount: 0,
          discount_percent: 0,
          total_amount: data.original_total,
        };

        setSelectedPO(updatedPO);

        // Also update in the purchaseOrders array
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.id === selectedPO.id ? updatedPO : po))
        );

        // Refresh available vouchers
        const storedCustomer = localStorage.getItem("customerUser");
        if (storedCustomer) {
          const customerData = JSON.parse(storedCustomer);
          const voucherResponse = await fetch(
            `${API_BASE_URL}/api/voucher-management/customer-users/${customerData.id}/vouchers`
          );
          if (voucherResponse.ok) {
            setAvailableVouchers(await voucherResponse.json());
          }
        }
      } else {
        toast.error(data.message || "Failed to remove voucher");
      }
    } catch (error) {
      console.error("Error removing voucher:", error);
      toast.error("Error removing voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const storedCustomer = localStorage.getItem("customerUser");
        if (!storedCustomer) {
          setLoading(false);
          return;
        }

        const customerData = JSON.parse(storedCustomer);
        const response = await fetch(
          `${API_BASE_URL}/api/purchase-orders/customer/${customerData.id}`
        );
        const data = await response.json();

        if (response.ok) {
          setPurchaseOrders(data.purchaseOrders || []);
        } else {
          toast.error("Failed to load purchase orders");
        }
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
        toast.error("Error fetching purchase orders");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  const saveSignatureToDB = async (poId, signature) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/purchase-orders/save-signature/${poId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signature }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save signature");
      }

      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.id === poId ? { ...po, customer_signature: signature } : po
        )
      );

      if (selectedPO && selectedPO.id === poId) {
        setSelectedPO((prev) => ({ ...prev, customer_signature: signature }));
      }

      return true;
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Failed to save signature");
      return false;
    }
  };

  const handleSaveSignature = async (dataUrl) => {
    if (currentPOForSignature) {
      const success = await saveSignatureToDB(currentPOForSignature, dataUrl);
      if (success) {
        setShowSignaturePad(false);
        toast.success("Signature saved successfully");
      }
    }
  };

  const handleClearSignature = async () => {
    if (selectedPO) {
      const success = await saveSignatureToDB(selectedPO.id, null);
      if (success) {
        toast.info("Signature cleared");
      }
    }
  };

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (po.po_number?.toLowerCase() || "").includes(searchLower) ||
        (po.customer_name?.toLowerCase() || "").includes(searchLower) ||
        (po.customer_company?.toLowerCase() || "").includes(searchLower) ||
        (po.items?.[0]?.vendor_name?.toLowerCase() || "").includes(
          searchLower
        ) ||
        (po.items?.[0]?.vendor_company?.toLowerCase() || "").includes(
          searchLower
        ) ||
        (po.items?.[0]?.product_name?.toLowerCase() || "").includes(
          searchLower
        ) ||
        (po.status?.toLowerCase() || "").includes(searchLower)
      );
    });
  }, [purchaseOrders, searchTerm]);

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPOs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPOs, currentPage, itemsPerPage]);

  const handleDownloadPDF = async (poId) => {
    setDownloading((prev) => ({ ...prev, [poId]: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/purchase-orders/generate-pdf/${poId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PO_${poId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("PDF downloaded successfully");
      } else {
        toast.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Error generating PDF");
    } finally {
      setDownloading((prev) => ({ ...prev, [poId]: false }));
    }
  };

  const fetchShipToAddress = async (poId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/purchase-orders/${poId}/ship-to-address`
      );
      if (response.ok) {
        const data = await response.json();

        setSelectedPO((prev) => ({
          ...prev,
          ship_to_address: data.ship_to_address,
          ship_to_city: data.ship_to_city,
          ship_to_state: data.ship_to_state,
          ship_to_country: data.ship_to_country,
          ship_to_postal_code: data.ship_to_postal_code,
        }));
      } else {
        toast.error("Failed to fetch ship-to address");
      }
    } catch (error) {
      console.error("Error fetching ship-to address:", error);
      toast.error("Error fetching ship-to address");
    }
  };

  useEffect(() => {
    if (selectedPO?.id) {
      fetchShipToAddress(selectedPO.id);
    }
  }, [selectedPO?.id]);

  const handleEditShipTo = (po) => {
    setEditingShipTo(true);
    setShipToForm({
      address: po.ship_to_address || po.customer_address || "",
      city: po.ship_to_city || po.customer_city || "",
      state: po.ship_to_state || po.customer_state || "",
      country: po.ship_to_country || po.customer_country || "",
      postalCode: po.ship_to_postal_code || po.customer_postal_code || "",
    });
  };
  const handleCancelEdit = () => {
    setEditingShipTo(false);
  };

  const handleSaveShipTo = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/purchase-orders/${selectedPO.id}/ship-to-address`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shipToForm),
        }
      );

      if (response.ok) {
        setPurchaseOrders((prev) =>
          prev.map((po) =>
            po.id === selectedPO.id
              ? {
                ...po,
                ship_to_address: shipToForm.address,
                ship_to_city: shipToForm.city,
                ship_to_state: shipToForm.state,
                ship_to_country: shipToForm.country,
                ship_to_postal_code: shipToForm.postalCode,
              }
              : po
          )
        );
        setSelectedPO((prev) => ({
          ...prev,
          ship_to_address: shipToForm.address,
          ship_to_city: shipToForm.city,
          ship_to_state: shipToForm.state,
          ship_to_country: shipToForm.country,
          ship_to_postal_code: shipToForm.postalCode,
        }));
        toast.success("Ship-to address updated successfully");
        setEditingShipTo(false);
        await fetchShipToAddress(selectedPO.id);
      } else {
        toast.error("Failed to update ship-to address");
      }
    } catch (error) {
      console.error("Error updating ship-to address:", error);
      toast.error("Error updating ship-to address");
    }
  };

  const handleShipToChange = (e) => {
    const { name, value } = e.target;
    setShipToForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenSignaturePad = (poId) => {
    setCurrentPOForSignature(poId);
    setShowSignaturePad(true);
  };

  useEffect(() => {
    const fetchDeliveryNotes = async () => {
      if (!selectedPO?.id) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/purchase-orders/${selectedPO.id}/delivery-notes`
        );
        const data = await res.json();

        if (res.ok) {
          setDeliveryNotes(data.deliveryNotes || "");
        } else {
          console.error("Error fetching delivery notes:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch delivery notes:", err);
      }
    };

    fetchDeliveryNotes();
  }, [selectedPO?.id]);

  const handleSaveDeliveryNotes = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/purchase-orders/${selectedPO.id}/delivery-notes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deliveryNotes }),
        }
      );

      if (res.ok) {
        toast.success("Delivery notes updated successfully!");
        setIsEditingNotes(false);
      } else {
        console.error("Failed to update delivery notes");
        toast.error("Failed to update delivery notes");
      }
    } catch (err) {
      console.error("Error updating delivery notes:", err);
      toast.error("Something went wrong while updating notes");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <Navbar disableFilters={ true } disableSearch={ true } />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ToastContainer position="bottom-right" autoClose={ 3000 } />

        {/* Hero Section */ }
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 pt-24 pb-20 h-[350px] text-white overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-1/4 -left-20 w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
            <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-white rounded-full mix-blend-overlay"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full p-3 mb-6 shadow-lg">
              <FileText size={ 32 } className="text-white" />
            </div>
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
              Purchase Order Tracking
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              { purchaseOrders.length > 0
                ? `You have ${purchaseOrders.length} purchase ${purchaseOrders.length === 1 ? "order" : "orders"
                }`
                : "Your purchase orders will appear here" }
            </p>
          </div>
        </div>

        {/* Main Content */ }
        { selectedPO ? (
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* PO Header */ }
            <div className="flex justify-between mt-6">
              <Button
                onClick={ () => setSelectedPO(null) }
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={ 16 } />
                Back to All POs
              </Button>
            </div>
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                PURCHASE ORDER
              </h1>

              <div className="border-t-2 border-b-2 border-gray-200 py-3 bg-blue-50 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      PO Number:
                    </span>
                    <span className="font-semibold text-blue-600">
                      { selectedPO.po_number }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="font-semibold">
                      { new Date(selectedPO.order_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      ) }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Column Layout */ }
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Vendor Card */ }
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Vendor Details
                  </h3>
                </div>
                <div className="space-y-3">
                  <DetailField
                    label="Name"
                    value={ selectedPO.items[0]?.vendor_name }
                  />
                  <DetailField
                    label="Company"
                    value={ selectedPO.items[0]?.vendor_company }
                  />
                  <DetailField
                    label="Email"
                    value={ selectedPO.items[0]?.vendor_email }
                  />
                  <DetailField
                    label="Address"
                    value={ selectedPO.items[0]?.vendor_address }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField
                      label="City"
                      value={ selectedPO.items[0]?.vendor_city }
                    />
                    <DetailField
                      label="State"
                      value={ selectedPO.items[0]?.vendor_state }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField
                      label="Country"
                      value={ selectedPO.items[0]?.vendor_country }
                    />
                    <DetailField
                      label="Postal Code"
                      value={ selectedPO.items[0]?.vendor_postal_code }
                    />
                  </div>
                </div>
              </div>

              {/* Customer Card */ }
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Customer Details
                  </h3>
                </div>
                <div className="space-y-3">
                  <DetailField label="Name" value={ selectedPO.customer_name } />
                  <DetailField
                    label="Company"
                    value={ selectedPO.customer_company }
                  />
                  <DetailField
                    label="Email"
                    value={ selectedPO.customer_email }
                  />
                  <DetailField
                    label="Address"
                    value={ selectedPO.customer_address }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField
                      label="City"
                      value={ selectedPO.customer_city }
                    />
                    <DetailField
                      label="State"
                      value={ selectedPO.customer_state }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField
                      label="Country"
                      value={ selectedPO.customer_country }
                    />
                    <DetailField
                      label="Postal Code"
                      value={ selectedPO.customer_postal_code }
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Card */ }
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Shipping Address
                    </h3>
                  </div>
                  { !editingShipTo ? (
                    <button
                      onClick={ () => handleEditShipTo(selectedPO) }
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <Edit size={ 14 } />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={ handleSaveShipTo }
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Check size={ 14 } />
                        Save
                      </button>
                      <button
                        onClick={ handleCancelEdit }
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <X size={ 14 } />
                        Cancel
                      </button>
                    </div>
                  ) }
                </div>

                { !editingShipTo ? (
                  <div className="space-y-3">
                    {/* Name and Email: still from shipToForm or customer as before */ }
                    <DetailField
                      label="Name"
                      value={ shipToForm.name || selectedPO.customer_name }
                    />
                    <DetailField
                      label="Email"
                      value={ shipToForm.email || selectedPO.customer_email }
                    />

                    {/* For shipping address fields, show selectedPO.ship_to_* if exists, else customer_* */ }
                    <DetailField
                      label="Address"
                      value={
                        selectedPO.ship_to_address ||
                        selectedPO.customer_address
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <DetailField
                        label="City"
                        value={ selectedPO.ship_to_city }
                      />
                      <DetailField
                        label="State"
                        value={ selectedPO.ship_to_state }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DetailField
                        label="Country"
                        value={ selectedPO.ship_to_country }
                      />
                      <DetailField
                        label="Postal Code"
                        value={ selectedPO.ship_to_postal_code }
                      />
                    </div>
                  </div>
                ) : (
                  <ShipToEditForm
                    form={ shipToForm }
                    onChange={ handleShipToChange }
                  />
                ) }
              </div>
            </div>

            {/* Items Section */ }
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ListOrdered className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Order Items
                </h3>
              </div>

              <div className="relative overflow-visible z-20">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price/Unit
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    { selectedPO.items.map((item, index) => (
                      <tr key={ index } className="hover:bg-gray-50">
                        <td className="px-5 py-4 whitespace-nowrap max-w-xs relative group">
                          <div className="text-sm text-gray-900 truncate">
                            { item.product_name }
                          </div>
                          <div className="text-sm text-gray-500">
                            { item.product_category }
                          </div>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap max-w-xs relative group">
                          <div className="text-sm text-gray-900 truncate">
                            { item.description || "-" }
                          </div>
                          { item.description && (
                            <div className="absolute max-w-lg left-0 top-full mt-1 z-50 hidden group-hover:block w-64 bg-white text-gray-800 text-xs p-2 rounded shadow-lg border border-gray-300">
                              { item.description }
                            </div>
                          ) }
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          { item.quantity }
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{ item.unit_price.toLocaleString() }
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{ (item.unit_price * item.quantity).toLocaleString() }
                        </td>
                      </tr>
                    )) }
                  </tbody>
                </table>
              </div>
            </div>


            {/* Totals Section - Updated with Voucher Info */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  {/* Original Subtotal */ }
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ₹
                      { (
                        selectedPO.total_amount +
                        (selectedPO.discount_amount || 0)
                      ).toLocaleString() }
                    </span>
                  </div>

                  {/* Voucher Discount */ }
                  { selectedPO.voucher_code && (
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                          Voucher Discount ({ selectedPO.discount_percent }%):
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          { selectedPO.voucher_code }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-red-600">
                          -₹{ selectedPO.discount_amount?.toLocaleString() || 0 }
                        </span>
                        <button
                          onClick={ handleRemoveVoucher }
                          disabled={ voucherLoading }
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={ 16 } />
                        </button>
                      </div>
                    </div>
                  ) }

                  {/* Subtotal After Discount */ }
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">
                      Subtotal After Discount:
                    </span>
                    <span className="font-medium">
                      ₹{ selectedPO.total_amount.toLocaleString() }
                    </span>
                  </div>

                  {/* GST Calculations */ }
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST (9%):</span>
                    <span className="font-medium">
                      ₹{ (selectedPO.total_amount * 0.09).toLocaleString() }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST (9%):</span>
                    <span className="font-medium">
                      ₹{ (selectedPO.total_amount * 0.09).toLocaleString() }
                    </span>
                  </div>

                  {/* Grand Total */ }
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-800 font-semibold">
                      Grand Total:
                    </span>
                    <span className="text-blue-600 font-bold">
                      ₹{ (selectedPO.total_amount * 1.18).toLocaleString() }
                    </span>
                  </div>

                  {/* Apply Voucher Button */ }
                  { !selectedPO.voucher_code && (
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={ () => setShowVoucherModal(true) }
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Tag size={ 16 } />
                        Apply Voucher
                      </button>
                    </div>
                  ) }
                </div>
              </div>

              {/* Status and Notes */ }
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order Status
                  </h3>
                  <div className="relative w-40">
                    <div className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm text-gray-700">
                      { selectedPO.status || "PENDING" }
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Remarks
                    </h3>
                    { !isEditingNotes ? (
                      <button
                        onClick={ () => setIsEditingNotes(true) }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit size={ 14 } />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={ handleSaveDeliveryNotes }
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Check size={ 14 } />
                        Save
                      </button>
                    ) }
                  </div>
                  <textarea
                    value={ deliveryNotes }
                    onChange={ (e) => setDeliveryNotes(e.target.value) }
                    readOnly={ !isEditingNotes }
                    placeholder="Add any special delivery instructions..."
                    className={ `w-full px-3 py-2 border rounded-md text-sm ${isEditingNotes
                        ? "border-blue-300 focus:ring-2 focus:ring-blue-200"
                        : "border-gray-200 bg-gray-50"
                      }` }
                    rows={ 3 }
                  />
                </div>
              </div>
            </div>
            {/* Voucher Application Modal */ }
            { showVoucherModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Apply Voucher</h2>
                    <button
                      onClick={ () => setShowVoucherModal(false) }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={ 20 } />
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Voucher Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ voucherCodeInput }
                        onChange={ (e) => setVoucherCodeInput(e.target.value) }
                        placeholder="Enter voucher code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={ () => handleApplyVoucher(voucherCodeInput) }
                        disabled={ voucherLoading || !voucherCodeInput }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                      >
                        { voucherLoading ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          "Apply"
                        ) }
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Available Vouchers
                    </h3>
                    { voucherLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                      </div>
                    ) : availableVouchers.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        { availableVouchers.map((voucher) => (
                          <div
                            key={ voucher.id }
                            className={ `p-3 border rounded-md flex justify-between items-center ${voucher.is_used
                                ? "bg-gray-100 border-gray-200"
                                : "bg-white border-gray-300"
                              }` }
                          >
                            <div>
                              <div className="font-medium">{ voucher.code }</div>
                              <div className="text-xs text-gray-500">
                                { voucher.discount_percent }% discount • Valid
                                until{ " " }
                                { new Date(
                                  voucher.valid_to
                                ).toLocaleDateString() }
                              </div>
                            </div>
                            { voucher.is_used ? (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                Used
                              </span>
                            ) : (
                              <button
                                onClick={ () => {
                                  setVoucherCodeInput(voucher.code);
                                  handleApplyVoucher(voucher.code);
                                } }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Apply
                              </button>
                            ) }
                          </div>
                        )) }
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No available vouchers
                      </div>
                    ) }
                  </div>
                </div>
              </div>
            ) }
          </div>

        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Purchase Orders
              </h2>
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search POs..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={ searchTerm }
                  onChange={ (e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  } }
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PO Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  { currentItems.length > 0 ? (
                    currentItems.map((po) => (
                      <tr key={ po.id } className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            { po.po_number }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { new Date(po.order_date).toLocaleDateString() }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { po.items[0].vendor_name }
                          </div>
                          <div className="text-sm text-gray-500">
                            { po.items[0].vendor_company }
                          </div>
                          <div className="text-sm text-gray-500">
                            { po.items[0].vendor_email }
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 w-[200px] break-words">
                            { po.items[0].product_name }
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 relative group w-max max-w-[200px]">
                            <span className="truncate block">
                              { (po.items?.[0]?.description || "")
                                .split(" ")
                                .slice(0, 3)
                                .join(" ") + "..." }
                            </span>
                            { po.items?.[0]?.description && (
                              <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-300 text-gray-900 text-xs p-2 rounded shadow-md w-64 top-full mt-1">
                                { po.items[0].description }
                              </div>
                            ) }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{ po.items[0].unit_price.toLocaleString() }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { po.items[0].quantity }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { po.status }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={ () => setSelectedPO(po) }
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1 px-3 py-1 rounded bg-blue-50 hover:bg-blue-100"
                            >
                              <FileText size={ 14 } />
                              View
                            </button>
                            <button
                              onClick={ () => handleOpenSignaturePad(po.id) }
                              className="text-teal-600 hover:text-teal-900 flex items-center gap-1 px-3 py-1 rounded bg-teal-50 hover:bg-teal-100"
                            >
                              <Pencil size={ 16 } />
                              <span>
                                { po.customer_signature ? "Re-sign" : "Sign" }
                              </span>
                            </button>
                            <button
                              onClick={ () => handleDownloadPDF(po.id) }
                              disabled={ downloading[po.id] }
                              className="text-green-600 hover:text-green-900 flex items-center gap-1 px-3 py-1 rounded bg-green-50 hover:bg-green-100"
                            >
                              { downloading[po.id] ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <Download size={ 14 } />
                              ) }
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        { searchTerm
                          ? "No matching purchase orders found"
                          : "No purchase orders found. Initiate POs from your cart." }
                      </td>
                    </tr>
                  ) }
                </tbody>
              </table>
            </div>

            {/* Signature Modal */ }
            { showSignaturePad && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Add Your Signature</h2>
                  <SignaturePad
                    ref={ sigRef }
                    onSave={ handleSaveSignature }
                    onClose={ () => setShowSignaturePad(false) }
                  />
                </div>
              </div>
            ) }

            {/* Pagination */ }
            { filteredPOs.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={ () =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={ currentPage === 1 }
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={ () =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={ currentPage === totalPages }
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{ " " }
                      <span className="font-medium">
                        { (currentPage - 1) * itemsPerPage + 1 }
                      </span>{ " " }
                      to{ " " }
                      <span className="font-medium">
                        { Math.min(
                          currentPage * itemsPerPage,
                          filteredPOs.length
                        ) }
                      </span>{ " " }
                      of{ " " }
                      <span className="font-medium">{ filteredPOs.length }</span>{ " " }
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={ () => setCurrentPage(1) }
                        disabled={ currentPage === 1 }
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">First</span>
                        &laquo;
                      </button>
                      <button
                        onClick={ () =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={ currentPage === 1 }
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        &lsaquo;
                      </button>
                      { Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={ pageNum }
                              onClick={ () => setCurrentPage(pageNum) }
                              className={ `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }` }
                            >
                              { pageNum }
                            </button>
                          );
                        }
                      ) }
                      <button
                        onClick={ () =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={ currentPage === totalPages }
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        &rsaquo;
                      </button>
                      <button
                        onClick={ () => setCurrentPage(totalPages) }
                        disabled={ currentPage === totalPages }
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Last</span>
                        &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            ) }
          </div>
        ) }
      </div>
      <Footer />
    </>
  );
};

export default POAutomationPage;
