"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ProductsPage from "../products/page";
import { ChevronLeft,  ChevronRight } from "lucide-react";

const categories = [
  {
    name: "IT Consumables",
    subcategories: [
      {
        name: "Printing Consumables",
        items: [
          "Ink Cartridges",
          "Toner Cartridges Monochrome Color",
          "Toner Cartridges Color",
          "Printer Ribbons Impact Printers",
          "Maintenance Kits Fuser Kits",
          "Maintenance Kits Roller Kits",
          "Drum Units",
          "Printer Paper",
          "Label Paper",
          "Label Marker",
          "Fax Paper",
          "Photographic Paper",
        ],
      },
      {
        name: "Storage Media",
        items: [
          "USB Flash Drives",
          "External Hard Drives HDDs",
          "External Hard Drives SSDs",
          "Memory Cards SD",
          "Memory Card",
          "Memory Cards MicroSD",
          "Memory Cards CompactFlash",
          "Backup Tapes LTO",
          "Backup Tapes DAT",
          "Backup Tapes DLT",
          "Optical Media Blank Discs",
          "Optical Media"
        ],
      },
      {
        name: "Batteries",
        items: [
          "Rechargeable Batteries ",
          "Laptop Batteries",
          "UPS Batteries",
          "CMOS Batteries",
        ],
      },
      {
        name: "Cables & Adapters",
        items: [
          "Ethernet Cables",
          "USB Cables",
          "HDMI Cables",
          "DisplayPort Cables",
          "VGA Cables",
          "Power Cables ",
          "Audio Cables ",
          "Phone Cables ",
          "Adapters ",
          "Charging Cables",
          "HDMI Cables Standard",
          "HDMI Cables Mini",
        ],
      },
    ],
  },
  {
    name: "IT Peripherals",
    subcategories: [
      {
        name: "Input Devices",
        items: [
          "Keyboards Wired",
          "Keyboards Wireless",
          "Keyboards Ergonomic",
          "Keyboards Gaming",
          "Mouse",
          "Mouse Gaming",
          "Mouse Wired",
          "Mouse Wireless",
          "Mouse Optical",
          "Mouse Laser",
          "Trackballs",
          "Graphic Tablets",
          "Graphic Styluses",
          "Touchpads",
          "Barcode Scanners Wired",
          "Barcode Scanners Wireless",
          "Barcode Scanners Handheld",
        ],
      },
      {
        name: "Output Devices",
        items: [

          "Monitors Standard",
          "Monitors 4K",
          "Monitor",
          "Monitors Curved",
          "Printers Inkjet",
          "Printers",
          "Printers Laser",
          "Printer Paper",
          "Printers Dot Matrix",
          "Scanners Flatbed",
          "Scanners Document",
          "Scanners Barcode",
          "Label Printers",
          "Projectors",
          "Projectors Portable",
          "Projectors Office",
          "Projectors Home Theater",
          "Speakers",
          "Speakers Desktop",
          "Speakers Bluetooth",
          "Speakers USB",
          "Headsets",
          "Headsets Wired",
          "Headsets Wireless",
          "Headsets Noise-Cancelling",
          "Webcams",
          "Webcams Standard",
          "Webcams HD",
          "Webcams 4K",
          "Microphones",
          "Microphones Desktop",
          "Microphones USB",
          "Microphones XLR",
        ]

      },
      {
        name: "Networking Peripherals",
        items: [
          "Routers",
          "Routers Wireless",
          "Routers Enterprise",
          "Routers Home",
          "Switches",
          "Switches Unmanaged",
          "Switches Managed",
          "Switches PoE",
          "Wi-Fi Extenders",
          "Wireless Antennas",
          "Wireless Access Points",
          "Wireless Access Points Wi-Fi 6",
          "Wireless Access Points Mesh System",
          "Wireless Controllers",
          "Access Points Indoor",
          "Access Points Outdoor",
          "Access Points Mesh",
          "Network Adapters",
          "Network Adapters Wi-Fi",
          "Network Adapters Bluetooth",
          "Network Adapters Ethernet",
          "USB Hubs Standard",
          "USB Hubs Powered",
          "KVM Switches Keyboard",
          "KVM Switches Video",
          "KVM Switches Mouse",
          "Modems",
          "Modems DSL",
          "Modems Cable",
          "Modems Fiber",
        ]

      },
    ],
  },
  {
    name: "IT Accessories",
    subcategories: [
      {
        name: "Computer Accessories",
        items: [
          "Laptop Bags",
          "Laptop Sleeves",
          "Laptop Stand",
          "Laptop Cooling Pads",
          "Mouse Pads",
          "Wrist Rest",
          "USB Hubs",
          "Monitor Mounts",
          "Monitor Stands",
        ],
      },
      {
        name: "Office Accessories",
        items: [
          "Surge Protectors",
          "Power Strips",
          "Extension Cords",
          "Desk Organizers",
          "Label Makers",
          "Label Tapes",
        ],
      },
      {
        name: "Mobile Accessories",
        items: ["Power Banks", "Bluetooth Headsets", "Headphones", "Mobile Charging Cables "],
      },
    ],
  },
  {
    name: "Hardware",
    subcategories: [
      {
        name: "Desktops & Laptops",
        items: [
          "Desktop",
          "Desktops Basic",
          "Desktops High-Performance",
          "Desktops All-in-One",
          "Laptop",
          "Laptop Business",
          "Laptop Gaming",
          "Laptop Ultrabooks",
          "Workstations Engineering",
          "Workstations Graphic Design",
          "Workstations Video Editing",
          "Thin Clients",
          "Chromebooks",
          "Tablets iPads",
          "Tablets Android",
          "Tablets Windows",
        ]

      },

      {
        name: "Servers & Storage",
        items: [
          "Servers ",
          "NAS (Network Attached Storage)",
          "SAN (Storage Area Network)",
          "DAS (Direct Attached Storage)",
          "SSDs (SATA, NVMe)",
          "HDDs (Enterprise, Consumer)",
        ],
      },
      {
        name: "Mobile Devices",
        items: [
          "Smartphones iOS",
          "Smartphones Android",
          "E-Readers Kindle",
          "E-Readers Kobo",
          "Wearables Smartwatches",
          "Wearables Fitness Trackers",
          "Tablets",
        ]

      },
      {
        name: "Audio & Video Equipment",
        items: [
          "Cameras DSLR",
          "Cameras Mirrorless",
          "Cameras Action",
          "Cameras Security",
          "Camcorders",
          "Video Conferencing Systems",
          "AV Receivers",
          "Projector Screens",
        ]

      },
    ],
  },
  {
    name: "Software",
    subcategories: [
      {
        name: "Operating Systems",
        items: [
          "Windows Home",
          "Windows Pro",
          "Windows Enterprise",
          "macOS",
          "Linux Distributions Ubuntu",
          "Linux Distributions CentOS",
          "Linux Distributions Red Hat",
          "Linux Distributions Fedora",
        ]

      },
      {
        name: "Productivity Software",
        items: [
          "Office Suites Microsoft Office",
          "Office Suites Google Workspace",
          "Office Suites LibreOffice",
          "Project Management Tools Asana",
          "Project Management Tools Trello",
          "Project Management Tools Microsoft Project",
          "Collaboration Tools Slack",
          "Collaboration Tools Microsoft Teams",
          "Collaboration Tools Zoom",
          "Email Clients Outlook",
          "Email Clients Thunderbird",
        ]

      },
      {
        name: "Security Software",
        items: [
          "Antivirus & Anti-malware Norton",
          "Antivirus & Anti-malware McAfee",
          "Antivirus & Anti-malware Bitdefender",
          "Firewalls ZoneAlarm",  
          "Firewalls Comodo",
          "VPN Software NordVPN",

          "VPN Software ExpressVPN",
          "VPN Software OpenVPN",
          "Encryption Tools VeraCrypt",
          "Encryption Tools BitLocker",
          "Endpoint Security CrowdStrike",
          "Endpoint Security Symantec",
        ]

      },
      {
        name: "Graphics & Design Software",
        items: [
          "Graphic Design Adobe Photoshop",
          // "Graphic Design Illustrator",
          "Graphic Design CorelDRAW",
          "Video Editing Adobe Premiere Pro",
          "Video Editing Final Cut Pro",
          "Video Editing DaVinci Resolve",
          "3D Modeling AutoCAD",
          "3D Modeling Blender",
          "3D Modeling SketchUp",
          "Animation Maya",
          "Animation After Effects",
          "Animation Toon Boom",
          "CAD/CAM Software SolidWorks",
          "CAD/CAM Software AutoCAD",
          "CAD/CAM Software Fusion 360",
        ]

      },
    ],
  },
  {
    name: "Networking",
    subcategories: [
      {
        name: "Network Infrastructure",
        items: [
          "Routers",
          "Routers Enterprise",
          "Routers Home",
          "Routers Wireless",
          "Switches",
          "Switches Core",
          "Switches Distribution",
          "Switches Access",
          "Switches PoE",
          "Network Cabling Ethernet",
          "Network Cabling Fiber Optic",
          "Network Cabling Coaxial",
          "Network Interface Cards NICs",
        ]

      },
      {
        name: "Wireless Networking",
        items: [
          "Wireless Access Points Wi-Fi 6",
          "Wireless Access Points Mesh Systems",
          "Wireless Controllers",
          "Wi-Fi Extenders",
          "Wireless Antennas",
        ]
      }, 
    ],
  },
];

const CategoryMenu = ({ setCategoryFilter }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState("left-0");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const categoryRefs = useRef({});
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnterCategory = (categoryName, index) => {
    if (isMobile) return;
    
    clearTimeout(timeoutId);
    setActiveCategory(categoryName);
    setActiveSubcategory(null);

    if (categoryRefs.current[index]) {
      const rect = categoryRefs.current[index].getBoundingClientRect();
      const windowWidth = window.innerWidth;

      if (rect.right + 260 > windowWidth) {
        setDropdownPosition("right-0");
      } else {
        setDropdownPosition("left-0");
      }
    }
    setDropdownVisible(true);
  };

  const handleMouseLeaveCategory = () => {
    if (isMobile) return;
    
    const newTimeoutId = setTimeout(() => {
      setDropdownVisible(false);
    }, 200);
    setTimeoutId(newTimeoutId);
  };

  const handleMouseEnterDropdown = () => {
    if (isMobile) return;
    clearTimeout(timeoutId);
  };

  const handleMouseLeaveDropdown = () => {
    if (isMobile) return;
    
    const newTimeoutId = setTimeout(() => {
      setDropdownVisible(false);
    }, 200);
    setTimeoutId(newTimeoutId);
  };

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMobileCategoryClick = (categoryName) => {
    if (!isMobile) return;
    
    if (activeCategory === categoryName) {
      setActiveCategory(null);
      setActiveSubcategory(null);
    } else {
      setActiveCategory(categoryName);
      setActiveSubcategory(null);
    }
  };

  const handleMobileSubcategoryClick = (subcategoryName) => {
    if (!isMobile) return;
    
    if (activeSubcategory === subcategoryName) {
      setActiveSubcategory(null);
    } else {
      setActiveSubcategory(subcategoryName);
    }
  };

  return (
    <div className="relative w-full bg-gray-50 shadow-md font-sans">
      {/* Desktop View */}
      <div className="hidden sm:block">
        <nav className="flex flex-wrap justify-between sm:space-x-8 px-6 py-4 text-gray-800 font-semibold">
          {categories.map((category, index) => (
            <div
              key={index}
              ref={(el) => (categoryRefs.current[index] = el)}
              className="relative group sm:mr-4 mb-4 sm:mb-0 w-full sm:w-auto"
              onMouseEnter={() => handleMouseEnterCategory(category.name, index)}
              onMouseLeave={handleMouseLeaveCategory}
            >
              <button className="w-full sm:w-auto text-left text-base">
                {category.name}
              </button>

              {dropdownVisible && activeCategory === category.name && (
                <div
                  className={`absolute top-full mt-4 w-44 bg-white border rounded-md shadow-lg z-10 ${dropdownPosition}`}
                  onMouseEnter={handleMouseEnterDropdown}
                  onMouseLeave={handleMouseLeaveDropdown}
                >
                  <ul className="py-2 text-sm">
                    {category.subcategories.map((sub, subIndex) => (
                      <li
                        key={subIndex}
                        className="relative"
                        onMouseEnter={() => setActiveSubcategory(sub.name)}
                      >
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                          {sub.name}
                        </button>

                        {activeSubcategory === sub.name && sub.items.length > 0 && (
                          <div
                            className={`absolute top-0 mt-0 w-44 bg-white border rounded-md shadow-lg z-10 ${
                              dropdownPosition === "right-0" ? "right-full mr-0" : "left-full ml-0"
                            } max-h-[300px] overflow-y-auto`}
                          >
                            <ul className="py-2 text-md text-left">
                              {sub.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="pl-2">
                                  <button
                                    onClick={() => setCategoryFilter(item)}
                                    className="block w-full text-left px-2 py-2 hover:bg-gray-100"
                                  >
                                    {item}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="relative px-4 py-3">
          {/* Scroll left button */}
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent flex items-center justify-center z-10"
            disabled={scrollPosition === 0}
          >
            <ChevronLeft className="text-gray-600" size={20} />
          </button>

          {/* Categories scroll container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto no-scrollbar px-2"
          >
            {categories.map((category, index) => (
              <div key={index} className="flex-shrink-0">
                <button
                  onClick={() => handleMobileCategoryClick(category.name)}
                  className={`px-4 py-2 rounded-lg ${
                    activeCategory === category.name
                      ? "bg-blue-100 text-blue-700"
                      : "bg-white text-gray-800"
                  } font-semibold shadow-sm`}
                >
                  {category.name}
                </button>
              </div>
            ))}
          </div>

          {/* Scroll right button */}
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent flex items-center justify-center z-10"
          >
            <ChevronRight className="text-gray-600" size={20} />
          </button>
        </div>

        {/* Mobile dropdown content */}
        {activeCategory && (
          <div className="px-4 pb-3">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <h3 className="font-semibold text-gray-800 mb-2">
                {activeCategory}
              </h3>
              <div className="space-y-2">
                {categories
                  .find((cat) => cat.name === activeCategory)
                  ?.subcategories.map((sub, subIndex) => (
                    <div key={subIndex}>
                      <button
                        onClick={() => handleMobileSubcategoryClick(sub.name)}
                        className={`w-full text-left px-3 py-2 rounded ${
                          activeSubcategory === sub.name
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {sub.name}
                      </button>

                      {activeSubcategory === sub.name && (
                        <div className="mt-1 ml-4">
                          {sub.items.map((item, itemIndex) => (
                            <button
                              key={itemIndex}
                              onClick={() => {
                                setCategoryFilter(item);
                                setActiveCategory(null);
                                setActiveSubcategory(null);
                              }}
                              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMenu;
