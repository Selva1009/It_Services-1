"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/app/LandingPage/Footer";
import { resolveProductImageUrl } from "@/lib/api/config";
import { getProductById } from "@/lib/api/products";
import { addItemToCart } from "@/lib/api/carts";
import { notifyCartUpdated } from "@/lib/events";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState(null);

  // Fetch customer data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCustomer = localStorage.getItem("customerUser");
      const customerData = storedCustomer ? JSON.parse(storedCustomer) : null;
      if (customerData) {
        setCustomerId(customerData.id);
      }
    }
  }, []);

  // Fetch product details from API
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data.product);
      } catch (err) {
        setError("Error fetching product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!customerId) {
      toast.error("Please log in to add products to your cart.", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      await addItemToCart({
        customerId,
        productId: product.id,
        quantity: 1,
      });
      notifyCartUpdated();
      toast.success("Product added to cart!", { position: "bottom-right", autoClose: 1000 });
    } catch (err) {
      console.error("Error adding product to cart:", err);
      toast.error(err?.message || "Error adding product to cart.", { position: "top-right", autoClose: 2000 });
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return null;

  return (
    <>
      <Navbar disableFilters={true} disableSearch={true} />
      <ToastContainer />
      <div className=" w-full mx-auto p-6 pt-24 bg-gray-50 min-h-screen">
        <div className="flex mb-6 mt-6 flex-col md:flex-row items-start border border-gray-300 rounded-lg p-6 shadow-md min-h-[400px]">
          <div className="relative w-full md:w-1/2 flex flex-col items-center md:pr-6">
            <div className="relative w-80 h-80 flex items-center justify-center">
              <img
                src={ resolveProductImageUrl(product) }
                alt={ product.productName }
                className="w-80 h-80 object-cover rounded-lg shadow-md"
                loading="lazy"
                decoding="async"
                onError={ (e) => { e.currentTarget.src = "/placeholder-product.svg"; } }
              />
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 mt-4 rounded-lg w-full max-w-xs"
            >
              Add to Cart
            </button>
          </div>

          <div className="hidden md:block w-[2px] bg-gray-400 h-auto md:min-h-[300px] mx-6"></div>

          <div className="w-full md:w-1/2 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800">{product.productName}</h1>
            <p className="text-2xl font-semibold text-gray-800 mt-6">Price: Rs. { product.price }</p>
            <p className="text-lg font-normal text-gray-800 mt-6">Brand: {product.brand}</p>
            <p className="text-lg font-normal text-gray-800 mt-6">Category: {product.category}</p>
            <p className="text-gray-600 text-lg mt-4">{product.description}</p>
            <p className="text-lg font-normal text-gray-800 mt-6">Seller: {product.seller}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;
