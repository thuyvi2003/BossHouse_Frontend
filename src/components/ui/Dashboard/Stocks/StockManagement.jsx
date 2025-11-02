// Stock Management Component
import React, { useState, useEffect, useCallback } from "react";
import { stockService } from "@/services/stockService";
import { productService } from "@/services/productService";
import Pagination from "@/components/Layout/Pagination";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

const StockManagement = () => {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Form states
  const [formData, setFormData] = useState({
    productId: "",
    variationId: "",
    type: "import",
    quantity: 0,
    supplier: "",
    unitCost: 0,
    notes: "",
    referenceNumber: "",
    entryDate: new Date().toISOString().split("T")[0],
  });

  // Fetch stocks
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(typeFilter !== "all" && { type: typeFilter }),
      };

      const data = await stockService.getAll(params);

      if (data.success) {
        setStocks(Array.isArray(data.data) ? data.data : []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.totalItems || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } else {
        setStocks([]);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter]);

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const data = await productService.getAll({ limit: 1000 });
      if (data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Create stock
  const createStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate that either productId or variationId is provided
      if (!formData.productId && !formData.variationId) {
        alert("Please select either a product or variation");
        setLoading(false);
        return;
      }

      const stockData = {
        ...(formData.productId && { productId: formData.productId }),
        ...(formData.variationId && { variationId: formData.variationId }),
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        supplier: formData.supplier,
        unitCost: parseFloat(formData.unitCost),
        notes: formData.notes,
        referenceNumber: formData.referenceNumber,
        entryDate: formData.entryDate,
      };

      const data = await stockService.create(stockData);
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchStocks();
        alert("Stock entry created successfully");
      } else {
        alert(data.message || "Error creating stock entry");
      }
    } catch (error) {
      console.error("Error creating stock:", error);
      alert(error.message || "Error creating stock entry");
    } finally {
      setLoading(false);
    }
  };

  // Update stock
  const updateStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stockData = {
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        supplier: formData.supplier,
        unitCost: parseFloat(formData.unitCost),
        notes: formData.notes,
        referenceNumber: formData.referenceNumber,
        entryDate: formData.entryDate,
      };

      const data = await stockService.update(editingStock._id, stockData);
      if (data.success) {
        setShowEditModal(false);
        setEditingStock(null);
        resetForm();
        fetchStocks();
        alert("Stock entry updated successfully");
      } else {
        alert(data.message || "Error updating stock entry");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert(error.message || "Error updating stock entry");
    } finally {
      setLoading(false);
    }
  };

  // Delete stock
  const deleteStock = async (id) => {
    if (!confirm("Are you sure you want to delete this stock entry?")) {
      return;
    }

    setLoading(true);
    try {
      const data = await stockService.delete(id);
      if (data.success) {
        fetchStocks();
        alert("Stock entry deleted successfully");
      } else {
        alert(data.message || "Error deleting stock entry");
      }
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert(error.message || "Error deleting stock entry");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      productId: "",
      variationId: "",
      type: "import",
      quantity: 0,
      supplier: "",
      unitCost: 0,
      notes: "",
      referenceNumber: "",
      entryDate: new Date().toISOString().split("T")[0],
    });
  };

  // Handle edit
  const handleEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      productId: stock.productId?._id || "",
      variationId: stock.variationId?._id || "",
      type: stock.type,
      quantity: stock.quantity,
      supplier: stock.supplier || "",
      unitCost: stock.unitCost || 0,
      notes: stock.notes || "",
      referenceNumber: stock.referenceNumber || "",
      entryDate: stock.entryDate
        ? new Date(stock.entryDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowEditModal(true);
  };

  // Handle view detail
  const handleViewDetail = async (stock) => {
    setSelectedStock(stock);
    setShowDetailModal(true);
  };

  // Handle type filter
  const handleTypeFilter = (type) => {
    setTypeFilter(type);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Effects
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "import":
        return <TrendingUp className="w-4 h-4" />;
      case "return":
        return <TrendingUp className="w-4 h-4" />;
      case "adjustment":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case "import":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700";
      case "return":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-700";
      case "adjustment":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700";
    }
  };

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Package size={20} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Stock Management
          </span>
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          + Add Stock Entry
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
            >
              <option value="all">All Types</option>
              <option value="import">Import</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {stocks.length} of {pagination.total} stock entries
          </span>
          {typeFilter !== "all" && (
            <button
              onClick={() => setTypeFilter("all")}
              className="text-[#846551] hover:text-[#5a4639] font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-[#f5f3f2] to-[#eae7e5] border-b shadow-sm">
        <div className="col-span-2">Product</div>
        <div className="col-span-1">Type</div>
        <div className="col-span-1">Quantity</div>
        <div className="col-span-2">Supplier</div>
        <div className="col-span-1">Cost</div>
        <div className="col-span-2">Entry Date</div>
        <div className="col-span-3 text-center">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-transparent">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#846551]"></div>
            </div>
          </div>
        ) : stocks.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No stock entries found
          </div>
        ) : (
          stocks.map((stock, idx) => (
            <div
              key={stock._id}
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

              <div className="col-span-2">
                <div className="font-semibold text-gray-900">
                  {stock.productId?.name || stock.variationId?.name || "N/A"}
                </div>
              </div>
              <div className="col-span-1">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm flex items-center gap-1 ${getTypeColor(
                    stock.type
                  )}`}
                >
                  {getTypeIcon(stock.type)}
                  {stock.type}
                </span>
              </div>
              <div className="col-span-1 text-sm text-gray-600">
                {stock.quantity}
              </div>
              <div className="col-span-2 text-sm text-gray-600 truncate">
                {stock.supplier || "N/A"}
              </div>
              <div className="col-span-1 text-sm text-gray-600">
                ${stock.totalCost?.toFixed(2) || "0.00"}
              </div>
              <div className="col-span-2 text-sm text-gray-600">
                {new Date(stock.entryDate).toLocaleDateString()}
              </div>
              <div className="col-span-3 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handleViewDetail(stock)}
                  className="px-3 py-1 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(stock)}
                  className="px-3 py-1 border border-[#846551] text-[#846551] rounded-lg hover:bg-[#f5f3f2] transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteStock(stock._id)}
                  className="px-3 py-1 border border-[#b85c49] text-[#b85c49] rounded-lg hover:bg-[#fbe9e6] transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="p-6">
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2c2c2c]">
                Add Stock Entry
              </h3>
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
            <form onSubmit={createStock}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productId: e.target.value,
                          variationId: "",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                      disabled={formData.variationId !== ""}
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    >
                      <option value="import">Import</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="return">Return</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) =>
                        setFormData({ ...formData, unitCost: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                      placeholder="Enter unit cost"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                      placeholder="Invoice/Reference number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.entryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, entryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    rows="3"
                    placeholder="Additional notes"
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
                  {loading ? "Creating..." : "Add Stock Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2c2c2c]">
                Edit Stock Entry
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStock(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={updateStock}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product (Read-only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={
                        editingStock?.productId?.name ||
                        editingStock?.variationId?.name ||
                        "N/A"
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    >
                      <option value="import">Import</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="return">Return</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) =>
                        setFormData({ ...formData, unitCost: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.entryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, entryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStock(null);
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
                  {loading ? "Updating..." : "Update Stock Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#2c2c2c]">
                Stock Entry Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStock(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <p className="text-gray-900">
                    {selectedStock.productId?.name ||
                      selectedStock.variationId?.name ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 text-xs rounded-full font-semibold ${getTypeColor(
                      selectedStock.type
                    )}`}
                  >
                    {selectedStock.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <p className="text-gray-900">{selectedStock.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Stock
                  </label>
                  <p className="text-gray-900">{selectedStock.previousStock}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Stock
                  </label>
                  <p className="text-gray-900">{selectedStock.newStock}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost
                  </label>
                  <p className="text-gray-900">
                    ${selectedStock.unitCost?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cost
                  </label>
                  <p className="text-gray-900 font-semibold">
                    ${selectedStock.totalCost?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <p className="text-gray-900">
                    {selectedStock.supplier || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number
                  </label>
                  <p className="text-gray-900">
                    {selectedStock.referenceNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Date
                </label>
                <p className="text-gray-900">
                  {new Date(selectedStock.entryDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-gray-900">
                  {selectedStock.notes || "No notes"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created By
                </label>
                <p className="text-gray-900">
                  {selectedStock.createdBy?.name ||
                    selectedStock.createdBy?.email ||
                    "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-gray-900">
                  {new Date(selectedStock.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStock(null);
                }}
                className="px-4 py-2 bg-[#846551] text-white rounded-lg hover:bg-[#5a4639] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;

