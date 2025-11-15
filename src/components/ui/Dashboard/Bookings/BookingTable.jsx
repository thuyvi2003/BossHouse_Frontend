import React, { useState, useMemo } from "react";
import Pagination from "../../../Layout/Pagination";

export default function BookingTable({
  bookings,
  onEdit,
  onDeleteBooking,
  onView,
  rowsPerPage = 6,
  speciesFilter = "", // nhận giá trị filter từ BookingManager
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // --- Filter bookings by speciesFilter ---
  const filteredBookings = useMemo(() => {
    if (!speciesFilter) return bookings; // All Species
    return bookings.filter((b) => {
      const speciesName = b.pet_id?.species?.name || b.pet_species || "";
      return speciesName.toLowerCase() === speciesFilter.toLowerCase();
    });
  }, [bookings, speciesFilter]);

  // --- Sort bookings ---
  const sortedBookings = useMemo(() => {
    const now = new Date();
    return [...filteredBookings].sort((a, b) => {
      const dateA = new Date(a.booking_date || 0);
      const dateB = new Date(b.booking_date || 0);
      const aIsPast = dateA < now;
      const bIsPast = dateB < now;
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      return dateA - dateB;
    });
  }, [filteredBookings]);

  const totalPages = Math.max(1, Math.ceil(sortedBookings.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentBookings = sortedBookings.slice(startIndex, startIndex + rowsPerPage);

  const handleDeleteClick = (id) => { setSelectedId(id); setShowConfirm(true); };
  const confirmDelete = () => { if (selectedId) onDeleteBooking(selectedId); setShowConfirm(false); setSelectedId(null); };

  const gridCols = "grid grid-cols-[30px_140px_140px_1fr_140px_80px_minmax(160px,1fr)] gap-2";

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: "-", time: "-", isPast: false };
    const d = new Date(dateStr);
    return { date: d.toLocaleDateString("en-GB"), time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isPast: d < new Date() };
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-lg text-sm w-full">
      {/* Table Header */}
      <div className={`${gridCols} px-2 py-2 font-semibold text-gray-700 uppercase tracking-wide bg-gray-100 border-b items-center`}>
        <div>#</div>
        <div>Customer</div>
        <div>Pet</div>
        <div>Services</div>
        <div>Date & Time</div>
        <div>Status</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Table Body */}
      <div className="max-h-[600px] divide-y divide-gray-100 overflow-y-auto">
        {currentBookings.length === 0 ? (
          <div className="px-2 py-3 text-gray-500 italic text-center">No bookings found.</div>
        ) : (
          currentBookings.map((b, idx) => {
            const { date, time, isPast } = formatDateTime(b.booking_date);
            const petDisplay = b.pet_id
              ? `${b.pet_id.name || "Unknown"} (${b.pet_id.species?.name || "Unknown"})`
              : b.pet_name
              ? `${b.pet_name} (${b.pet_species || "Unknown"})`
              : "Unknown";

            return (
              <div key={b._id || idx} className={`${gridCols} px-2 py-2 items-center ${isPast ? "bg-gray-50 text-gray-500 italic" : "bg-white hover:bg-gray-50"} transition`}>
                <div className="font-semibold">{startIndex + idx + 1}</div>
                <div className="truncate">{b.user_id?.name || "Unknown"}</div>
                <div className="truncate">{petDisplay}</div>
                <div className="truncate flex gap-1 overflow-hidden max-w-full">
                  {Array.isArray(b.services) && b.services.length > 0 ? (
                    <>
                      {b.services.slice(0, 2).map((s) => {
                        const name = s.service_id?.name || s.name || "Service";
                        const qty = s.quantity || 1;
                        return (
                          <span key={s._id || s.service_id?._id || name} className="px-1 py-0.5 text-xs bg-gray-100 border rounded truncate" title={`${name} × ${qty}`}>
                            {name} × {qty}
                          </span>
                        );
                      })}
                      {b.services.length > 2 && <span className="px-1 py-0.5 text-xs bg-gray-200 border rounded text-gray-600">+{b.services.length - 2} more</span>}
                    </>
                  ) : <span className="text-gray-400 italic text-xs truncate">No service</span>}
                </div>
                <div className="text-xs truncate">{date} {time}</div>
                <div>
                  <span className={`px-1 py-0.5 text-xs rounded-full font-semibold ${
                      b.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      b.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      b.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      b.status === "CANCELED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                    }`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex justify-center gap-1 text-xs">
                  <button onClick={() => onView(b)} className="px-1 py-0.5 border rounded hover:bg-gray-100">View</button>
                  <button onClick={() => onEdit(b)} className="px-1 py-0.5 border rounded hover:bg-blue-50 border-blue-500 text-blue-600">Edit</button>
                  <button onClick={() => handleDeleteClick(b._id)} className="px-1 py-0.5 border rounded hover:bg-red-50 border-red-500 text-red-600">Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="p-3 bg-gray-50 border-t flex justify-center">
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Confirm Delete */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96">
            <h3 className="text-lg font-bold mb-4">Delete Booking</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this booking? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

