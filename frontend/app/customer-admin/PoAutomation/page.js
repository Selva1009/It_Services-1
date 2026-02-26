"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  ArrowLeft,
  Loader2,
  Search,
  Edit,
  Check,
  X,
  Building2,
  User,
  Truck,
  ListOrdered,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 5;

const getPrimaryItem = (po) => {
  if (!Array.isArray(po?.items) || po.items.length === 0) return null;
  return po.items[0];
};

const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return "N/A";
  return `₹${numericAmount.toLocaleString("en-IN")}`;
};

const formatOrderDate = (dateValue, options) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", options);
};

const truncateWords = (text, words = 3) => {
  if (!text) return "N/A";
  const parts = String(text).trim().split(/\s+/);
  if (parts.length <= words) return parts.join(" ");
  return `${parts.slice(0, words).join(" ")}...`;
};

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
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingShipTo, setEditingShipTo] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [shipToForm, setShipToForm] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const selectedPrimaryItem = getPrimaryItem(selectedPO);
  const selectedSubtotal = Number(selectedPO?.total_amount || 0);
  const selectedCgst = selectedSubtotal * 0.09;
  const selectedGrandTotal = selectedSubtotal * 1.18;

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const storedCustomer = localStorage.getItem("customer");
        if (!storedCustomer) {
          router.push("/SignIn");
          return;
        }

        let customerData;
        try {
          customerData = JSON.parse(storedCustomer);
        } catch (err) {
          console.error("Invalid customer data:", err);
          router.push("/SignIn");
          return;
        }

        const adminId = customerData.adminID || customerData.id;

        if (!adminId) {
          router.push("/SignIn");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/purchase-orders/company-admin/${adminId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Request failed");
        }

        setPurchaseOrders(data.purchaseOrders || []);
        setCompanyName(data.companyName || "");
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, [router]);


  const DetailField = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 mb-1">{ label }</p>
      <p className="text-sm font-medium text-gray-900 break-words">
        { value || "N/A" }
      </p>
    </div>
  );

  // Filter POs based on search term
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const searchLower = searchTerm.toLowerCase();
      const primaryItem = getPrimaryItem(po);

      return (
        (po.po_number?.toLowerCase() || "").includes(searchLower) ||
        (po.customer_name?.toLowerCase() || "").includes(searchLower) ||
        (po.customer_company?.toLowerCase() || "").includes(searchLower) ||
        (primaryItem?.vendor_name?.toLowerCase() || "").includes(searchLower) ||
        (primaryItem?.vendor_company?.toLowerCase() || "").includes(
          searchLower
        ) ||
        (primaryItem?.product_name?.toLowerCase() || "").includes(searchLower) ||
        (po.status?.toLowerCase() || "").includes(searchLower)
      );
    });
  }, [purchaseOrders, searchTerm]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredPOs.length / ITEMS_PER_PAGE));
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPOs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPOs, currentPage]);

  useEffect(() => {
    if (!filteredPOs.length && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredPOs.length, totalPages]);

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

  const handleEditShipTo = (po) => {
    setEditingShipTo(true);
    setShipToForm({
      address: po.ship_to_address || po.customer_address,
      city: po.ship_to_city || po.customer_city,
      state: po.ship_to_state || po.customer_state,
      country: po.ship_to_country || po.customer_country,
      postalCode: po.ship_to_postal_code || po.customer_postal_code,
    });
  };

  const handleCancelEdit = () => {
    setEditingShipTo(false);
  };


  const fetchShipToAddress = async (poId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${poId}/ship-to-address`);
      if (response.ok) {
        const data = await response.json();

        setSelectedPO((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ship_to_address: data.ship_to_address,
            ship_to_city: data.ship_to_city,
            ship_to_state: data.ship_to_state,
            ship_to_country: data.ship_to_country,
            ship_to_postal_code: data.ship_to_postal_code,
          };
        });
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

  const handleSaveShipTo = async () => {
    if (!selectedPO?.id) return;

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
    if (!selectedPO?.id) return;

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
        setIsEditingNotes(false);
      } else {
        console.error("Failed to update delivery notes");
      }
    } catch (err) {
      console.error("Error updating delivery notes:", err);
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
      <CustomerAdminNavbar />
      <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100">
        <ToastContainer position="bottom-right" autoClose={ 3000 } />

        {/* Main Content */ }
        { selectedPO ? (
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
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
            {/* PO Header */ }
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
                      { formatOrderDate(selectedPO.order_date, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }) }
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
                    value={ selectedPrimaryItem?.vendor_name }
                  />
                  <DetailField
                    label="Company"
                    value={ selectedPrimaryItem?.vendor_company }
                  />
                  <DetailField
                    label="Email"
                    value={ selectedPrimaryItem?.vendor_email }
                  />
                  <DetailField
                    label="Address"
                    value={ selectedPrimaryItem?.vendor_address }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField
                      label="City"
                      value={ selectedPrimaryItem?.vendor_city }
                    />
                    <DetailField
                      label="State"
                      value={ selectedPrimaryItem?.vendor_state }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailField
                      label="Country"
                      value={ selectedPrimaryItem?.vendor_country }
                    />
                    <DetailField
                      label="Postal Code"
                      value={ selectedPrimaryItem?.vendor_postal_code }
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
                    <DetailField
                      label="Name"
                      value={ selectedPO.customer_name }
                    />
                    <DetailField
                      label="Company"
                      value={ selectedPO.customer_company }
                    />
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
                        value={
                          selectedPO.ship_to_city || selectedPO.customer_city
                        }
                      />
                      <DetailField
                        label="State"
                        value={
                          selectedPO.ship_to_state || selectedPO.customer_state
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DetailField
                        label="Country"
                        value={
                          selectedPO.ship_to_country ||
                          selectedPO.customer_country
                        }
                      />
                      <DetailField
                        label="Postal Code"
                        value={
                          selectedPO.ship_to_postal_code ||
                          selectedPO.customer_postal_code
                        }
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
                    { Array.isArray(selectedPO.items) && selectedPO.items.length ? (
                      selectedPO.items.map((item, index) => (
                        <tr key={ index } className="hover:bg-gray-50">
                          <td className="px-5 py-4 whitespace-nowrap max-w-xs relative group">
                            <div className="text-sm text-gray-900 truncate">
                              { item.product_name || "N/A" }
                            </div>
                            <div className="text-sm text-gray-500">
                              { item.product_category || "N/A" }
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
                            { item.quantity ?? "N/A" }
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                            { formatCurrency(item.unit_price) }
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            { formatCurrency(
                              Number(item.unit_price || 0) * Number(item.quantity || 0)
                            ) }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-5 py-6 text-center text-sm text-gray-500">
                          No items found for this purchase order.
                        </td>
                      </tr>
                    ) }
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{ formatCurrency(selectedSubtotal) }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST (9%):</span>
                    <span className="font-medium">{ formatCurrency(selectedCgst) }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST (9%):</span>
                    <span className="font-medium">{ formatCurrency(selectedCgst) }</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-800 font-semibold">
                      Grand Total:
                    </span>
                    <span className="text-blue-600 font-bold">{ formatCurrency(selectedGrandTotal) }</span>
                  </div>
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

          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Purchase Orders
              </h2>
              { companyName ? (
                <p className="text-sm text-gray-500 md:mr-auto">{ companyName }</p>
              ) : null }
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
                    setCurrentPage(1); // Reset to first page when searching
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
                      Users
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
                    currentItems.map((po) => {
                      const primaryItem = getPrimaryItem(po);

                      return (
                        <tr key={ po.id } className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            { po.po_number }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { formatOrderDate(po.order_date) }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { po.customer_name }
                          </div>
                          <div className="text-sm text-gray-500">
                            { po.customer_company }
                          </div>
                          <div className="text-sm text-gray-500">
                            { po.customer_email }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { primaryItem?.vendor_name || "N/A" }
                          </div>
                          <div className="text-sm text-gray-500">
                            { primaryItem?.vendor_company || "N/A" }
                          </div>
                          <div className="text-sm text-gray-500">
                            { primaryItem?.vendor_email || "N/A" }
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            { primaryItem?.product_name || "N/A" }
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 relative group w-max max-w-[200px]">
                            <span className="truncate block">
                              { truncateWords(primaryItem?.description, 3) }
                            </span>
                            { primaryItem?.description && (
                              <div className="absolute z-10 hidden group-hover:block bg-white border border-gray-300 text-gray-900 text-xs p-2 rounded shadow-md w-64 top-full mt-1">
                                { primaryItem.description }
                              </div>
                            ) }
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { formatCurrency(primaryItem?.unit_price) }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            { primaryItem?.quantity ?? "N/A" }
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
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="10"
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

            {/* Pagination */ }
            { filteredPOs.length > ITEMS_PER_PAGE && (
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
                        { (currentPage - 1) * ITEMS_PER_PAGE + 1 }
                      </span>{ " " }
                      to{ " " }
                      <span className="font-medium">
                        { Math.min(
                          currentPage * ITEMS_PER_PAGE,
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
    </>
  );
};

export default POAutomationPage;
