// BookingManager.jsx
import React, { useEffect, useState } from "react";
import bookingService from "../../../../services/bookingService";
import optionService from "../../../../services/optionService";
import BookingForm from "./BookingForm";
import BookingTable from "./BookingTable";
import { Plus, Search, Filter, Package } from "lucide-react";
import { toast } from "react-toastify";

export default function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [formMode, setFormMode] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ pet: "", service: "", status: "ALL", vet: "" });

  const [options, setOptions] = useState({ users: [], pets: [], services: [], vets: [], species: [] });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // --- Load options from backend/seed ---
  const loadOptions = async () => {
    try {
      const data = await optionService.getAllOptions();
      const pets = Array.isArray(data.pets) ? data.pets : [];
      const speciesList = Array.isArray(data.species) ? data.species : [];

      // --- Pets mapping ---
      const petsWithSpecies = pets.map((pet) => {
        const speciesObj = typeof pet.species === "object"
          ? pet.species
          : speciesList.find((s) => s._id === pet.species) || { _id: "unknown", name: "Unknown" };
        return { ...pet, species: speciesObj };
      });

      // --- Map vets with user names ---
      const vetsWithName = (Array.isArray(data.vets) ? data.vets : []).map((v) => {
        const user = Array.isArray(data.users)
          ? data.users.find((u) => u._id === v.user_id)
          : null;
        return {
          ...v,
          name: user?.name || v.name || "Unknown", // fallback nếu v.name có sẵn
        };
      });

      setOptions({
        users: Array.isArray(data.users) ? data.users : [],
        pets: petsWithSpecies,
        services: Array.isArray(data.services) ? data.services : [],
        vets: vetsWithName,
        species: speciesList,
      });
    } catch (err) {
      console.error("Error loading options:", err);
      toast.error("Failed to load options!");
      setOptions({ users: [], pets: [], services: [], vets: [], species: [] });
    } finally {
      setLoadingOptions(false);
    }
  };

  // --- Load bookings and map pets/species ---
  const getAllBookings = async () => {
    try {
      let data = await bookingService.getAll();
      if (!Array.isArray(data)) data = [];

      const safePets = Array.isArray(options.pets) ? options.pets : [];
      data = data.map((b) => {
        if (!b.pet_id) return { ...b, pet_id: null };
        const found = safePets.find((p) => p._id === b.pet_id?._id);
        return {
          ...b,
          pet_id: {
            ...b.pet_id,
            name: b.pet_id.name || found?.name || "Unknown",
            species: b.pet_id.species || found?.species || { _id: "unknown", name: "Unknown" }
          },
        };
      });

      const searchLower = search.toLowerCase();
      data = data.filter((b) => {
        const userName = b.user_id?.name?.toLowerCase() || "";
        const note = b.note?.toLowerCase() || "";
        const speciesMatch =
          !filters.pet || (b.pet_id?.species?.name || "").toLowerCase() === filters.pet.toLowerCase();
        return (
          (!search || userName.includes(searchLower) || note.includes(searchLower)) &&
          speciesMatch &&
          (!filters.service || b.services?.some((s) => s.service_id?._id === filters.service)) &&
          (filters.status === "ALL" || b.status?.toUpperCase() === filters.status.toUpperCase()) &&
          (!filters.vet || b.veterinarian_id?._id === filters.vet)
        );
      });

      setBookings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings!");
      setBookings([]);
    }
  };

  useEffect(() => { loadOptions(); }, []);
  useEffect(() => { if (!loadingOptions) getAllBookings(); }, [search, filters, options.pets, loadingOptions]);

  const handleDelete = async (id) => {
    try {
      await bookingService.remove(id);
      toast.success("Booking deleted!");
      getAllBookings();
    } catch {
      toast.error("Failed to delete booking!");
    }
  };

  const handleView = (b) => { setCurrentBooking(b); setFormMode("view"); };
  const handleAdd = () => { setCurrentBooking(null); setFormMode("add"); };
  const handleEditClick = (b) => { setCurrentBooking(b); setFormMode("edit"); };
  const handleFormSuccess = async () => {
    await getAllBookings();
    toast.success(formMode === "add" ? "Booking created!" : "Booking updated!");
    setFormMode(null);
    setCurrentBooking(null);
  };
  const handleCancel = () => { setFormMode(null); setCurrentBooking(null); };
  const isFutureBooking = (booking) => booking?.booking_date && new Date(booking.booking_date) > new Date();

  return (
    <div className="bg-white shadow-xl flex-1 animate-fade-in">
      {!formMode ? (
        <>
          <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-[#2c2c2c]">
              <Package size={20} className="text-[#846551]" />
              Booking Management
            </h2>
            <button onClick={handleAdd} className="px-4 py-2 bg-[#846551] text-white rounded-lg shadow hover:scale-105">
              + Create Booking
            </button>
          </div>

          {/* FILTERS */}
          <div className="p-6 bg-[#f5f3f2] border-b flex flex-col lg:flex-row gap-4">
            {/* SEARCH */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer or note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#846551]"
              />
            </div>

            {/* SPECIES FILTER */}
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filters.pet}
                onChange={(e) => setFilters({ ...filters, pet: e.target.value })}
                className="pl-10 pr-8 py-2 border rounded-lg bg-white"
              >
                <option value="">All Species</option>
                <option value="Cat">Cat</option>
                <option value="Dog">Dog</option>
                <option value="Bird">Bird</option>
              </select>
            </div>

            {/* SERVICE FILTER */}
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filters.service}
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                className="pl-10 pr-8 py-2 border rounded-lg bg-white"
              >
                <option value="">All Services</option>
                {Array.isArray(options.services) &&
                  options.services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* STATUS FILTER */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="pl-10 pr-8 py-2 border rounded-lg bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          <BookingTable
            bookings={bookings}
            onEdit={handleEditClick}
            onDeleteBooking={handleDelete}
            onView={handleView}
            speciesFilter={filters.pet} // chính xác theo dropdown
          />
        </>
      ) : (
        <BookingForm
          initialData={currentBooking}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
          mode={formMode}
          options={options}
          disableCustomerPet={formMode === "edit" && isFutureBooking(currentBooking)}
          onEditClick={() => handleEditClick(currentBooking)}
        />
      )}
    </div>
  );
}
