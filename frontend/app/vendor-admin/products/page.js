"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { Trash2, Loader2, Edit, ChevronRight, ChevronLeft, Package } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import Navbar from "../components/navbar";
import ExportMenu from "@/app/Components/auth/ExportMenu";
import { resolveProductImageUrl } from "@/lib/api/config";
import { getProducts, deleteProductById } from "@/lib/api/products";

export default function VendorAdminProducts() {
  const [vendorAdminId, setVendorAdminId] = useState(null);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  // Adjust items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1920) {
        setItemsPerPage(10);
      } else if (window.innerWidth >= 1440) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      setMessage("Vendor Admin ID not found in localStorage.");
      setLoading(false);
      return;
    }
    setVendorAdminId(id);
  }, []);

  useEffect(() => {
    if (!vendorAdminId) return;

    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts({
          page: currentPage,
          pageSize: itemsPerPage,
          search: searchTerm.trim(),
          vendorAdminId,
        }, { signal: controller.signal });

        const nextTotalPages = data.pagination?.totalPages || 0;
        const nextTotal = data.pagination?.total || 0;

        if (nextTotalPages > 0 && currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
          return;
        }

        setProducts(data.products || []);
        setTotalPages(nextTotalPages);
        setTotalCount(nextTotal);
        setMessage(nextTotal === 0 ? "No products found." : "");
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching products:", err);
        setMessage("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [vendorAdminId, currentPage, itemsPerPage, searchTerm, refreshKey]);

  const handleEdit = (product) => {
    if (!product.id) {
      console.error("No product ID found!");
      return;
    }
    router.push(`/vendor-admin/editproducts/${product.id}`);
  };

  const handleDelete = async (productId) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmed.isConfirmed) {
      try {
        await deleteProductById(productId);
        setRefreshKey((prev) => prev + 1);
        Swal.fire("Deleted!", "Product has been deleted.", "success");
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error!", "An error occurred while deleting the product.", "error");
      }
    }
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-screen-2xl mx-auto p-6 2xl:px-12">
        <ToastContainer position="top-right" autoClose={ 5000 } />

        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Package className="text-blue-600" size={ 28 } />
            </div>
            <span className="pt-1">Vendor Products</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-[400px] xl:w-[450px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 2xl:h-5 2xl:w-5" />
              <input
                type="text"
                placeholder="Search by name, category, brand"
                value={ searchTerm }
                onChange={ (e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                } }
                className="w-full pl-10 pr-4 py-2 2xl:py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm 2xl:text-base"
              />
            </div>
            <ExportMenu
              users={ products }
              dataType="products"
            />
          </div>
        </div>

        { message && <p className="mb-4 text-blue-600 2xl:text-lg">{ message }</p> }

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          { products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                <Package className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">
                No products found
              </h3>
              <p className="text-gray-500 mt-1">
                { searchTerm
                  ? "Try a different search term"
                  : "Add your first product" }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-4 2xl:py-5 text-left text-sm 2xl:text-base font-medium text-gray-700 tracking-wider">Image</th>
                      <th className="px-4 py-4 2xl:py-5 text-left text-sm 2xl:text-base font-medium text-gray-700 tracking-wider">Name</th>
                      <th className="px-4 py-4 2xl:py-5 text-left text-sm 2xl:text-base font-medium text-gray-700 tracking-wider">Brand</th>
                      <th className="px-4 py-4 2xl:py-5 text-left text-sm 2xl:text-base font-medium text-gray-700 tracking-wider">Category</th>
                      <th className="px-4 py-4 2xl:py-5 text-left text-sm 2xl:text-base font-medium text-gray-700 tracking-wider">Price</th>
                      <th className="px-4 py-4 2xl:py-5 text-left text-sm 2xl:text-base font-medium text-gray-700 tracking-wider">Seller</th>
                      <th className="px-4 py-4 2xl:py-5 text-left text-sm 2xl:text-base font-medium text-gray-700 tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    { products.map((product) => (
                      <tr key={ product.id } className="hover:bg-blue-50/50">
                        <td className="px-4 py-4 2xl:py-5">
                          <img
                            src={ resolveProductImageUrl(product) }
                            alt={ product.productName }
                            className="h-10 w-10 2xl:h-12 2xl:w-12 rounded object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={ (e) => { e.currentTarget.src = "/placeholder-product.svg"; } }
                          />
                        </td>
                        <td className="px-4 py-4 2xl:py-5 text-sm 2xl:text-base font-medium text-gray-900">{ product.productName }</td>
                        <td className="px-4 py-4 2xl:py-5 text-sm 2xl:text-base">{ product.brand }</td>
                        <td className="px-4 py-4 2xl:py-5 text-sm 2xl:text-base">{ product.category }</td>
                        <td className="px-4 py-4 2xl:py-5 text-sm 2xl:text-base">Rs. { product.price }</td>
                        <td className="px-4 py-4 2xl:py-5 text-sm 2xl:text-base">{ product.seller }</td>
                        <td className="px-4 py-4 2xl:py-5 text-sm 2xl:text-base">
                          <div className="flex gap-2">
                            <button
                              onClick={ () => handleEdit(product) }
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4 2xl:h-5 2xl:w-5" />
                            </button>
                            <button
                              onClick={ () => handleDelete(product.id) }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 2xl:h-5 2xl:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) }
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */ }
              <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-sm 2xl:text-base text-gray-700">
                  Showing <span className="font-medium">{ startItem }</span> to{ " " }
                  <span className="font-medium">{ endItem }</span> of{ " " }
                  <span className="font-medium">{ totalCount }</span> products
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ currentPage === 1 }
                    onClick={ () => setCurrentPage((prev) => prev - 1) }
                    className="px-3 py-1 2xl:px-4 2xl:py-2 rounded-lg border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1 text-sm 2xl:text-base"
                  >
                    <ChevronLeft className="h-4 w-4 2xl:h-5 2xl:w-5" />
                    <span>Previous</span>
                  </Button>

                  { Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                      <Button
                        key={ `page-${pageNum}` }
                        variant={ currentPage === pageNum ? "default" : "outline" }
                        size="sm"
                        onClick={ () => setCurrentPage(pageNum) }
                        className={ `px-3 py-1 2xl:px-4 2xl:py-2 rounded-lg min-w-[40px] ${currentPage === pageNum
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                          : "border-gray-300 hover:bg-gray-100"
                          } transition-colors text-sm 2xl:text-base` }
                      >
                        { pageNum }
                      </Button>
                    );
                  }) }

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ currentPage === totalPages || totalPages === 0 }
                    onClick={ () => setCurrentPage((prev) => prev + 1) }
                    className="px-3 py-1 2xl:px-4 2xl:py-2 rounded-lg border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1 text-sm 2xl:text-base"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4 2xl:h-5 2xl:w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) }
        </div>
      </div>
    </div>
  );
}
