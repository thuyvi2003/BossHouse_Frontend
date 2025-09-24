// Vo Lam Thuy Vi
import React, { useState, useEffect } from "react";
import { categoryAPI } from "@/services/api";
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
  Package
} from "lucide-react";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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
    status: "active",
  });

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };
  
      const data = await categoryAPI.getAll(params);

      if (data.success) {
        // Backend trả về data.data là mảng categories trực tiếp
        setCategories(Array.isArray(data.data) ? data.data : []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.totalItems || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        // Nếu API trả về không thành công, gán mảng rỗng
        setCategories([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      // Gán mảng rỗng trong trường hợp lỗi
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await categoryAPI.create(formData);
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchCategories();
      } else {
        alert(data.message || "Error creating category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await categoryAPI.update(editingCategory._id, formData);
      if (data.success) {
        setShowEditModal(false);
        setEditingCategory(null);
        resetForm();
        fetchCategories();
      } else {
        alert(data.message || "Error updating category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Error updating category");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id, hardDelete = false) => {
    if (!confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'delete'} this category?`)) {
      return;
    }

    setLoading(true);
    try {
      const data = await categoryAPI.delete(id, hardDelete);
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.message || "Error deleting category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
    });
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      status: category.status,
    });
    setShowEditModal(true);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Effects
  useEffect(() => {
    fetchCategories();
  }, [pagination.page, pagination.limit, searchTerm, statusFilter]);

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Package size={20} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Category Management
          </span>
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          + Create Category
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
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
              />
            </div>
          </div>

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
        </div>

        {/* Results Summary */}
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {categories.length} of {pagination.total} categories
          </span>
          {(searchTerm || statusFilter !== "all") && (
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
        <div className="col-span-3">Category</div>
        <div className="col-span-4">Description</div>
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
        ) : categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No categories found
          </div>
        ) : (
          categories.map((category, idx) => (
            <div
              key={category._id}
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

              <div className="col-span-3">
                <div className="font-semibold text-gray-900">{category.name}</div>
              </div>
              <div className="col-span-4 text-sm text-gray-600 max-w-xs truncate">
                {category.description || "No description"}
              </div>
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${
                    category.status === "active"
                      ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                      : "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                  }`}
                >
                  {category.status}
                </span>
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {new Date(category.created_at).toLocaleDateString()}
              </div>
              <div className="col-span-2 flex items-center justify-center space-x-3">
                <button
                  onClick={() => handleEdit(category)}
                  className="px-3 py-1 border border-[#846551] text-[#846551] rounded-lg hover:bg-[#f5f3f2] transition-all duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category._id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2c2c2c]">Create Category</h3>
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
            <form onSubmit={createCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                  {loading ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2c2c2c]">Edit Category</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={updateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
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
                  {loading ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
