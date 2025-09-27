import React, { useState, useMemo } from "react";
import Pagination from "../../../Layout/Pagination";

export default function BookingTable({
  bookings,
  onEdit,
  onDeleteBooking,
  onView,
  rowsPerPage = 8,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const sortedBookings = useMemo(() => {
    const now = new Date();
    return [...bookings].sort((a, b) => {
      const dateA = a.booking_date ? new Date(a.booking_date) : new Date(0);
      const dateB = b.booking_date ? new Date(b.booking_date) : new Date(0);
      const aIsPast = dateA < now;
      const bIsPast = dateB < now;
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      return dateA - dateB;
    });
  }, [bookings]);

  const totalPages = Math.ceil(sortedBookings.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentBookings = sortedBookings.slice(startIndex, startIndex + rowsPerPage);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowConfirm(true);
  };
  const confirmDelete = () => {
    if (selectedId) onDeleteBooking(selectedId);
    setShowConfirm(false);
    setSelectedId(null);
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-lg">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_150px_120px_1fr_150px_100px_120px] gap-2 px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider bg-[#f5f3f2] border-b">
        <div>#</div>
        <div>Customer</div>
        <div>Pet</div>
        <div>Services</div>
        <div>Date & Time</div>
        <div>Status</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Table Body */}
      <div className="max-h-[650px] divide-y divide-gray-100">
        {currentBookings.length === 0 && (
          <div className="px-4 py-4 text-gray-500 italic">No bookings found.</div>
        )}

        {currentBookings.map((b, idx) => {
          const bookingDate = b.booking_date ? new Date(b.booking_date) : null;
          const isPast = bookingDate && bookingDate < new Date();
          const dateStr = bookingDate
            ? bookingDate.toLocaleDateString()
            : "-";
          const timeStr = bookingDate
            ? bookingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "-";

          return (
            <div
              key={b._id || idx}
              className={`relative px-6 py-5 grid grid-cols-[40px_150px_120px_1fr_150px_100px_120px] gap-2 items-center
                bg-white hover:bg-gray-50 transition-all duration-150
                ${isPast ? "bg-gray-50 text-gray-500 italic" : ""}`}
            >
              <div className="font-semibold">{startIndex + idx + 1}</div>
              <div className="truncate">{b.user_id?.name || "Unknown"}</div>
              <div className="truncate">{b.pet_id?.species || "Unknown"}</div>
              <div className="flex flex-wrap gap-1 overflow-hidden max-w-full">
                {Array.isArray(b.services) && b.services.length > 0 ? (
                  b.services.map((s) => (
                    <span
                      key={s._id || s.service_id?._id}
                      className="px-2 py-0.5 text-xs bg-gray-100 border rounded-md text-gray-700 truncate"
                    >
                      {s.name || s.service_id?.name || "Service"} × {s.quantity || 1}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">No service</span>
                )}
              </div>
              <div>{dateStr} {timeStr}</div>
              <div>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    b.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : b.status === "CONFIRMED"
                      ? "bg-blue-100 text-blue-700"
                      : b.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : b.status === "CANCELED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => onView(b)}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(b)}
                  className="px-2 py-1 text-xs border rounded hover:bg-blue-50 border-blue-600 text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(b._id)}
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50 border-red-600 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 bg-gray-50 border-t flex justify-center">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Confirm Delete */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96">
            <h3 className="text-lg font-bold mb-4">Delete Booking</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
