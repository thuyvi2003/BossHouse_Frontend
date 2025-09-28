import React, { useEffect, useState } from "react";
import bookingService from "../../../../services/bookingService";
import optionService from "../../../../services/optionService";
import BookingForm from "./BookingForm";
import { Plus, Search, Filter, Package } from "lucide-react";
import BookingTable from "./BookingTable";

export default function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [formMode, setFormMode] = useState(null); // "add" | "edit" | "view"
  const [currentBooking, setCurrentBooking] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    pet: "",
    service: "",
    status: "ALL",
  });
  const [options, setOptions] = useState({
    users: [],
    pets: [],
    services: [],
    vets: [],
  });
  const [loading, setLoading] = useState(false);

  /** Load bookings */
  const getAllBookings = async () => {
    setLoading(true);
    try {
      let data = await bookingService.getAll();

      // Search
      if (search) {
        const searchLower = search.toLowerCase();
        data = data.filter(
          (b) =>
            b.user_id?.name?.toLowerCase().includes(searchLower) ||
            b.note?.toLowerCase().includes(searchLower)
        );
      }

      // Filters
      if (filters.pet) {
        data = data.filter((b) => b.pet_id?.species === filters.pet);
      }
      if (filters.service) {
        data = data.filter((b) =>
          b.services?.some(
            (s) => (s.service_id?._id || s.service_id) === filters.service
          )
        );
      }
      if (filters.status !== "ALL") {
        data = data.filter(
          (b) => b.status.toUpperCase() === filters.status.toUpperCase()
        );
      }

      setBookings(data);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /** Load options for selects */
  const loadOptions = async () => {
    try {
      const data = await optionService.getAllOptions();
      setOptions(data);
    } catch (err) {
      console.error("Error loading options:", err);
    }
  };

  useEffect(() => {
    getAllBookings();
    loadOptions();
  }, []);

  useEffect(() => {
    getAllBookings();
  }, [search, filters]);

  /** Handlers */
  const handleDelete = async (id) => {
    try {
      await bookingService.remove(id);
      alert("Booking deleted successfully!");
      getAllBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const handleView = (b) => {
    setCurrentBooking(b);
    setFormMode("view");
  };

  const handleAdd = () => {
    setCurrentBooking(null);
    setFormMode("add");
  };

  const handleEditClick = (b) => {
    setCurrentBooking(b);
    setFormMode("edit");
  };

  const handleFormSuccess = async () => {
    await getAllBookings();
    alert(
      formMode === "add"
        ? "Booking created successfully!"
        : "Booking updated successfully!"
    );
    setFormMode(null);
    setCurrentBooking(null);
  };

  const handleCancel = () => {
    setFormMode(null);
    setCurrentBooking(null);
  };

  /** Kiểm tra có phải booking future không */
  const isFutureBooking = (booking) => {
    if (!booking?.date) return false;
    const bookingDate = new Date(booking.date);
    const now = new Date();
    return bookingDate > now;
  };

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      {!formMode ? (
        <>
          {/* Header */}
          <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
              <Package size={20} className="text-[#846551]" />
              <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
                Booking Management
              </span>
            </h2>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
            >
              + Create Booking
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5] flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer or note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              {/* Pet Filter */}
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filters.pet}
                  onChange={(e) =>
                    setFilters({ ...filters, pet: e.target.value })
                  }
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
                >
                  <option value="">All Pets</option>
                  {[...new Set(options.pets.map((p) => p.species))].map(
                    (species) => (
                      <option key={species} value={species}>
                        {species}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Service Filter */}
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filters.service}
                  onChange={(e) =>
                    setFilters({ ...filters, service: e.target.value })
                  }
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
                >
                  <option value="">All Services</option>
                  {[
                    ...new Map(
                      options.services.map((s) => [s.name, s])
                    ).values(),
                  ].map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELED">Canceled</option>
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
            <BookingTable
              bookings={bookings}
              onEdit={handleEditClick}
              onDeleteBooking={handleDelete}
              onView={handleView}
            />
          )}
        </>
      ) : (
        <BookingForm
          initialData={currentBooking}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
          onEditClick={handleEditClick}
          mode={formMode}
          options={options}
          disableCustomerPet={
            formMode === "edit" && isFutureBooking(currentBooking)
          }
        />
      )}
    </div>
  );
}
