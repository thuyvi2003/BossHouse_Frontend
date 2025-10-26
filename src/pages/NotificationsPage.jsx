import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import notificationService from "@/services/notificationService";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const readStatus = searchParams.get("read_status") || "";

  const debounceRef = useRef(null);
  const [query, setQuery] = useState(search);

  const limitOptions = useMemo(() => [3, 5, 10, 20, 50], []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await notificationService.getAllNotifications({
        page,
        limit,
        search: search.trim() || undefined,
        status: 'active',
        read_status: readStatus || undefined,
      });

      // Support both shapes: { data, pagination } or just arrays
      const list = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.notifications)
        ? result.data.notifications
        : Array.isArray(result)
        ? result
        : Array.isArray(result?.notifications)
        ? result.notifications
        : [];

      const pagination = result?.pagination || result?.data?.pagination;
      setTotalPages(pagination?.totalPages || pagination?.total_pages || 1);
      setNotifications(list);
    } catch (e) {
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, readStatus]);

  // Keep local query in sync when url search param changes (e.g., back/forward)
  useEffect(() => {
    setQuery(search || "");
  }, [search]);

  const onInputChange = (e) => {
    const nextVal = e.target.value;
    setQuery(nextVal);

    // debounce updating URL search param
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (nextVal && nextVal.trim() !== "") next.set("search", nextVal.trim()); else next.delete("search");
      next.set("page", "1");
      setSearchParams(next);
    }, 450);
  };

  const onChangeLimit = (e) => {
    const next = new URLSearchParams(searchParams);
    next.set("limit", e.target.value);
    next.set("page", "1");
    setSearchParams(next);
  };

  const onChangeReadStatus = (e) => {
    const next = new URLSearchParams(searchParams);
    if (e.target.value) {
      next.set("read_status", e.target.value);
    } else {
      next.delete("read_status");
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handlePageChange = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            name="q"
            value={query}
            onChange={onInputChange}
            placeholder="Search notifications..."
            className="border rounded-md px-3 py-2 w-full sm:w-80"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={readStatus}
            onChange={onChangeReadStatus}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={limit}
            onChange={onChangeLimit}
            className="border rounded-md px-2 py-2"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">items</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No notifications</div>
        ) : (
          <ul className="divide-y">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${n.is_read ? '' : 'font-semibold'}`}
                onClick={async () => {
                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                    await fetch(`${API_BASE_URL}/api/notifications/${n._id}/read`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                  } catch {}
                  navigate(`/notifications/${n._id}`);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-gray-900 truncate flex items-center gap-2">
                      {!n.is_read && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />}
                      <span>{n.title}</span>
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{n.content || n.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{formatDate(n.created_at || n.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination removed as requested */}
    </div>
  );
}


