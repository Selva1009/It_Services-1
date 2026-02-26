"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ProductsPage from "../products/page";
import { ChevronLeft,  ChevronRight } from "lucide-react";

const categories = [
  {
    name: "Hardware Support",
    subcategories: [
      {
        name: "L1 - Basic Troubleshooting",
        items: [
          "Device not powering ON",
          "Battery charging issues",
          "System slow performance",
          "External monitor not detected",
          "Speaker or microphone not working",
          "Keyboard or mouse not working",
          "USB device not detected",
          "Printer offline",
          "Scanner not detected"
        ]
      },
      {
        name: "L2 - Core Failures",
        items: [
          "Motherboard failure",
          "POST failure",
          "BIOS corruption",
          "System board replacement",
          "SSD/HDD failure",
          "RAM failure",
          "CPU hardware failure",
          "Power supply failure",
          "LCD panel replacement",
          "Fan failure",
          "USB port failure",
          "Printer hardware failure"
        ]
      },
      {
        name: "L3 - Manufacturer Support",
        items: [
          "Hardware design defects",
          "Recurring component failures",
          "Firmware-level hardware faults",
          "OEM engineering diagnostics",
          "Product recall cases"
        ]
      }
    ]
  },

  {
    name: "Operating System Support",
    subcategories: [
      {
        name: "L1 - Basic",
        items: [
          "Login failure",
          "Account lockout",
          "Slow OS response",
          "Startup application issues",
          "Display settings issues",
          "Pending update troubleshooting",
          "Driver reinstall assistance"
        ]
      },
      {
        name: "L2 - Advanced",
        items: [
          "OS corruption",
          "Blue screen errors",
          "Kernel crashes",
          "OS reinstallation",
          "System image restoration",
          "Bootloader repair"
        ]
      },
      {
        name: "L3 - Vendor Support",
        items: [
          "OS kernel defects",
          "Persistent crashes",
          "OS vulnerabilities",
          "Vendor bug fixes",
          "Patch engineering escalation"
        ]
      }
    ]
  },

  {
    name: "Networking Support",
    subcategories: [
      {
        name: "L1 - User Level",
        items: [
          "WiFi connectivity issues",
          "LAN connectivity issues",
          "IP renewal",
          "Slow internet",
          "VPN assistance",
          "Proxy configuration checks"
        ]
      },
      {
        name: "L2 - Technical",
        items: [
          "Switch port failure",
          "Router malfunction",
          "Firewall issues",
          "VLAN configuration",
          "DHCP failure",
          "DNS issues",
          "Packet loss investigation"
        ]
      },
      {
        name: "L3 - Vendor Support",
        items: [
          "Network firmware defects",
          "Routing protocol defects",
          "Vendor TAC escalation",
          "Advanced packet analysis"
        ]
      }
    ]
  },

  {
    name: "Audio & Video Conferencing Support",
    subcategories: [
      {
        name: "L1 - Basic",
        items: [
          "No audio in meetings",
          "Microphone not detected",
          "Camera not working",
          "Screen sharing issues",
          "Headset configuration"
        ]
      },
      {
        name: "L2 - Technical",
        items: [
          "Conference hardware failure",
          "Camera replacement",
          "Speaker failure",
          "Codec configuration issues"
        ]
      },
      {
        name: "L3 - Vendor Support",
        items: [
          "Firmware defects",
          "Codec compatibility issues",
          "Integration defects"
        ]
      }
    ]
  },

  {
    name: "Antivirus & Malware Support",
    subcategories: [
      {
        name: "L1 - Basic",
        items: [
          "Antivirus not updating",
          "Scan not running",
          "Endpoint agent disconnected",
          "Basic malware scan"
        ]
      },
      {
        name: "L2 - Advanced",
        items: [
          "Malware removal",
          "Ransomware containment",
          "Endpoint isolation",
          "Threat remediation"
        ]
      },
      {
        name: "L3 - Vendor Support",
        items: [
          "Zero-day investigation",
          "Security engine failures",
          "Signature defects"
        ]
      }
    ]
  },

  {
    name: "Identity & Access Support",
    subcategories: [
      {
        name: "L1 - Basic",
        items: [
          "Domain login issues",
          "Password reset",
          "MFA failures",
          "Account lockouts"
        ]
      },
      {
        name: "L2 - Advanced",
        items: [
          "Domain trust issues",
          "Certificate failures",
          "Policy sync failures"
        ]
      },
      {
        name: "L3 - Specialist",
        items: [
          "Directory corruption",
          "Authentication failures",
          "Federation issues"
        ]
      }
    ]
  },

  {
    name: "Backup & Data Protection",
    subcategories: [
      {
        name: "L1 - Basic",
        items: [
          "Backup alerts",
          "Backup agent not running",
          "Restore request"
        ]
      },
      {
        name: "L2 - Advanced",
        items: [
          "Backup corruption",
          "Restore failure",
          "Storage failure"
        ]
      },
      {
        name: "L3 - Vendor Support",
        items: [
          "Backup engine defects",
          "Data recovery engineering"
        ]
      }
    ]
  },

  {
    name: "Collaboration Tools Support",
    subcategories: [
      {
        name: "L1 - Basic",
        items: [
          "Email sync issues",
          "Calendar sync issues",
          "Meeting plugin issues",
          "Notification issues"
        ]
      },
      {
        name: "L2 - Advanced",
        items: [
          "Persistent sync failures",
          "Client integration issues",
          "Policy configuration failures"
        ]
      },
      {
        name: "L3 - Vendor Support",
        items: [
          "Service-side defects",
          "API failures",
          "Vendor outages"
        ]
      }
    ]
  }
  ,

  {
  name: "Patch & Update Management",
  subcategories: [
    {
      name: "L1 - Basic",
      items: [
        "Update installation assistance",
        "Restart scheduling issues",
        "Update pending notifications"
      ]
    },
    {
      name: "L2 - Advanced",
      items: [
        "Patch instability issues",
        "Update rollback",
        "Firmware compatibility conflicts"
      ]
    },
    {
      name: "L3 - Vendor Support",
      items: [
        "OS patch engineering escalation",
        "Vendor patch defects"
      ]
    }
  ]
},

{
  name: "Asset Lifecycle Support",
  subcategories: [
    {
      name: "L1 - Basic",
      items: [
        "Asset allocation assistance",
        "Device handover support",
        "Asset tagging verification",
        "Asset record update request"
      ]
    },
    {
      name: "L2 - Advanced",
      items: [
        "Asset repair coordination",
        "Warranty lifecycle tracking",
        "Device replacement planning"
      ]
    },
    {
      name: "L3 - Vendor Support",
      items: [
        "OEM asset replacement escalation",
        "Vendor lifecycle disputes"
      ]
    }
  ]
},

{
  name: "Environmental & Infrastructure Support",
  subcategories: [
    {
      name: "L1 - Basic",
      items: [
        "Overheating complaints",
        "Power fluctuation issues",
        "Workspace setup concerns"
      ]
    },
    {
      name: "L2 - Advanced",
      items: [
        "Electrical grounding issues",
        "Rack cooling failure",
        "UPS load imbalance"
      ]
    },
    {
      name: "L3 - Engineering Support",
      items: [
        "Infrastructure design issues",
        "Capacity architecture failures",
        "Environmental engineering defects"
      ]
    }
  ]
},

{
  name: "Software–Hardware Compatibility Support",
  subcategories: [
    {
      name: "L1 - Basic",
      items: [
        "Driver compatibility issues",
        "Software not detecting hardware",
        "Peripheral compatibility issues"
      ]
    },
    {
      name: "L2 - Advanced",
      items: [
        "Driver conflicts causing crashes",
        "Hardware capacity mismatch",
        "Upgrade recommendations"
      ]
    },
    {
      name: "L3 - Engineering Escalation",
      items: [
        "Driver engineering defects",
        "Firmware conflicts",
        "Vendor compatibility updates"
      ]
    }
  ]
}

];






const CategoryMenu = ({ setCategoryFilter }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const [dropdownCoords, setDropdownCoords] = useState({
    top: 0,
    left: 0,
  });

  const [submenuCoords, setSubmenuCoords] = useState({
    top: 0,
    left: 0,
  });

  const categoryRefs = useRef({});
  const scrollContainerRef = useRef(null);

  /* -------------------- SCREEN SIZE -------------------- */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -------------------- DESKTOP EVENTS -------------------- */
  const handleMouseEnterCategory = (name, index) => {
    if (isMobile) return;

    clearTimeout(timeoutId);

    setActiveCategory(name);
    setActiveSubcategory(null);

    const rect =
      categoryRefs.current[index]?.getBoundingClientRect();

    if (rect) {
      setDropdownCoords({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }

    setDropdownVisible(true);
  };

  const handleMouseLeaveCategory = () => {
    if (isMobile) return;

    const id = setTimeout(() => {
      setDropdownVisible(false);
      setActiveSubcategory(null);
    }, 200);

    setTimeoutId(id);
  };

  const handleMouseEnterDropdown = () =>
    clearTimeout(timeoutId);

  const handleMouseLeaveDropdown = () => {
    const id = setTimeout(() => {
      setDropdownVisible(false);
      setActiveSubcategory(null);
    }, 200);

    setTimeoutId(id);
  };

  /* -------------------- MOBILE EVENTS -------------------- */
  const handleMobileCategoryClick = (name) => {
    setActiveCategory(activeCategory === name ? null : name);
    setActiveSubcategory(null);
  };

  const handleMobileSubcategoryClick = (name) => {
    setActiveSubcategory(
      activeSubcategory === name ? null : name
    );
  };

  /* -------------------- MOBILE SCROLL -------------------- */
  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full bg-white shadow-sm font-sans border-b">
      {/* ===================== DESKTOP ===================== */}
      <div className="hidden sm:block relative">
        <div className="overflow-x-auto whitespace-nowrap py-3 px-6 no-scrollbar">
          <div className="flex space-x-8 font-semibold text-gray-800">
            {categories.map((category, index) => (
              <div
                key={index}
                ref={(el) =>
                  (categoryRefs.current[index] = el)
                }
                className="relative inline-block"
                onMouseEnter={() =>
                  handleMouseEnterCategory(
                    category.name,
                    index
                  )
                }
                onMouseLeave={handleMouseLeaveCategory}
              >
                <button
                  className="text-sm hover:text-blue-600 transition"
                  onClick={() =>
                    setCategoryFilter(category.name)
                  }
                >
                  {category.name}
                </button>

                {dropdownVisible &&
                  activeCategory === category.name && (
                    <div
                      className="fixed bg-white border rounded-lg shadow-xl z-[999999] min-w-[260px] max-h-[400px] overflow-y-auto"
                      style={{
                        top: dropdownCoords.top,
                        left: dropdownCoords.left,
                      }}
                      onMouseEnter={
                        handleMouseEnterDropdown
                      }
                      onMouseLeave={
                        handleMouseLeaveDropdown
                      }
                    >
                      <ul className="py-2 text-sm">
                        {category.subcategories.map(
                          (sub, subIndex) => (
                            <li
                              key={subIndex}
                              className="relative"
                            >
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition"
                                onMouseEnter={(e) => {
                                  setActiveSubcategory(
                                    sub.name
                                  );

                                  const rect =
                                    e.currentTarget.getBoundingClientRect();

                                  setSubmenuCoords({
                                    top: rect.top,
                                    left: rect.right + 4,
                                  });
                                }}
                              >
                                {sub.name}
                              </button>

                              {activeSubcategory ===
                                sub.name && (
                                <div
                                  className="fixed bg-white border rounded-lg shadow-xl z-[999999] min-w-[280px] max-h-[400px] overflow-y-auto"
                                  style={{
                                    top: submenuCoords.top,
                                    left:
                                      submenuCoords.left,
                                  }}
                                >
                                  <ul className="py-2 text-sm">
                                    {sub.items.map(
                                      (
                                        item,
                                        itemIndex
                                      ) => (
                                        <li
                                          key={
                                            itemIndex
                                          }
                                        >
                                          <button
                                            onClick={() =>
                                              setCategoryFilter(
                                                item
                                              )
                                            }
                                            className="block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition"
                                          >
                                            {item}
                                          </button>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== MOBILE ===================== */}
      <div className="sm:hidden">
        <div className="relative px-4 py-3">
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center bg-gradient-to-r from-white to-transparent z-10"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex space-x-3 overflow-x-auto scrollbar-hide px-4"
          >
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() =>
                  handleMobileCategoryClick(
                    category.name
                  )
                }
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap shadow-sm ${
                  activeCategory === category.name
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-gradient-to-l from-white to-transparent"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;

