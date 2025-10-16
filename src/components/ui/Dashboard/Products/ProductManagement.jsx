// Vo Lam Thuy Vi
import React, { useState, useEffect, useCallback } from "react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import Pagination from "@/components/Layout/Pagination";
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
    Hash
} from "lucide-react";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        status: "active",
        image: ""
    });

    // Fetch categories for dropdown
    const fetchCategories = async () => {
        try {
             const data = await categoryService.getAll({ limit: 100 });
             console.log("Phản hồi API danh mục:", data); // Log chi tiết
             if (data.success) {
                 // Backend trả về data.data là mảng categories
                 setCategories(Array.isArray(data.data) ? data.data : []);
             } else {
                 console.warn("API lấy danh mục không thành công:", data.message);
                 setCategories([]);
             }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách danh mục:", error);
            setCategories([]);
        }
    };

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(categoryFilter !== "all" && { categoryId: categoryFilter }),
            };
             const data = await productService.getAll(params);
             console.log("Phản hồi API sản phẩm:", data); // Log chi tiết
             if (data.success) {
                 // Backend trả về data.data là mảng products
                 setProducts(Array.isArray(data.data) ? data.data : []);
                 setPagination((prev) => ({
                     ...prev,
                     total: data.pagination?.totalItems || 0,
                     totalPages: data.pagination?.totalPages || 0,
                 }));
             } else {
                 setProducts([]);
             }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm, statusFilter, categoryFilter]);

    // Create product
    const createProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await productService.create(formData, formData.image);
            if (data.success) {
                setShowCreateModal(false);
                resetForm();
                fetchProducts();
            } else {
                alert(data.message || "Error creating product");
            }
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Error creating product");
        } finally {
            setLoading(false);
        }
    };

    // Update product
    const updateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Only send image if it's a new file (not a string URL)
            const imageFile = formData.image instanceof File ? formData.image : null;
            const data = await productService.update(editingProduct._id, formData, imageFile);
            if (data.success) {
                setShowEditModal(false);
                setEditingProduct(null);
                resetForm();
                fetchProducts();
            } else {
                alert(data.message || "Error updating product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Error updating product");
        } finally {
            setLoading(false);
        }
    };

    // Delete product
    const deleteProduct = async (id, hardDelete = false) => {
        if (!confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'delete'} this product?`)) {
            return;
        }

        setLoading(true);
        try {
            const data = await productService.delete(id, hardDelete);
            if (data.success) {
                fetchProducts();
            } else {
                alert(data.message || "Error deleting product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Error deleting product");
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            stock: "",
            categoryId: "",
            status: "active",
            image: ""
        });
    };

    // Handle edit
    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            stock: product.stock.toString(),
            categoryId: product.categoryId._id || product.categoryId,
            status: product.status,
            image: product.image || ""
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

    const handleCategoryFilter = (categoryId) => {
        setCategoryFilter(categoryId);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
        }
    };

    // Effects
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
                <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
                    <Package size={20} className="text-[#846551]" />
                    <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
                        Product Management
                    </span>
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
                >
                    + Create Product
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products by name or description..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleCategoryFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
                    <span>
                        Showing {products.length} of {pagination.total} products
                    </span>
                    {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setCategoryFilter("all");
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
                <div className="col-span-3">Product</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-1">Stock</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-transparent">
                {loading ? (
                    <div className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#846551]"></div>
                        </div>
                    </div>
                ) : !Array.isArray(products) || products.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No products found
                    </div>
                ) : (
                    products.map((product, idx) => (
                        <div
                            key={product._id}
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
                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-lg object-cover mr-3"
                                    />
                                )}
                                <div>
                                    <div className="font-semibold text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                        {product.description || "No description"}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 text-sm text-gray-600">
                                {product.categoryId?.name || product.categoryId || "Unknown"}
                            </div>
                            <div className="col-span-1 text-sm text-gray-800 font-semibold">
                                ${product.price ? product.price.toLocaleString() : "0"}
                            </div>
                            <div className="col-span-1 text-sm text-gray-600">{product.stock || 0}</div>
                            <div>
                                <span
                                    className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${product.status === "active"
                                        ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                                        : "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                                        }`}
                                >
                                    {product.status}
                                </span>
                            </div>
                            <div className="col-span-2 text-sm text-gray-600">
                                {product.created_at ? new Date(product.created_at).toLocaleDateString() : "N/A"}
                            </div>
                            <div className="col-span-2 flex items-center justify-center space-x-3">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="px-3 py-1 border border-[#846551] text-[#846551] rounded-lg hover:bg-[#f5f3f2] transition-all duration-300"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteProduct(product._id)}
                                    className="px-3 py-1 border border-[#b85c49] text-[#b85c49] rounded-lg hover:bg-[#fbe9e6] transition-all duration-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

      {/* Pagination */}
      {products.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#2c2c2c]">Create Product</h3>
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
                        <form onSubmit={createProduct}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Product name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Product description"
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
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
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
                                        Product Image
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
                                    {loading ? "Creating..." : "Create Product"}
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
                            <h3 className="text-lg font-semibold text-[#2c2c2c]">Edit Product</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingProduct(null);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={updateProduct}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Product name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Product description"
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
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
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
                                        Product Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {editingProduct?.image && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">Current image:</p>
                                            <img
                                                src={editingProduct.image}
                                                alt="Current product"
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
                                        setEditingProduct(null);
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
                                    {loading ? "Updating..." : "Update Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;