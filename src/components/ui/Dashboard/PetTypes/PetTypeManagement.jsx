import { useEffect, useState, useMemo } from "react";
import petTypeService from "@/services/petTypeService";
import { Plus, Search } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "@/components/Layout/Pagination";

const ROWS_PER_PAGE = 10;

// --- Modal wrapper ---
function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
                    onClick={onClose}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}

// --- Form modal ---
function PetTypeForm({ initialData, onCancel, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true,
    });

    useEffect(() => {
        if (initialData)
            setFormData({
                name: initialData.name,
                description: initialData.description || "",
                is_active: initialData.is_active ?? true,
            });
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return;
        }
        try {
            if (initialData) {
                await petTypeService.update(initialData._id, formData);
                toast.success("Pet type updated!");
            } else {
                await petTypeService.create(formData);
                toast.success("Pet type added!");
            }
            onSuccess && onSuccess();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save pet type");
        }
    };

    return (
        <Modal onClose={onCancel}>
            <h3 className="text-xl font-bold mb-4 text-center">
                {initialData ? "Edit Pet Type" : "Add Pet Type"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        id="is_active"
                    />
                    <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
                </div>
                {/* Nút căn giữa */}
                <div className="flex justify-center gap-4 mt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        {initialData ? "Save" : "Add"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// --- Delete confirmation modal ---
function DeleteConfirmModal({ onCancel, onConfirm }) {
    return (
        <Modal onClose={onCancel}>
            <h3 className="text-lg font-bold mb-4 text-red-600 text-center">Confirm Delete</h3>
            <p className="mb-6 text-center">Are you sure you want to delete this pet type?</p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 border rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
}

// --- Table ---
function PetTypeTable({ types, onEdit, onDelete }) {
  if (!types.length)
    return <p className="text-center italic text-gray-500 py-4">No pet types found.</p>;

  return (
    <div className="overflow-hidden rounded-lg shadow-lg text-sm w-full">
      <div className="grid grid-cols-[1fr_2fr_100px_100px] bg-gray-100 px-2 py-2 font-semibold border-b">
        <div>Name</div>
        <div>Description</div>
        <div>Status</div>
        <div className="text-center">Actions</div>
      </div>
      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
        {types.map((type) => (
          <div
            key={type._id}
            className="grid grid-cols-[1fr_2fr_100px_100px] px-2 py-2 items-center hover:bg-gray-50"
          >
            <div>{type.name}</div>
            <div>{type.description || "-"}</div>
            <div>
              {type.is_active ? (
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold text-center">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold text-center">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex justify-center gap-2 text-xs">
              <button onClick={() => onEdit(type)} className="text-blue-600 hover:text-blue-800">Edit</button>
              <button onClick={() => onDelete(type)} className="text-red-600 hover:text-red-800">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main component ---
export default function PetTypeManagement() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [formMode, setFormMode] = useState(null); // "add" | "edit"
    const [currentType, setCurrentType] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteType, setDeleteType] = useState(null); // Type to delete

    const loadTypes = async () => {
        setLoading(true);
        try {
            const res = await petTypeService.getAll();
            setTypes(res);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load pet types!");
            setTypes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTypes();
    }, []);

    const filteredTypes = types.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredTypes.length / ROWS_PER_PAGE));
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const currentTypes = useMemo(
        () => filteredTypes.slice(startIndex, startIndex + ROWS_PER_PAGE),
        [filteredTypes, startIndex]
    );

    const handleDeleteConfirm = async () => {
        if (!deleteType) return;
        try {
            await petTypeService.remove(deleteType._id);
            toast.success("Pet type deleted!");
            setTypes(types.filter((t) => t._id !== deleteType._id));
            setDeleteType(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete pet type!");
        }
    };

    const handleFormSuccess = () => {
        setFormMode(null);
        setCurrentType(null);
        loadTypes();
    };

    return (
        <div className="bg-white shadow-xl overflow-hidden flex-1 p-6 animate-fade-in">
            {!formMode && (
                <>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Plus size={20} /> Pet Type Management
                        </h2>
                        <button
                            onClick={() => setFormMode("add")}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            + Add Pet Type
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by pet type..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <p className="text-center py-4">Loading...</p>
                    ) : (
                        <>
                            <PetTypeTable
                                types={currentTypes}
                                onEdit={(t) => {
                                    setCurrentType(t);
                                    setFormMode("edit");
                                }}
                                onDelete={(t) => setDeleteType(t)}
                            />
                            {/* Pagination */}
                            <div className="mt-3 flex justify-center">
                                <Pagination
                                    page={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(p) => setCurrentPage(p)}
                                />
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Add/Edit Form */}
            {formMode && (
                <PetTypeForm
                    initialData={currentType}
                    onCancel={() => {
                        setFormMode(null);
                        setCurrentType(null);
                    }}
                    onSuccess={handleFormSuccess}
                />
            )}

            {/* Delete confirmation */}
            {deleteType && (
                <DeleteConfirmModal
                    onCancel={() => setDeleteType(null)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
}
