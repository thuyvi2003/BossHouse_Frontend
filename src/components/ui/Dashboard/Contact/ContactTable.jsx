import React from "react";
import Pagination from "../../../Layout/Pagination";
import { Eye, PencilSimple, PaperPlane, Trash } from "phosphor-react";
import { Search, Filter } from "lucide-react";

export default function ContactTable({
  contacts,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onReply,
  onDelete,
  searchText,
  setSearchText,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
}) {
  const gridCols =
    "grid grid-cols-[40px_minmax(120px,0.5fr)_minmax(120px,0.5fr)_90px_80px_80px_minmax(160px,1fr)] gap-2";

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-lg text-sm w-full">
      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 p-4 bg-[#f5f3f2] border-b border-[#eae7e5]">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or message..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
          />
        </div>

        {/* Type Filter */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
          >
            <option value="">All Types</option>
            <option value="Support">Support</option>
            <option value="Feedback">Feedback</option>
            <option value="Complaint">Complaint</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[160px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Complete">Complete</option>
          </select>
        </div>
      </div>

      {/* Header */}
      <div
        className={`${gridCols} px-3 py-2 font-semibold text-gray-700 uppercase tracking-wide bg-[#f5f3f2] border-b`}
      >
        <div>#</div>
        <div>Name</div>
        <div>Email</div>
        <div>Phone</div>
        <div className="text-center">Type</div>
        <div className="text-center">Status</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100">
        {contacts.length === 0 ? (
          <div className="px-3 py-3 text-gray-500 italic text-center">
            No contacts found.
          </div>
        ) : (
          contacts.map((item, idx) => (
            <div
              key={item._id || idx}
              className={`${gridCols} px-3 py-2 items-center transition ${idx % 2 === 0 ? "bg-white hover:bg-yellow-50" : "bg-[#fcfaf9] hover:bg-yellow-50"
                }`}
            >
              <div className="font-semibold text-gray-800">
                {(currentPage - 1) * 6 + idx + 1}
              </div>

              <div className="truncate text-sm" title={item.name || "-"}>{item.name || "-"}</div>
              <div className="truncate text-sm" title={item.email || "-"}>{item.email || "-"}</div>
              <div className="truncate text-sm" title={item.phone || "-"}>{item.phone || "-"}</div>

              <div className="text-center max-w-[80px]">
                <span className="px-1 py-0.5 text-xs font-semibold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                  {item.type || "-"}
                </span>
              </div>

              {/* Status */}
              <div className="text-center max-w-[80px]">
                <span
                  className={`px-1 py-0.5 text-xs font-semibold rounded-full border ${item.status?.toLowerCase() === "complete"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-yellow-200 bg-yellow-50 text-yellow-700"
                    }`}
                >
                  {item.status?.toLowerCase() === "complete" ? "Complete" : "Pending"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-center items-center gap-1 text-xs whitespace-nowrap">
                <button
                  onClick={() => onView(item)}
                  className="px-2 py-0.5 border rounded flex items-center gap-1 hover:bg-gray-100"
                >
                  <Eye size={14} /> View
                </button>

                {item.status?.toLowerCase() !== "complete" && (
                  <button
                    onClick={() => onEdit(item)}
                    className="px-2 py-0.5 border rounded flex items-center gap-1 hover:bg-blue-50 border-blue-500 text-blue-600"
                  >
                    <PencilSimple size={14} /> Edit
                  </button>
                )}

                {(item.status?.toLowerCase() === "complete"
                  ? item.responses?.length > 0
                  : true) && (
                    <button
                      onClick={() => onReply(item, item.status?.toLowerCase() === "complete")}
                      className={`px-2 py-0.5 border rounded flex items-center gap-1 ${item.status?.toLowerCase() === "complete"
                        ? "bg-gray-400 hover:bg-gray-500 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                    >
                      <PaperPlane size={14} /> Reply
                    </button>
                  )}

                <button
                  onClick={() => onDelete(item)}
                  className="px-2 py-0.5 border rounded flex items-center gap-1 hover:bg-red-50 border-red-500 text-red-600"
                >
                  <Trash size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 bg-gray-50 border-t flex justify-center">
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
