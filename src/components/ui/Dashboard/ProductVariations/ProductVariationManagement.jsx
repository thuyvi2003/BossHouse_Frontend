// Vo Lam Thuy Vi
import React, { useState, useEffect } from "react";
import { variationService } from "@/services/productVariationService";
import { productService } from "@/services/productService";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  MoreHorizontal,
  X,
  Package,
  DollarSign,
  Hash,
  Layers
} from "lucide-react";

const ProductVariationManagement = () => {
  const [variations, setVariations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVariation, setEditingVariation] = useState(null);
  const [setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Form states
  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    price: "",
    stock: "",
    status: "active",
    image: ""
  });

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
       const data = await productService.getAll({ limit: 100 });
       console.log("Phản hồi API sản phẩm:", data); // Log để debug
       if (data.success) {
         // Backend trả về data.data là mảng products
         setProducts(Array.isArray(data.data) ? data.data : []);
       } else {
         console.warn("API lấy sản phẩm không thành công:", data.message);
         setProducts([]);
       }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      setProducts([]);
    }
  };

  // Fetch variations
  const fetchVariations = async () => {
    setLoading(true);
    try {
      if (productFilter !== "all") {
         const data = await variationService.getByProduct(productFilter);
         console.log("Phản hồi API biến thể:", data);
         if (data.success) {
           const variations = Array.isArray(data.data) ? data.data : [];
           setVariations(variations);
           setPagination((prev) => ({
             ...prev,
             total: variations.length || 0,
             totalPages: 1, 
           }));
         } else {
           console.warn("API lấy biến thể không thành công:", data.message);
           setVariations([]);
           setPagination((prev) => ({
             ...prev,
             total: 0,
             totalPages: 0,
           }));
         }
      } else {
        setVariations([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          totalPages: 0,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách biến thể:", error);
      setVariations([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
        totalPages: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Create variation
  const createVariation = async (e) => {
    e.preventDefault();
    if (!formData.product_id) {
      alert("Please select a product");
      return;
    }

    setLoading(true);
    try {
      const data = await variationService.create(formData.product_id, formData, formData.image);
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchVariations();
      } else {
        alert(data.message || "Error creating variation");
      }
    } catch (error) {
      console.error("Error creating variation:", error);
      alert("Error creating variation");
    } finally {
      setLoading(false);
    }
  };

  // Update variation
  const updateVariation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const imageFile = formData.image instanceof File ? formData.image : null;
      const data = await variationService.update(editingVariation._id, formData, imageFile);
      if (data.success) {
        setShowEditModal(false);
        setEditingVariation(null);
        resetForm();
        fetchVariations();
      } else {
        alert(data.message || "Error updating variation");
      }
    } catch (error) {
      console.error("Error updating variation:", error);
      alert("Error updating variation");
    } finally {
      setLoading(false);
    }
  };

  // Delete variation
  const deleteVariation = async (id, hardDelete = false) => {
    if (!confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'delete'} this variation?`)) {
      return;
    }

    setLoading(true);
    try {
      const data = await variationService.delete(id, hardDelete);
      if (data.success) {
        fetchVariations();
      } else {
        alert(data.message || "Error deleting variation");
      }
    } catch (error) {
      console.error("Error deleting variation:", error);
      alert("Error deleting variation");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      product_id: "",
      name: "",
      price: "",
      stock: "",
      status: "active",
      image: ""
    });
  };

  // Handle edit
  const handleEdit = (variation) => {
    setEditingVariation(variation);
    setFormData({
      product_id: variation.product_id._id || variation.product_id,
      name: variation.name,
      price: variation.price.toString(),
      stock: variation.stock.toString(),
      status: variation.status,
      image: variation.image || ""
    });
    setShowEditModal(true);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filters
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleProductFilter = (productId) => {
    setProductFilter(productId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  // const handlePageChange = (newPage) => {
  //   setPagination(prev => ({ ...prev, page: newPage }));
  // };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  // Effects
  useEffect(() => {
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   fetchVariations();
  // }, [productFilter, statusFilter]);

  // Filter variations by search term and status
  const filteredVariations = variations.filter(variation => {
    const matchesSearch = variation.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || variation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Layers size={20} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Product Variation Management
          </span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          disabled={productFilter === "all"}
        >
          + Create Variation
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Product Selection */}
          <div className="flex-1">
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={productFilter}
                onChange={(e) => handleProductFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
              >
                <option value="all">Select a product to view variations</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search variations by name..."
                value={searchTerm}
                onChange={handleSearch}
                disabled={productFilter === "all"}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              disabled={productFilter === "all"}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>
            {productFilter === "all" 
              ? "Please select a product to view variations"
              : `Showing ${filteredVariations.length} variations`
            }
          </span>
          {productFilter !== "all" && (searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-[#846551] hover:text-[#5a4639] font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-[#f5f3f2] to-[#eae7e5] border-b shadow-sm">
        <div className="col-span-3">Variation</div>
        <div className="col-span-2">Product</div>
        <div className="col-span-1">Price</div>
        <div className="col-span-1">Stock</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2">Created</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>

      {/* Info Message */}
      {productFilter === "all" && (
        <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
          <div className="flex items-center">
            <Layers className="w-5 h-5 text-[#846551] mr-2" />
            <p className="text-[#2c2c2c]">
              Please select a product to view and manage its variations.
            </p>
          </div>
        </div>
      )}

      {/* Table Body */}
      <div className="divide-y divide-transparent">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#846551]"></div>
            </div>
          </div>
        ) : filteredVariations.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            {productFilter === "all"
              ? "Please select a product to view variations"
              : "No variations found"}
          </div>
        ) : (
          filteredVariations.map((variation, idx) => (
            <div
              key={variation._id}
              className={`
            relative px-6 py-5 grid grid-cols-12 gap-4 items-center
            bg-white rounded-xl shadow-sm border border-gray-100
            hover:border-[#846551] hover:shadow-lg hover:scale-[1.01]
            transition-all duration-300 ease-in-out
            animate-fade-in-up
          `}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              {/* Decorative left bar */}
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gray-200 hover:bg-[#846551] transition-all"></div>

              <div className="col-span-3 flex items-center">
                {variation.image && (
                  <img
                    src={variation.image}
                    alt={variation.name}
                    className="w-12 h-12 rounded-lg object-cover mr-3"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-900">{variation.name}</div>
                  <div className="text-sm text-gray-500">ID: {variation._id}</div>
                </div>
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {variation.product_id?.name || variation.product_id || "Unknown Product"}
              </div>
              <div className="col-span-1 text-sm text-gray-800 font-semibold">
                ${variation.price ? variation.price.toLocaleString() : "0"}
              </div>
              <div className="col-span-1 text-sm text-gray-600">{variation.stock || 0}</div>
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${variation.status === "active"
                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                    : "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                    }`}
                >
                  {variation.status}
                </span>
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {variation.created_at ? new Date(variation.created_at).toLocaleDateString() : "N/A"}
              </div>
              <div className="col-span-2 flex items-center justify-center space-x-3">
                <button
                  onClick={() => handleEdit(variation)}
                  className="px-3 py-1 border border-[#846551] text-[#846551] rounded-lg hover:bg-[#f5f3f2] transition-all duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteVariation(variation._id)}
                  className="px-3 py-1 border border-[#b85c49] text-[#b85c49] rounded-lg hover:bg-[#fbe9e6] transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>


      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2c2c2c]">Create Product Variation</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={createVariation}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Red, Large, Premium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variation Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#846551] text-white rounded-lg hover:bg-[#5a4639] transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Variation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2c2c2c]">Edit Product Variation</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVariation(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={updateVariation}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <input
                    type="text"
                    value={editingVariation?.product_id?.name || "Unknown Product"}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Red, Large, Premium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variation Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editingVariation?.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Current image:</p>
                      <img
                        src={editingVariation.image}
                        alt="Current variation"
                        className="w-20 h-20 object-cover rounded-lg mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVariation(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#846551] text-white rounded-lg hover:bg-[#5a4639] transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Variation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariationManagement;
