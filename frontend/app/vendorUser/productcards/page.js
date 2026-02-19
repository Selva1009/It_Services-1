"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { resolveProductImageUrl } from "@/lib/api/config";
import { getProducts } from "@/lib/api/products";

export default function EcommercePage() {
  const [vendorUserId, setVendorUserId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const idFromStorage = localStorage.getItem("vendorUserId");
    if (idFromStorage) {
      setVendorUserId(idFromStorage);
    } else {
      setError("Vendor user ID not found in localStorage.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!vendorUserId) return;

    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({
          page: currentPage,
          pageSize: itemsPerPage,
          search: search.trim(),
          vendorUserId,
        }, { signal: controller.signal });

        const nextTotalPages = data.pagination?.totalPages || 0;

        if (nextTotalPages > 0 && currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
          return;
        }

        setProducts(data.products || []);
        setTotalPages(nextTotalPages);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [vendorUserId, currentPage, search]);

  return (
    <div className="min-h-screen border border-gray-200">
      {/* Navbar */ }
      <nav className="bg-white shadow-md py-4 px-6 flex flex-col md:flex-row justify-between items-center border-b border-gray-300">
        <h1 className="text-2xl font-semibold text-gray-900">Product Spot</h1>
        <div className="flex gap-4 items-center mt-2 md:mt-0">
          <div className="relative w-full md:w-[300px]">
            <input
              type="text"
              placeholder="Search products"
              value={ search }
              onChange={ (e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              } }
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-600" />
          </div>
        </div>
      </nav>

      {/* Main Content */ }
      <div className="p-6 bg-gray-50">
        { error && <div className="text-red-500">{ error }</div> }

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          { products.length > 0
            ? products.map((product) => (
              <div
                key={ product.id }
                className="bg-gray-50 rounded-xl shadow-md overflow-hidden p-4 border border-gray-300 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="relative">
                  { product.productImage && (
                    <img
                      src={ resolveProductImageUrl(product) }
                      alt={ product.productName }
                      className="w-full h-40 object-cover rounded-lg"
                      loading="lazy"
                      decoding="async"
                      onError={ (e) => { e.currentTarget.src = "/placeholder-product.svg"; } }
                    />
                  ) }
                </div>
                <div className="mt-4 text-left">
                  <h3 className="text-lg text-gray-700 hover:text-blue-700 font-bold truncate">
                    { product.productName }
                  </h3>
                  <p className="text-md text-gray-600">{ product.brand }</p>
                  <p className="text-xl font-bold text-black mt-2">Rs. { product.price }</p>
                </div>
              </div>
            ))
            : !loading && (
              <p className="text-gray-600 text-center col-span-full">
                No products available.
              </p>
            ) }
        </div>

        {/* Pagination */ }
        { totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center mt-6 space-x-2">
            <Button
              onClick={ () => setCurrentPage((prev) => Math.max(prev - 1, 1)) }
              disabled={ currentPage === 1 }
              className="bg-blue-500 text-white hover:bg-blue-700 px-4 py-2"
            >
              Previous
            </Button>

            { (() => {
              const rangeSize = 5;
              const halfRange = Math.floor(rangeSize / 2);
              let startPage = Math.max(1, currentPage - halfRange);
              let endPage = Math.min(totalPages, startPage + rangeSize - 1);

              if (endPage - startPage + 1 < rangeSize) {
                startPage = Math.max(1, endPage - rangeSize + 1);
              }

              return Array.from(
                { length: endPage - startPage + 1 },
                (_, index) => startPage + index
              ).map((page) => (
                <Button
                  key={ page }
                  onClick={ () => setCurrentPage(page) }
                  className={ `px-4 py-2 ${page === currentPage
                    ? "bg-blue-500 text-white hover:bg-blue-700"
                    : "bg-white text-black hover:bg-blue-700 hover:text-white border border-gray-300"
                    }` }
                >
                  { page }
                </Button>
              ));
            })() }

            <Button
              onClick={ () =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={ currentPage === totalPages }
              className="bg-blue-500 text-white hover:bg-blue-700 px-4 py-2"
            >
              Next
            </Button>
          </div>
        ) }
      </div>
    </div>
  );
}
