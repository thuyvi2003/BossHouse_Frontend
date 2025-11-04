// ScheduleTable.jsx
import React, { useState, useMemo } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import Pagination from "../../../Layout/Pagination";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ScheduleTable({ data, onEdit, onDelete, onView, rowsPerPage = 6 }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort schedules and mark past
  const sortedSchedules = useMemo(() => {
    const now = new Date();
    return [...data].sort((a, b) => {
      const dateA = new Date(a.start_time);
      const dateB = new Date(b.start_time);
      const aIsPast = dateA < now;
      const bIsPast = dateB < now;
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      return dateA - dateB;
    });
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(sortedSchedules.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentSchedules = sortedSchedules.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full bg-white border text-center">
        <thead className="bg-[#f5f3f2]">
          <tr>
            <th className="py-2 px-4 border">#</th>
            <th className="py-2 px-4 border">Veterinarian</th>
            <th className="py-2 px-4 border">Start Time</th>
            <th className="py-2 px-4 border">End Time</th>
            <th className="py-2 px-4 border">Status</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentSchedules.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-gray-500 italic">
                No schedules found.
              </td>
            </tr>
          ) : (
            currentSchedules.map((s, idx) => {
              const isPast = new Date(s.start_time) < new Date();
              return (
                <tr
                  key={s._id}
                  className={`hover:bg-gray-50 transition ${isPast ? "bg-gray-50 text-gray-400 italic" : ""
                    }`}
                >
                  <td className="py-2 px-4 border">{startIndex + idx + 1}</td>
                  <td className="py-2 px-4 border">
                    {s.veterinarian_id
                      ? `${s.veterinarian_id.user_id?.name} (${s.veterinarian_id.specialty || "Unknown"})`
                      : "Unknown"}
                  </td>
                  <td className="py-2 px-4 border">{formatDate(s.start_time)}</td>
                  <td className="py-2 px-4 border">{formatDate(s.end_time)}</td>
                  <td
                    className={`py-2 px-4 border font-semibold ${isPast || !s.is_available ? "text-red-600" : "text-green-600"
                      }`}
                  >
                    {isPast || !s.is_available ? "Unavailable" : "Available"}
                  </td>
                  <td className="py-2 px-4 border flex justify-center gap-2">
                    <button
                      onClick={() => onView(s)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye size={18} />
                    </button>

                    {!isPast && (
                      <button
                        onClick={() => onEdit(s)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(s)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination always shows */}
      <div className="flex justify-center mt-3">
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
