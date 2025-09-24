import React from "react";

export default function BookingTable({ bookings, onEdit, onDelete, onView }) {
  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-yellow-400 text-gray-900 text-sm">
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Customer</th>
            <th className="p-2 text-left">Pet</th>
            <th className="p-2 text-left">Services</th>
            <th className="p-2 text-left">Veterinarian</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, index) => (
            <tr
              key={b._id}
              className={`${
                index % 2 === 0 ? "bg-yellow-50" : "bg-yellow-100"
              } hover:bg-yellow-200 transition`}
            >
              <td className="p-2 font-medium text-gray-800 border">{index + 1}</td>
              <td className="p-2 text-gray-800 border">{b.user_id?.name || "N/A"}</td>
              <td className="p-2 text-gray-800 border">{b.pet_id?.species || "N/A"}</td>

              {/* Services */}
              <td className="p-2 text-gray-800 border max-w-xs truncate">
                {b.services?.length
                  ? b.services
                      .map(
                        (s) =>
                          `${s.service_id?.name || s.service_id || "Unknown"} × ${s.quantity}`
                      )
                      .join(", ")
                  : "N/A"}
              </td>

              {/* Veterinarian */}
              <td className="p-2 text-gray-800 border max-w-xs truncate">
                {b.veterinarian_id?.user_id?.name
                  ? `${b.veterinarian_id.user_id.name} (${b.veterinarian_id.specialty})`
                  : b.veterinarian_id?.specialty || "N/A"}
              </td>

              <td className="p-2 text-gray-800 border">{new Date(b.booking_date).toLocaleString()}</td>
              <td className="p-2 font-semibold text-gray-900 border">{b.status}</td>

              {/* Actions */}
              <td className="p-2 text-center border flex justify-center gap-1">
                <button
                  onClick={() => onView(b)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(b)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(b._id)}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
