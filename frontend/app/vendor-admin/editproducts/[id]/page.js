"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { IoCreateOutline } from "react-icons/io5";

export default function EditVendorAdminProduct() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;

  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    productName: "",
    price: "",
    description: "",
    seller: "",
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (id) {
      setFormData((prev) => ({ ...prev }));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      Swal.fire({
        title: "Unavailable",
        text: "Product updates are disabled because the API endpoint is not available in this backend.",
        icon: "warning",
        showConfirmButton: true,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-8 font-sans">
      <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
        <IoCreateOutline size={25} /> Update Product
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 text-sm text-black">
        <div>
          <label className="block font-medium mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Make & Model</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
            <label className="block font-medium mb-2">Seller</label>
            <input
              type="text"
              name="seller"
              value={formData.seller}
              disabled
              className="w-full p-2 border rounded-md font-sans bg-gray-100 cursor-not-allowed"
              placeholder="Seller Name"
            />
          </div>

        <div>
          <label className="block font-medium mb-2">Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {previewImage && (
          <div className="col-span-2 flex justify-center">
            <img
              src={previewImage}
              alt="Product Preview"
              className="w-40 h-40 object-cover rounded-lg border"
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="block font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md h-24"
            required
          />
        </div>

        <div className="col-span-2 flex justify-start gap-4">
          <button
            type="button"
            onClick={() => router.push(`/vendor-admin/products?page=${encodeURIComponent(currentPage)}`)}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
