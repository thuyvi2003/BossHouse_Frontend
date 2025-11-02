// ScheduleManager.jsx
import React, { useEffect, useState } from "react";
import scheduleService from "../../../../services/scheduleService";
import optionService from "../../../../services/optionService";
import ScheduleForm from "./ScheduleForm";
import ScheduleTable from "./ScheduleTable";
import { toast } from "react-toastify";
import { Plus, Search, Filter, Package, Clock } from "lucide-react";

export default function ScheduleManager() {
    const [schedules, setSchedules] = useState([]);
    const [formMode, setFormMode] = useState(null); // "add" | "edit" | "view"
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ vet: "", status: "ALL" });
    const [options, setOptions] = useState({ vets: [] });
    const [loading, setLoading] = useState(false);

    // Load all schedules
    const getAllSchedules = async () => {
        setLoading(true);
        try {
            const data = await scheduleService.getAll();
            setSchedules(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load schedules!");
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    // Load vets
    const loadOptions = async () => {
        try {
            const data = await optionService.getAllOptions();
            setOptions({ vets: data.vets || [] });
        } catch (err) {
            console.error(err);
            toast.error("Failed to load options!");
        }
    };

    useEffect(() => {
        getAllSchedules();
        loadOptions();
    }, []);

    // Create
    const handleAdd = () => {
        setCurrentSchedule(null);
        setFormMode("add");
    };

    // View
    const handleView = (schedule) => {
        setCurrentSchedule(schedule);
        setFormMode("view");
    };

    // Edit from table
    const handleEditClick = (schedule) => {
        setCurrentSchedule(schedule);
        setFormMode("edit");
    };

    // Edit from view
    const handleEditFromView = () => {
        setFormMode("edit");
    };

    // Form success callback
    const handleFormSuccess = async (savedSchedule) => {
        // Nếu mode add, thêm vào list
        if (formMode === "add") {
            setSchedules(prev => [...prev, savedSchedule]);
            toast.success("Schedule created successfully!");
        } else if (formMode === "edit") {
            // Nếu mode edit, update schedule trong list
            setSchedules(prev =>
                prev.map(s => (s._id === savedSchedule._id ? savedSchedule : s))
            );
            toast.success("Schedule updated successfully!");
        }
        setFormMode(null);
        setCurrentSchedule(null);
    };

    // Cancel / close form
    const handleCancel = () => {
        setFormMode(null);
        setCurrentSchedule(null);
    };

    // Delete schedule
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this schedule?")) return;
        try {
            await scheduleService.remove(id);
            toast.success("Schedule deleted successfully!");
            getAllSchedules();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete schedule!");
        }
    };

    // Filtered & searched schedules
    const filteredSchedules = schedules
        .filter(s =>
            search
                ? s.veterinarian_id?.user_id?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
                : true
        )
        .filter(s => (filters.vet ? s.veterinarian_id?._id === filters.vet : true))
        .filter(s =>
            filters.status === "ALL"
                ? true
                : s.is_available === (filters.status === "AVAILABLE")
        );

    return (
        <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in relative">
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
                <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
                    <Clock size={20} className="text-[#846551]" />
                    <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
                        Schedule Management
                    </span>
                </h2>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
                >
                    + Create Schedule
                </button>
            </div>

            {/* Search & Filters */}
            <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5] flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by veterinarian..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                    />
                </div>

                <div className="flex gap-3 flex-wrap">
                    <div className="relative">
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filters.vet}
                            onChange={(e) => setFilters({ ...filters, vet: e.target.value })}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
                        >
                            <option value="">All Veterinarians</option>
                            {options.vets.map(v => (
                                <option key={v._id} value={v._id}>
                                    {v.user_id?.name} ({v.specialty || "Unknown"})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
                        >
                            <option value="ALL">All Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="UNAVAILABLE">Unavailable</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#846551] mx-auto"></div>
                </div>
            ) : (
                <ScheduleTable
                    data={filteredSchedules}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            )}

            {/* Popup Form */}
            {formMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <ScheduleForm
                            initialData={currentSchedule}
                            onSuccess={handleFormSuccess}
                            onCancel={handleCancel}
                            mode={formMode}
                            options={options}
                            onEditMode={handleEditFromView}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
