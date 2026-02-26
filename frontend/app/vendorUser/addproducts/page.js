"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { IoBagAdd } from "react-icons/io5";

export default function AddProduct() {
  const [vendorUserId, setVendorUserId] = useState(null);
  const [vendorUser, setVendorUser] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    productName: "",
    price: "",
    description: "",
    seller: "",
  });

  const [productImage, setProductImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadVendorContext = async () => {
      const storedVendorId =
        localStorage.getItem("vendorUserId") || sessionStorage.getItem("vendorUserId");
      const authToken = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (storedVendorId && isMounted) {
        setVendorUserId(Number(storedVendorId));
      }

      if (!authToken) {
        Swal.fire({
          title: "Vendor Not Logged In!",
          text: "Please log in again to continue adding products.",
          icon: "warning",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "/SignIn";
        });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/vendor-users/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load vendor profile");
        }

        const profile = await response.json();
        if (!isMounted) return;

        const resolvedId = profile?.id || Number(storedVendorId);
        if (resolvedId) {
          setVendorUserId(Number(resolvedId));
          localStorage.setItem("vendorUserId", String(resolvedId));
        }

        setVendorUser(profile);
      } catch (error) {
        if (!storedVendorId) {
          Swal.fire({
            title: "Session Expired!",
            text: "Please log in again.",
            icon: "warning",
            confirmButtonColor: "#d33",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.href = "/SignIn";
          });
        }
      }
    };

    void loadVendorContext();
    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    if (vendorUser?.companyName) {
      setFormData((prev) => ({
        ...prev,
        seller: vendorUser.companyName,
      }));
    }
  }, [vendorUser]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "seller") return; // seller should not be changed manually
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorUserId) {
      Swal.fire({
        title: "Error!",
        text: "Vendor user ID not available.",
        icon: "error",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("brand", formData.brand);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("seller", formData.seller);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("vendor_user_id", vendorUserId);
    if (productImage) {
      formDataToSend.append("productImage", productImage);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/add-product`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (response.status === 403) {
        const data = await response.json();
        Swal.fire({
          title: "Product Limit Reached!",
          text:
            data.message ||
            "You have reached the product limit. Please upgrade your subscription to add more products.",
          imageUrl: "/subscription.gif",
          imageWidth: 127,
          imageHeight: 151,
          imageAlt: "Update Success",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
        });
        return; // Stop further execution if limit is reached
      }

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      Swal.fire({
        title: "Success!",
        text: "Product added successfully!",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });

      // Reset form
      setFormData({
        category: "",
        brand: "",
        productName: "",
        price: "",
        description: "",
        seller: "",
      });
      setProductImage(null);
      setPreviewImage(null);
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-8 font-sans w-full md:w-4/5 lg:w-3/5">
        <h2 className="text-lg font-bold text-black mb-4 text-left flex items-center gap-2">
          <IoBagAdd size={ 25 } />
          Add New Product
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-black"
          onSubmit={ handleSubmit }
        >
          <div>
            <label className="block font-medium mb-2">Category</label>
            <select
              name="category"
              value={ formData.category }
              onChange={ handleInputChange }
              className="w-full p-2 border rounded-md font-sans"
              required
            >
              <option value="" className="bg-gray-200">
                Select Product Category
              </option>

              <optgroup label="Keyboards">
                <option value="Keyboards Wired">Keyboards Wired</option>
                <option value="Keyboards Wireless">Keyboards Wireless</option>
                <option value="Keyboards Ergonomic">Keyboards Ergonomic</option>
                <option value="Keyboards Gaming">Keyboards Gaming</option>
              </optgroup>

              <optgroup label="Mouse">
                <option value="Mouse">Mouse</option>
                <option value="Mouse Wired">Mouse Wired</option>
                <option value="Mouse Wireless">Mouse Wireless</option>
                <option value="Mouse Optical">Mouse Optical</option>
                <option value="Mouse Laser">Mouse Laser</option>
                <option value="Mouse Gaming">Mouse Gaming</option>
              </optgroup>

              <optgroup label="Other Input Devices">
                <option value="Trackballs">Trackballs</option>
                <option value="Graphic Tablets">Graphic Tablets</option>
                <option value="Graphic Styluses">Graphic Styluses</option>
                <option value="Touchpads">Touchpads</option>
              </optgroup>

              <optgroup label="Barcode Scanners">
                <option value="Barcode Scanners Wired">
                  Barcode Scanners Wired
                </option>
                <option value="Barcode Scanners Wireless">
                  Barcode Scanners Wireless
                </option>
                <option value="Barcode Scanners Handheld">
                  Barcode Scanners Handheld
                </option>
              </optgroup>

              <optgroup label="Printer Consumables">
                <option value="Ink Cartridges">Ink Cartridges</option>
                <option value="Toner Cartridges">Toner Cartridges</option>
                <option value="Toner Cartridges Monochrome Color">
                  Toner Cartridges Monochrome Color
                </option>
                <option value="Toner Cartridges Color">
                  Toner Cartridges Color
                </option>
                <option value="Printer Ribbons">Printer Ribbons</option>
                <option value="Printer Ribbons Impact Printers">
                  Printer Ribbons Impact Printers
                </option>
                <option value="Maintenance Kits">Maintenance Kits</option>
                <option value="Maintenance Kits Fuser Kits">
                  Maintenance Kits Fuser Kits
                </option>
                <option value="Maintenance Kits Roller Kits">
                  Maintenance Kits Roller Kits
                </option>
                <option value="Drum Units">Drum Units</option>
              </optgroup>

              <optgroup label="Paper Products">
                <option value="Printer Paper">Printer Paper</option>
                <option value="Label Paper">Label Paper</option>
                <option value="Fax Paper">Fax Paper</option>
                <option value="Photographic Paper">Photographic Paper</option>
              </optgroup>

              <optgroup label="Storage Devices">
                <option value="USB Flash Drives">USB Flash Drives</option>
                <option value="External Hard Drives">
                  External Hard Drives
                </option>
                <option value="External Hard Drives HDDs">
                  External Hard Drives HDDs
                </option>
                <option value="External Hard Drives SSDs">
                  External Hard Drives SSDs
                </option>
                <option value="Memory Card">Memory Card</option>
                <option value="Memory Cards SD">Memory Cards SD</option>
                <option value="Memory Cards MicroSD">
                  Memory Cards MicroSD
                </option>
                <option value="Memory Cards CompactFlash">
                  Memory Cards CompactFlash
                </option>
                <option value="Backup Tapes">Backup Tapes</option>
                <option value="Backup Tapes LTO">Backup Tapes LTO</option>
                <option value="Backup Tapes DAT">Backup Tapes DAT</option>
                <option value="Backup Tapes DLT">Backup Tapes DLT</option>
                <option value="Optical Media">Optical Media</option>
                <option value="Optical Media Blank Discs">
                  Optical Media Blank Discs
                </option>
                <option value="Optical Media RW Discs">
                  Optical Media RW Discs
                </option>
              </optgroup>

              <optgroup label="Batteries">
                <option value="Rechargeable Batteries">
                  Rechargeable Batteries
                </option>
                <option value="Laptop Batteries">Laptop Batteries</option>
                <option value="UPS Batteries">UPS Batteries</option>
                <option value="CMOS Batteries">CMOS Batteries</option>
              </optgroup>

              <optgroup label="Cables & Adapters">
                <option value="Ethernet Cables">Ethernet Cables</option>
                <option value="USB Cables">USB Cables</option>
                <option value="HDMI Cables">HDMI Cables</option>
                <option value="HDMI Cables Standard">
                  HDMI Cables Standard
                </option>
                <option value="HDMI Cables Mini">HDMI Cables Mini</option>
                <option value="HDMI Cables Micro">HDMI Cables Micro</option>
                <option value="DisplayPort Cables">DisplayPort Cables</option>
                <option value="VGA Cables">VGA Cables</option>
                <option value="Power Cables">Power Cables</option>
                <option value="Audio Cables">Audio Cables</option>
                <option value="Phone Cables">Phone Cables</option>
                <option value="Adapters">Adapters</option>
                <option value="Charging Cables">Charging Cables</option>
              </optgroup>

              <optgroup label="Peripherals">
                <option value="Monitor">Monitor</option>
                <option value="Monitors Standard">Monitors Standard</option>
                <option value="Monitors 4K">Monitors 4K</option>
                <option value="Monitors Curved">Monitors Curved</option>
                <option value="Printers">Printers</option>
                <option value="Printers Inkjet">Printers Inkjet</option>
                <option value="Printers Laser">Printers Laser</option>
                <option value="Printers Dot Matrix">Printers Dot Matrix</option>
                <option value="Scanners">Scanners</option>
                <option value="Scanners Flatbed">Scanners Flatbed</option>
                <option value="Scanners Document">Scanners Document</option>
                <option value="Scanners Barcode">Scanners Barcode</option>
                <option value="Label Printers">Label Printers</option>
                <option value="Projectors">Projectors</option>
                <option value="Projectors Portable">Projectors Portable</option>
                <option value="Projectors Office">Projectors Office</option>
                <option value="Projectors Home Theater">
                  Projectors Home Theater
                </option>
                <option value="Speakers">Speakers</option>
                <option value="Speakers Desktop">Speakers Desktop</option>
                <option value="Speakers Bluetooth">Speakers Bluetooth</option>
                <option value="Speakers USB">Speakers USB</option>
                <option value="Headsets">Headsets</option>
                <option value="Headsets Wired">Headsets Wired</option>
                <option value="Headsets Wireless">Headsets Wireless</option>
                <option value="Headsets Noise-Cancelling">
                  Headsets Noise-Cancelling
                </option>
                <option value="Webcams">Webcams</option>
                <option value="Webcams Standard">Webcams Standard</option>
                <option value="Webcams HD">Webcams HD</option>
                <option value="Webcams 4K">Webcams 4K</option>
                <option value="Microphones">Microphones</option>
                <option value="Microphones Desktop">Microphones Desktop</option>
                <option value="Microphones USB">Microphones USB</option>
                <option value="Microphones XLR">Microphones XLR</option>
              </optgroup>

              <optgroup label="Networking">
                <option value="Routers">Routers</option>
                <option value="Routers Wireless">Routers Wireless</option>
                <option value="Routers Enterprise">Routers Enterprise</option>
                <option value="Routers Home">Routers Home</option>
                <option value="Switches">Switches</option>
                <option value="Switches Unmanaged">Switches Unmanaged</option>
                <option value="Switches Managed">Switches Managed</option>
                <option value="Switches PoE">Switches PoE</option>
                <option value="Wi-Fi Extenders">Wi-Fi Extenders</option>
                <option value="Wireless Antennas">Wireless Antennas</option>
                <option value="Wireless Access Points">
                  Wireless Access Points
                </option>
                <option value="Wireless Access Points Wi-Fi 6">
                  Wireless Access Points Wi-Fi 6
                </option>
                <option value="Wireless Access Points Mesh System">
                  Wireless Access Points Mesh System
                </option>
                <option value="Wireless Controllers">
                  Wireless Controllers
                </option>
                <option value="Access Points Indoor">
                  Access Points Indoor
                </option>
                <option value="Access Points Outdoor">
                  Access Points Outdoor
                </option>
                <option value="Access Points Mesh">Access Points Mesh</option>
                <option value="Network Adapters">Network Adapters</option>
                <option value="Network Adapters Wi-Fi">
                  Network Adapters Wi-Fi
                </option>
                <option value="Network Adapters Bluetooth">
                  Network Adapters Bluetooth
                </option>
                <option value="Network Adapters Ethernet">
                  Network Adapters Ethernet
                </option>
                <option value="Network Cabling Ethernet">
                  Network Cabling Ethernet
                </option>
                <option value="Network Cabling Fiber Optic">
                  Network Cabling Fiber Optic
                </option>
                <option value="Network Cabling Coaxial">
                  Network Cabling Coaxial
                </option>
                <option value="Network Interface Cards NICs">
                  Network Interface Cards NICs
                </option>
                <option value="USB Hubs">USB Hubs</option>
                <option value="USB Hubs Standard">USB Hubs Standard</option>
                <option value="USB Hubs Powered">USB Hubs Powered</option>
                <option value="KVM Switches">KVM Switches</option>
                <option value="KVM Switches Keyboard">
                  KVM Switches Keyboard
                </option>
                <option value="KVM Switches Video">KVM Switches Video</option>
                <option value="KVM Switches Mouse">KVM Switches Mouse</option>
                <option value="Modems">Modems</option>
                <option value="Modems DSL">Modems DSL</option>
                <option value="Modems Cable">Modems Cable</option>
                <option value="Modems Fiber">Modems Fiber</option>
              </optgroup>

              <optgroup label="Accessories">
                <option value="Laptop Bags">Laptop Bags</option>
                <option value="Laptop Sleeves">Laptop Sleeves</option>
                <option value="Laptop Stand">Laptop Stand</option>
                <option value="Laptop Cooling Pads">Laptop Cooling Pads</option>
                <option value="Mouse Pads">Mouse Pads</option>
                <option value="Wrist Rest">Wrist Rest</option>
                <option value="Monitor Mounts">Monitor Mounts</option>
                <option value="Monitor Stands">Monitor Stands</option>
                <option value="Surge Protectors">Surge Protectors</option>
                <option value="Power Strips">Power Strips</option>
                <option value="Extension Cords">Extension Cords</option>
                <option value="Desk Organizers">Desk Organizers</option>
                <option value="Label Makers">Label Makers</option>
                <option value="Label Tapes">Label Tapes</option>
                <option value="Power Banks">Power Banks</option>
                <option value="Bluetooth Headsets">Bluetooth Headsets</option>
                <option value="Headphones">Headphones</option>
                <option value="Mobile Charging Cables">
                  Mobile Charging Cables
                </option>
              </optgroup>

              <optgroup label="Computers">
                <option value="Desktop">Desktop</option>
                <option value="Desktop Basic">Desktop Basic</option>
                <option value="Desktop High-Performance">
                  Desktop High-Performance
                </option>
                <option value="Desktop All-in-One">Desktop All-in-One</option>
                <option value="Laptop">Laptop</option>
                <option value="Laptop Business">Laptop Business</option>
                <option value="Laptop Gaming">Laptop Gaming</option>
                <option value="Laptop Ultrabooks">Laptop Ultrabooks</option>
                <option value="Workstations Engineering">
                  Workstations Engineering
                </option>
                <option value="Workstations Graphic Design">
                  Workstations Graphic Design
                </option>
                <option value="Workstations Video Editing">
                  Workstations Video Editing
                </option>
                <option value="Thin Clients">Thin Clients</option>
                <option value="Chromebooks">Chromebooks</option>
                <option value="Tablets">Tablets</option>
                <option value="Tablets iPads">Tablets iPads</option>
                <option value="Tablets Android">Tablets Android</option>
                <option value="Tablets Windows">Tablets Windows</option>
              </optgroup>

              <optgroup label="A/V Equipment">
                <option value="Cameras">Cameras</option>
                <option value="Cameras DSLR">Cameras DSLR</option>
                <option value="Cameras Mirrorless">Cameras Mirrorless</option>
                <option value="Cameras Action">Cameras Action</option>
                <option value="Cameras Security">Cameras Security</option>
                <option value="Camcorders">Camcorders</option>
                <option value="Video Conferencing Systems">
                  Video Conferencing Systems
                </option>
                <option value="AV Receivers">AV Receivers</option>
                <option value="Projector Screens">Projector Screens</option>
              </optgroup>

              <optgroup label="Operating Systems">
                <option value="Windows">Windows</option>
                <option value="Windows Home">Windows Home</option>
                <option value="Windows Pro">Windows Pro</option>
                <option value="Windows Enterprise">Windows Enterprise</option>
                <option value="macOS">macOS</option>
                <option value="Linux Distributions">Linux Distributions</option>
                <option value="Linux Distributions Ubuntu">
                  Linux Distributions Ubuntu
                </option>
                <option value="Linux Distributions CentOS">
                  Linux Distributions CentOS
                </option>
              </optgroup>

              <optgroup label="Software">
                <option value="Antivirus & Anti-malware">
                  Antivirus & Anti-malware
                </option>
                <option value="Firewalls">Firewalls</option>
                <option value="VPN Software">VPN Software</option>
                <option value="Encryption Tools">Encryption Tools</option>
                <option value="Endpoint Security">Endpoint Security</option>
                <option value="Graphic Design Software">
                  Graphic Design Software
                </option>
                <option value="Video Editing Software">
                  Video Editing Software
                </option>
                <option value="3D Modeling Software">
                  3D Modeling Software
                </option>
                <option value="Animation Software">Animation Software</option>
                <option value="CAD/CAM Software">CAD/CAM Software</option>
              </optgroup>

              <optgroup label="Security Software">
                <option value="Antivirus & Anti-malware Norton">
                  Antivirus & Anti-malware Norton
                </option>
                <option value="Antivirus & Anti-malware McAfee">
                  Antivirus & Anti-malware McAfee
                </option>
                <option value="Antivirus & Anti-malware Bitdefender">
                  Antivirus & Anti-malware Bitdefender
                </option>
                <option value="Firewalls ZoneAlarm">Firewalls ZoneAlarm</option>
                <option value="Firewalls Comodo">Firewalls Comodo</option>
                <option value="VPN Software NordVPN">
                  VPN Software NordVPN
                </option>
                <option value="VPN Software ExpressVPN">
                  VPN Software ExpressVPN
                </option>
                <option value="VPN Software OpenVPN">
                  VPN Software OpenVPN
                </option>
                <option value="Encryption Tools VeraCrypt">
                  Encryption Tools VeraCrypt
                </option>
                <option value="Encryption Tools BitLocker">
                  Encryption Tools BitLocker
                </option>
                <option value="Endpoint Security CrowdStrike">
                  Endpoint Security CrowdStrike
                </option>
                <option value="Endpoint Security Symantec">
                  Endpoint Security Symantec
                </option>
              </optgroup>

              <optgroup label="Productivity Software">
                <option value="Office Suites Microsoft Office">
                  Office Suites Microsoft Office
                </option>
                <option value="Office Suites Google Workspace">
                  Office Suites Google Workspace
                </option>
                <option value="Office Suites LibreOffice">
                  Office Suites LibreOffice
                </option>
                <option value="Project Management Tools Asana">
                  Project Management Tools Asana
                </option>
                <option value="Project Management Tools Trello">
                  Project Management Tools Trello
                </option>
                <option value="Project Management Tools Microsoft Project">
                  Project Management Tools Microsoft Project
                </option>
                <option value="Collaboration Tools Slack">
                  Collaboration Tools Slack
                </option>
                <option value="Collaboration Tools Microsoft Teams">
                  Collaboration Tools Microsoft Teams
                </option>
                <option value="Collaboration Tools Zoom">
                  Collaboration Tools Zoom
                </option>
                <option value="Email Clients Outlook">
                  Email Clients Outlook
                </option>
                <option value="Email Clients Thunderbird">
                  Email Clients Thunderbird
                </option>
              </optgroup>

              <optgroup label="Creative Software">
                <option value="Graphic Design Adobe Photoshop">
                  Graphic Design Adobe Photoshop
                </option>
                <option value="Graphic Design CorelDRAW">
                  Graphic Design CorelDRAW
                </option>
                <option value="Video Editing Adobe Premiere Pro">
                  Video Editing Adobe Premiere Pro
                </option>
                <option value="Video Editing Final Cut Pro">
                  Video Editing Final Cut Pro
                </option>
                <option value="Video Editing DaVinci Resolve">
                  Video Editing DaVinci Resolve
                </option>
                <option value="3D Modeling AutoCAD">3D Modeling AutoCAD</option>
                <option value="3D Modeling Blender">3D Modeling Blender</option>
                <option value="3D Modeling SketchUp">
                  3D Modeling SketchUp
                </option>
                <option value="Animation Maya">Animation Maya</option>
                <option value="Animation After Effects">
                  Animation After Effects
                </option>
                <option value="Animation Toon Boom">Animation Toon Boom</option>
                <option value="CAD/CAM Software SolidWorks">
                  CAD/CAM Software SolidWorks
                </option>
                <option value="CAD/CAM Software AutoCAD">
                  CAD/CAM Software AutoCAD
                </option>
                <option value="CAD/CAM Software Fusion 360">
                  CAD/CAM Software Fusion 360
                </option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Make & Model</label>
            <input
              type="text"
              name="brand"
              value={ formData.brand }
              onChange={ handleInputChange }
              className="w-full p-2 border rounded-md font-sans"
              required
              placeholder="Enter Make & Model"
            />
          </div>

          {/* Row 2 */ }
          <div>
            <label className="block font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="productName"
              value={ formData.productName }
              onChange={ handleInputChange }
              className="w-full p-2 border rounded-md font-sans"
              required
              placeholder="Enter Product Name"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={ formData.price }
              onChange={ handleInputChange }
              className="w-full p-2 border rounded-md font-sans"
              required
              placeholder="Enter Product Price"
            />
          </div>

          {/* Row 3 */ }
          <div>
            <label className="block font-medium mb-2">Seller</label>
            <input
              type="text"
              name="seller"
              value={ formData.seller }
              disabled
              className="w-full p-2 border rounded-md font-sans bg-gray-100 cursor-not-allowed"
              placeholder="Seller Name"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Image</label>
            <input
              type="file"
              onChange={ handleImageChange }
              className="w-full p-2 border rounded-md font-sans"
              required
            />
          </div>

          {/* Image Preview */ }
          { previewImage && (
            <div className="col-span-1 md:col-span-2 flex justify-center">
              <img
                src={ previewImage }
                alt="Product Preview"
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border"
              />
            </div>
          ) }

          {/* Row 4 (Full Width) */ }
          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={ formData.description }
              onChange={ handleInputChange }
              className="w-full p-2 border rounded-md h-24 font-sans"
              required
              placeholder="Enter Product Description"
            />
          </div>

          {/* Submit Button (Full Width) */ }
          <div className="col-span-1 md:col-span-2 flex justify-start">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-sans w-full sm:w-auto"
            >
              Add Product
            </button>
          </div>
        </form>

        <ToastContainer />
      </div>
    </>
  );
}

