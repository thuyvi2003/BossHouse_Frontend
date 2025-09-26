// src/components/BookingTable.jsx
import React, { useState, useMemo } from "react";
import Pagination from "../../../Layout/Pagination"; // import component mèo nâu

export default function BookingTable({
  bookings,
  onEdit,
  onDeleteBooking,
  onView,
  rowsPerPage = 5,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // 👉 Sort: future first, past later
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

  // Pagination
  const totalPages = Math.ceil(sortedBookings.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentBookings = sortedBookings.slice(
    startIndex,
    startIndex + rowsPerPage
  );

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
    <div className="overflow-x-auto shadow-lg rounded-xl relative">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-[#d7cbbf] text-gray-900 text-sm">
            <th className="px-4 py-3 text-left font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Customer</th>
            <th className="px-4 py-3 text-left font-semibold">Pet</th>
            <th className="px-4 py-3 text-left font-semibold">Services</th>
            <th className="px-4 py-3 text-left font-semibold">Date & Time</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Note</th>
            <th className="px-4 py-3 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.length > 0 ? (
            currentBookings.map((b, index) => {
              const bookingDate = b.booking_date
                ? new Date(b.booking_date)
                : null;
              const isPast = bookingDate && bookingDate < new Date();

              const dateStr = bookingDate
                ? bookingDate.toLocaleDateString()
                : "-";
              const timeStr = bookingDate
                ? bookingDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              return (
                <tr
                  key={b._id}
                  className={`border-b transition-all ${
                    isPast
                      ? "bg-gray-200 text-gray-500 italic"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <td className="px-4 py-3 text-sm">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm">{b.user_id?.name || "Unknown"}</td>
                  <td className="px-4 py-3 text-sm">{b.pet_id?.species || "Unknown"}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(b.services) && b.services.length > 0 ? (
                        b.services.map((s) => (
                          <span
                            key={s._id || s.service_id?._id}
                            className="px-2 py-0.5 text-xs bg-gray-100 border rounded-md text-gray-700"
                          >
                            {s.name || s.service_id?.name || "Service"} × {s.quantity || 1}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No service</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {dateStr} {timeStr}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${
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
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{b.note || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(b)}
                        className="px-2 py-1 text-xs border border-gray-600 text-gray-600 rounded-md hover:bg-gray-100"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(b)}
                        className="px-2 py-1 text-xs border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(b._id)}
                        className="px-2 py-1 text-xs border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="px-4 py-4 text-center text-gray-500 italic">
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination using catBrown */}
      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}

      {/* Popup confirm delete */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 transform transition-all scale-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Delete Booking</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to <span className="font-semibold text-red-600">delete</span> this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium shadow hover:bg-red-700 transition-colors"
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
