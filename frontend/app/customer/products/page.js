"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";
import CategoryMenu from "../components/Categories";
import Footer from "@/app/LandingPage/Footer";
import { resolveProductImageUrl } from "@/lib/api/config";
import { getProducts } from "@/lib/api/products";

const PRODUCTS_PER_PAGE = 20;
const formatPrice = (price) => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return "N/A";
  return `Rs. ${numericPrice.toLocaleString("en-IN")}`;
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      const normalizedSearchQuery = searchQuery.trim();
      const effectiveCategoryFilter = normalizedSearchQuery ? "" : categoryFilter.trim();

      try {
        const data = await getProducts({
          page: currentPage,
          pageSize: PRODUCTS_PER_PAGE,
          search: normalizedSearchQuery,
          category: effectiveCategoryFilter,
          price: priceFilter,
        }, { signal: controller.signal });

        if (!data || !Array.isArray(data.products)) {
          throw new Error("Invalid API response format");
        }

        const nextTotalPages = data.pagination?.totalPages || 0;
        if (nextTotalPages > 0 && currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
          return;
        }

        setProducts(data.products);
        setTotalPages(nextTotalPages);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching products:", err);
        setError(err.message || "Error loading products.");
        setProducts([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchProducts();
    }

    return () => controller.abort();
  }, [isMounted, currentPage, searchQuery, categoryFilter, priceFilter]);

  const handleCategoryChange = (category) => {
    setCurrentPage(1);
    setCategoryFilter(category);
  };

  if (!isMounted) return null;

  const handleProductClick = (productId) => {
    if (!productId) return;
    router.push(`/customer/product/${productId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        setSearchQuery={ (value) => {
          setCurrentPage(1);
          setSearchQuery(value);
        } }
        setCategoryFilter={ (value) => {
          setCurrentPage(1);
          setCategoryFilter(value);
        } }
        setPriceFilter={ (value) => {
          setCurrentPage(1);
          setPriceFilter(value);
        } }
        disableFilters={ false }
        disableSearch={ false }
      />

      <div className="pt-[80px]">
        <CategoryMenu setCategoryFilter={ handleCategoryChange } />
      </div>

      <div className="w-full h-full mx-auto p-4 md:p-6 pt-12 lg:pt-12 flex-grow">
        { loading && <p className="text-center text-blue-500">Loading products...</p> }
        { error && <p className="text-center text-red-500">{ error }</p> }

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          { products.length > 0 ? (
            products.map((product) => (
              <div
                key={ product.id }
                className="bg-gray-50 rounded-xl shadow-lg overflow-hidden p-4 border border-gray-300 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={ () => handleProductClick(product.id) }
              >
                <div className="relative">
                  <img
                    src={ resolveProductImageUrl(product) }
                    alt={ product.productName || "Product image" }
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                    decoding="async"
                    onError={ (e) => { e.currentTarget.src = "/placeholder-product.svg"; } }
                  />
                </div>
                <div className="mt-4 text-left">
                  <h3 className="text-lg font-bold hover:text-blue-700 text-gray-800 mb-3 truncate w-full">{ product.productName || "Unnamed Product" }</h3>
                  <p className="text-md text-gray-600">{ product.brand || "-" }</p>
                  <p className="text-xl font-bold text-black mt-1">{ formatPrice(product.price) }</p>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="text-center col-span-full text-gray-500">No products found</p>
          ) }
        </div>

        { products.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 my-6 space-x-2">
            <Button
              onClick={ () => setCurrentPage((prev) => Math.max(prev - 1, 1)) }
              disabled={ currentPage === 1 }
              className="bg-blue-500 text-white hover:bg-blue-700"
            >
              Previous
            </Button>

            { Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const page = startPage + index;

              return (
                page <= totalPages && (
                  <Button
                    key={ page }
                    onClick={ () => setCurrentPage(page) }
                    className={ `${page === currentPage
                      ? "bg-blue-500 text-white hover:bg-blue-700"
                      : "bg-white text-black hover:bg-blue-700 hover:text-white border border-gray-300"
                      }` }
                  >
                    { page }
                  </Button>
                )
              );
            }) }

            <Button
              onClick={ () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)) }
              disabled={ currentPage === totalPages }
              className="bg-blue-500 text-white hover:bg-blue-700"
            >
              Next
            </Button>
          </div>
        ) }
      </div>

      <Footer />
    </div>
  );
};

export default ProductsPage;
