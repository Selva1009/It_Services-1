"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { IoCreateOutline } from "react-icons/io5";

export default function UpdateProduct() {
  const { id } = useParams(); // ✅ fixed
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;

  const [vendorId, setVendorId] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    category: "",
    price: "",
    seller: "",
    description: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  // ✅ Load vendorId from localStorage
  useEffect(() => {
    const storedVendorId = localStorage.getItem("userId");
    if (storedVendorId) {
      setVendorId(storedVendorId);
    }
  }, []);

  // ✅ Fetch product using correct `id`
  useEffect(() => {
    if (!id) return;

    setFormData((prev) => ({ ...prev }));
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      Swal.fire({
        title: "Unavailable",
        text: "Product updates are disabled because the API endpoint is not available in this backend.",
        icon: "warning",
        showConfirmButton: true,
      });
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-8 font-sans">
      <h2 className="text-lg font-bold text-black mb-4 text-left flex items-center gap-2">
        <IoCreateOutline size={ 25 } /> Update Product
      </h2>

      <form
        className="grid grid-cols-2 gap-6 text-sm text-black"
        onSubmit={ handleSubmit }
      >
        <div>
          <label className="block font-medium mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={ formData.category }
            onChange={ handleInputChange }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Make & Model</label>
          <input
            type="text"
            name="brand"
            value={ formData.brand }
            onChange={ handleInputChange }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Product Name</label>
          <input
            type="text"
            name="productName"
            value={ formData.productName }
            onChange={ handleInputChange }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={ formData.price }
            onChange={ handleInputChange }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

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
            className="w-full p-2 border rounded-md"
          />
        </div>

        { previewImage && (
          <div className="col-span-2 flex justify-center">
            <img
              src={ previewImage }
              alt="Product Preview"
              className="w-40 h-40 object-cover rounded-lg border"
            />
          </div>
        ) }

        <div className="col-span-2">
          <label className="block font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={ formData.description }
            onChange={ handleInputChange }
            className="w-full p-2 border rounded-md h-24"
            required
          />
        </div>

        <div className="col-span-2 flex justify-start">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-sm hover:bg-blue-600 transition"
            disabled={ updating }
          >
            { updating ? "Updating..." : "Update Product" }
          </button>
        </div>
      </form>
    </div>
  );
}

