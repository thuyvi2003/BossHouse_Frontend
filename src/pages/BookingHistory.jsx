// src/pages/BookingHistoryUser.jsx
import React, { useEffect, useState } from "react";
import bookingService from "../services/bookingService";
import optionService from "../services/optionService";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, Edit, X, Plus, Minus, Calendar, Clock, Search, Filter, Package } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "@/components/Layout/Pagination";

// -------------------- Popup Component --------------------
function BookingPopup({ booking, mode, options, onClose, onSave, onEditMode }) {
  const isView = mode === "view";
  const now = new Date();
  const bookingDate = new Date(booking.booking_date);
  const canEdit = booking.status === "PENDING" && bookingDate.getTime() > now.getTime();
  const disableOtherFields = isView || !canEdit;

  const datePickerRef = React.useRef(null);
  const [form, setForm] = React.useState({
    pet_id: booking.pet_id?._id || booking.pet_id,
    vet_id: booking.veterinarian_id?._id || booking.veterinarian_id || "",
    bookingDate,
    services: booking.services?.map((s) => ({
      service_id: s.service_id?._id || s.service_id,
      name: s.service_id?.name || s.name,
      quantity: s.quantity || 1,
      base_price: s.service_id?.base_price || 0,
      duration_minutes: s.service_id?.duration_minutes || s.duration_minutes || 0,
    })) || [],
    note: booking.note || "",
  });

  const [hour, setHour] = React.useState(form.bookingDate.getHours() % 12 || 12);
  const [minute, setMinute] = React.useState(form.bookingDate.getMinutes());
  const [AMPM, setAMPM] = React.useState(form.bookingDate.getHours() >= 12 ? "PM" : "AM");

  React.useEffect(() => {
    const h = AMPM === "PM" ? hour % 12 + 12 : hour % 12;
    const newDate = new Date(form.bookingDate);
    newDate.setHours(h, minute);
    setForm((prev) => ({ ...prev, bookingDate: newDate }));
  }, [hour, minute, AMPM]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleAddService = (serviceId) => {
    const s = options.services.find((x) => x._id === serviceId);
    if (!s) return;
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { service_id: s._id, name: s.name, base_price: s.base_price, quantity: 1, duration_minutes: s.duration_minutes }],
    }));
  };

  const handleRemoveService = (serviceId) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.service_id !== serviceId),
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        pet_id: form.pet_id,
        vet_id: form.vet_id,
        booking_date: form.bookingDate.toISOString(),
        services: form.services.map((s) => ({ service_id: s.service_id, quantity: s.quantity })),
        note: form.note,
      };
      await bookingService.update(booking._id, payload);
      toast.success("Booking updated successfully");
      onSave && onSave();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-yellow-800">{isView ? "View Booking" : "Edit Booking"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600"><X size={20} /></button>
        </div>

        {/* Pet + Vet row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pet</label>
            <select
              value={form.pet_id}
              onChange={(e) => handleChange("pet_id", e.target.value)}
              disabled={disableOtherFields}
              className="w-full border rounded p-2"
            >
              {options.pets.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.species})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vet</label>
            <select
              value={form.vet_id || ""}
              disabled={disableOtherFields}
              onChange={(e) => handleChange("vet_id", e.target.value)}
              className="w-full border rounded p-2 bg-gray-100"
            >
              <option value="">No vet assigned</option>
              {options.vets?.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.user_id?.name} ({v.specialty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
          {!disableOtherFields && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddService(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            >
              <option value="">Select a service</option>
              {options.services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} - ${s.base_price} - {s.duration_minutes} mins
                </option>
              ))}
            </select>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {form.services.length === 0 && <div className="p-2 border rounded bg-gray-50">No services selected</div>}
            {form.services.map((s) => (
              <div key={s.service_id} className="flex items-center gap-2 px-3 py-1 rounded-full shadow-sm text-yellow-800 bg-yellow-100">
                <span>{s.name} × {s.quantity}</span>
                {!disableOtherFields && (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleAddService(s.service_id)} className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full"><Plus size={12} /></button>
                    <button type="button" onClick={() => handleRemoveService(s.service_id)} className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"><Minus size={12} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Price gọn nằm dưới danh sách service */}
        <div className="mt-2 text-sm font-semibold text-yellow-800">
          Total: ${form.services.reduce((sum, s) => sum + (s.base_price || 0) * s.quantity, 0).toLocaleString()}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <DatePicker
                ref={datePickerRef}
                selected={form.bookingDate}
                onChange={(date) => {
                  if (!date) return;
                  setForm((prev) => {
                    const newDate = new Date(prev.bookingDate);
                    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    return { ...prev, bookingDate: newDate };
                  });
                }}
                dateFormat="dd-MM-yyyy"
                disabled={disableOtherFields}
                className="w-full border rounded p-2 pl-7"
              />
              <Calendar className="absolute left-2 top-2 w-5 h-5 text-gray-500 cursor-pointer" onClick={() => datePickerRef.current?.setOpen(true)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <div className="flex items-center gap-1">
              <Clock className="w-5 h-5 text-gray-500" />
              <select className="border rounded p-2 w-14" value={hour} onChange={(e) => setHour(parseInt(e.target.value))} disabled={disableOtherFields}>{Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}</select>
              <span className="font-semibold">:</span>
              <select className="border rounded p-2 w-14" value={minute} onChange={(e) => setMinute(parseInt(e.target.value))} disabled={disableOtherFields}>{Array.from({ length: 60 }, (_, i) => i).map(m => <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>)}</select>
              <select className="border rounded p-2 w-16" value={AMPM} onChange={(e) => setAMPM(e.target.value)} disabled={disableOtherFields}><option value="AM">AM</option><option value="PM">PM</option></select>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea value={form.note} onChange={(e) => handleChange("note", e.target.value)} disabled={disableOtherFields} className="w-full border rounded p-2" rows={3} />
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-3 bg-gray-50 border-t flex justify-center gap-3">
          {mode === "view" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Back to List
              </button>
              {/* Chỉ hiện nút Edit nếu booking chưa cancel và có thể edit */}
              {booking.status === "PENDING" && (
                <button
                  onClick={onEditMode}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
              )}
            </>
          )}
          {mode === "edit" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// -------------------- Main Component --------------------
export default function BookingHistoryUser() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [options, setOptions] = useState({ pets: [], services: [] });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ pet: "", service: "", status: "ALL" });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [popupMode, setPopupMode] = useState("view");

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings(); // chỉ user hiện tại
      setBookings(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    }
  };

  const fetchOptions = async () => {
    try {
      const [pets, services, vets] = await Promise.all([
        optionService.getPets(),
        optionService.getServices(),
        optionService.getVets(),
      ]);
      setOptions({ pets, services, vets });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchOptions();
  }, []);

  // --- Search & filter ---
  const filteredBookings = bookings
    .filter((b) => {
      const searchLower = search.toLowerCase();
      return (
        b.pet_id?.name?.toLowerCase().includes(searchLower) ||
        b.services?.some((s) => s.service_id?.name?.toLowerCase().includes(searchLower)) ||
        b.vet_id?.name?.toLowerCase().includes(searchLower)
      );
    })
    .filter((b) => (filters.pet ? b.pet_id?.species === filters.pet : true))
    .filter((b) =>
      filters.service
        ? b.services?.some((s) => (s.service_id?._id || s.service_id) === filters.service)
        : true
    )
    .filter((b) =>
      filters.status !== "ALL" ? b.status.toUpperCase() === filters.status.toUpperCase() : true
    );

  // --- Pagination ---
  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const handleCancel = async (b) => {
    const bookingDate = new Date(b.booking_date);
    if (bookingDate.getTime() <= Date.now()) {
      toast.error("Cannot cancel past bookings");
      return;
    }
    const confirmed = window.confirm("Are you sure to cancel this booking?");
    if (!confirmed) return;
    try {
      await bookingService.cancel(b._id);
      toast.success("Booking canceled");
      setBookings((prev) =>
        prev.map((item) => (item._id === b._id ? { ...item, status: "CANCELED" } : item))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booking");
    }
  };

  const openPopup = (b, mode = "view") => {
    setSelectedBooking(b);
    setPopupMode(mode);
  };
  const closePopup = () => setSelectedBooking(null);
  const switchToEditMode = () => setPopupMode("edit");

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-yellow-800">Booking History</h2>

      {/* --- Search & Filters --- */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by pet, vet or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filters.pet}
              onChange={(e) => setFilters({ ...filters, pet: e.target.value })}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
            >
              <option value="">All Pets</option>
              {[...new Set(options.pets.map((p) => p.species))].map((species) => (
                <option key={species} value={species}>{species}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filters.service}
              onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
            >
              <option value="">All Services</option>
              {options.services?.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
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

      {/* --- Table --- */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded text-sm">
          <thead className="bg-yellow-100">
            <tr className="text-left">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Pet</th>
              <th className="p-2 border">Vet</th>
              <th className="p-2 border">Services</th>
              <th className="p-2 border">Date & Time</th>
              <th className="p-2 border">Total Price</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">No bookings found</td>
              </tr>
            )}
            {currentItems.map((b, idx) => {
              const bookingDate = new Date(b.booking_date);
              const canEdit = b.status === "PENDING" && bookingDate.getTime() > Date.now();
              const canCancel = b.status === "PENDING" && bookingDate.getTime() > Date.now();
              return (
                <tr key={b._id} className="hover:bg-yellow-50">
                  <td className="p-2 border">{indexOfFirstItem + idx + 1}</td>
                  <td className="p-2 border">{b.pet_id?.name || b.pet_id}</td>
                  <td className="p-2 border">
                    {(() => {
                      if (!b.veterinarian_id) return "Not assigned";
                      const vetId = typeof b.veterinarian_id === "object" ? b.veterinarian_id._id : b.veterinarian_id;
                      const vet = options.vets?.find(v => v._id === vetId);
                      return vet ? `${vet.user_id?.name} (${vet.specialty})` : "Not assigned";
                    })()}
                  </td>
                  <td className="p-2 border max-w-xs">{b.services?.map((s) => s.service_id?.name || s.name).join(", ")}</td>
                  <td className="p-2 border">{bookingDate.toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-2 border">{b.total_price?.toLocaleString()}$</td>
                  <td className="p-2 border">{b.status}</td>
                  <td className="p-2 border flex flex-wrap gap-2">
                    <button onClick={() => openPopup(b, "view")} className="px-2 py-1 text-blue-600 border rounded hover:bg-gray-100 flex items-center gap-1"><Eye size={16} /> View</button>
                    {canEdit && <button onClick={() => openPopup(b, "edit")} className="px-2 py-1 text-green-600 border rounded hover:bg-gray-100 flex items-center gap-1"><Edit size={16} /> Edit</button>}
                    {canCancel && <button onClick={() => handleCancel(b)} className="px-2 py-1 text-red-600 border rounded hover:bg-gray-100 flex items-center gap-1"><X size={16} /> Cancel</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      <div className="mt-4 flex justify-center">
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {selectedBooking && (
        <BookingPopup
          booking={selectedBooking}
          mode={popupMode}
          options={options}
          onClose={closePopup}
          onSave={fetchBookings}
          onEditMode={switchToEditMode}
        />
      )}
    </div>
  );
}
