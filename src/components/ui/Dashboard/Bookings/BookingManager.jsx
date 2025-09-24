import React, { useEffect, useState } from "react";
import bookingService from "../../../../services/bookingService";
import optionService from "../../../../services/optionService";
import BookingTable from "./BookingTable";
import BookingForm from "./BookingForm";

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

  // Load bookings
  const getAllBookings = async () => {
    try {
      let data = await bookingService.getAll();

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        data = data.filter(
          (b) =>
            b.user_id?.name?.toLowerCase().includes(searchLower) ||
            b.note?.toLowerCase().includes(searchLower)
        );
      }

      // Pet filter
      if (filters.pet) {
        data = data.filter((b) => b.pet_id?._id === filters.pet);
      }

      // Service filter (check trong mảng services)
      if (filters.service) {
        data = data.filter((b) =>
          b.services?.some((s) => {
            const sid = s.service_id?._id || s.service_id;
            return sid === filters.service;
          })
        );
      }

      // Status filter
      if (filters.status !== "ALL") {
        data = data.filter(
          (b) => b.status.toUpperCase() === filters.status.toUpperCase()
        );
      }

      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings", err);
    }
  };

  // Load dropdown options
  const loadOptions = async () => {
    try {
      const data = await optionService.getAllOptions();
      setOptions(data);
    } catch (err) {
      console.error("Failed to load options", err);
    }
  };

  useEffect(() => {
    getAllBookings();
    loadOptions();
  }, []);

  useEffect(() => {
    getAllBookings();
  }, [search, filters]);

  // CRUD handlers
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;
    await bookingService.remove(id);
    getAllBookings();
  };

  const handleView = (booking) => {
    setCurrentBooking(booking);
    setFormMode("view");
  };

  const handleAdd = () => {
    setCurrentBooking(null);
    setFormMode("add");
  };

  const handleEditClick = (booking) => {
    setCurrentBooking(booking);
    setFormMode("edit");
  };

  const handleFormSuccess = async () => {
    await getAllBookings();
    setFormMode(null);
    setCurrentBooking(null);
  };

  const handleCancel = () => {
    setFormMode(null);
    setCurrentBooking(null);
  };

  return (
    <div className="space-y-4">
      {!formMode ? (
        <>
          {/* Search */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Search by customer or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded flex-1"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-2 flex-wrap">
            {/* Pet filter */}
            <select
              value={filters.pet}
              onChange={(e) => setFilters({ ...filters, pet: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">All Pets</option>
              {options.pets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name || p.species || "Unknown Pet"}
                </option>
              ))}
            </select>

            {/* Service filter */}
            <select
              value={filters.service}
              onChange={(e) =>
                setFilters({ ...filters, service: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">All Services</option>
              {options.services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          {/* Add button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
            >
              Add Booking
            </button>
          </div>

          {/* Table */}
          <BookingTable
            bookings={bookings}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onView={handleView}
          />
        </>
      ) : (
        <BookingForm
          initialData={currentBooking}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
          onEditClick={handleEditClick}
          mode={formMode}
          options={options}
        />
      )}
    </div>
  );
}
