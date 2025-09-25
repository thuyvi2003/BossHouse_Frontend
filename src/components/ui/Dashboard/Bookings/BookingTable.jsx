import React from "react";

export default function BookingTable({ bookings, onEdit, onCancelBooking, onView }) {
  return (
    <div className="overflow-x-auto shadow-lg rounded-xl">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-[#d7cbbf] text-gray-900 text-sm">
            <th className="px-4 py-3 text-left font-semibold">#</th> {/* ID ảo */}
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
          {bookings.length > 0 ? (
            bookings.map((b, index) => {
              const bookingDate = b.booking_date ? new Date(b.booking_date) : null;
              const dateStr = bookingDate ? bookingDate.toLocaleDateString() : "-";
              const timeStr = bookingDate
                ? bookingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "-";

              return (
                <tr key={b._id} className="border-b hover:bg-gray-50 transition-all">
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{index + 1}</td> {/* ID ảo */}
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{b.user_id?.name || "Unknown"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">{b.pet_id?.species || "Unknown"}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(b.services) && b.services.length > 0 ? (
                        b.services.map((s) => (
                          <span
                            key={s._id || s.service_id?._id}
                            className="px-2 py-0.5 text-xs bg-gray-100 border rounded-md text-gray-700"
                          >
                            {(s.name || s.service_id?.name || "Service")} × {s.quantity || 1}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No service</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                    {dateStr} {timeStr}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
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
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{b.note || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(b)}
                        className="px-2 py-1 text-xs border border-gray-600 text-gray-600 rounded-md hover:bg-gray-100 transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(b)}
                        className="px-2 py-1 text-xs border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onCancelBooking(b._id)}
                        className="px-2 py-1 text-xs border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-all"
                      >
                        Cancel
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
    </div>
  );
}
