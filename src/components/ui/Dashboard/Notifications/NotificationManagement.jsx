import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Search, Plus, Eye, Trash2, Edit } from 'lucide-react';
import Pagination from '../../../Layout/Pagination';
import CreateNotificationModal from './CreateNotificationModal';
import NotificationDetailModal from './NotificationDetailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // modals
  const [viewNotification, setViewNotification] = useState(null);
  const [editNotification, setEditNotification] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState(null);

  const userToken = localStorage.getItem('token');
  const userRole = JSON.parse(localStorage.getItem('user'))?.role;

  const API_BASE = 'http://localhost:3000';

  useEffect(() => {
    fetchNotifications();
  }, [page, limit, query, status]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(query && { search: query }),
        ...(status && { status: status })
      });

      const response = await fetch(`${API_BASE}/api/notifications?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load notifications (${response.status})`);
      }

      const result = await response.json();
      console.log('Notification Management API response:', result);
      
      let notificationsData = [];
      if (result.data && result.data.notifications && Array.isArray(result.data.notifications)) {
        notificationsData = result.data.notifications;
      } else if (Array.isArray(result.data)) {
        notificationsData = result.data;
      } else if (Array.isArray(result)) {
        notificationsData = result;
      }
      
      setNotifications(notificationsData);
      setTotal(result.data?.pagination?.totalItems || notificationsData.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Error loading notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Realtime: connect to Socket.IO
  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const socket = io(baseURL, { transports: ['websocket'] });

    try {
      const u = JSON.parse(localStorage.getItem('user'));
      const userId = u?._id || u?.id;
      if (userId) socket.emit('auth:join', String(userId));
    } catch {}

    socket.on('notification:new', () => {
      fetchNotifications();
    });

    return () => socket.disconnect();
  }, []);

  const handleToggleStatus = async (notification) => {
    try {
      const newStatus = notification.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`${API_BASE}/api/notifications/${notification._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error toggling notification status:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const resetAndReload = () => {
    setCreateOpen(false);
    setEditNotification(null);
    setDeleteNotification(null);
    fetchNotifications();
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <span className="text-[#846551]">🔔</span>
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Notification Management
          </span>
        </h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          + Create Notification
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search notifications by title or description..."
                value={query}
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚡</span>
            <select 
              value={status} 
              onChange={(e) => { setPage(1); setStatus(e.target.value); }} 
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
            >
              <option value="">All Status</option>
              <option value="active">ACTIVE</option>
              <option value="inactive">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Created By</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created At</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n, idx) => (
                <tr key={n._id} className="border-b last:border-0">
                  <td className="px-3 py-2">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-3 py-2 font-medium max-w-[200px] break-words" title={n.title}>{n.title}</td>
                  <td className="px-3 py-2 max-w-[300px] text-gray-600 break-words">
                    <div className="line-clamp-2">{n.content || n.description || '—'}</div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 break-words">
                    {n.created_by?.name || n.created_by?.username || 'System'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${n.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {n.status === 'inactive' ? '🚫 INACTIVE' : '✅ ACTIVE'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{formatDate(n.created_at)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setViewNotification(n)} className="px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50" title="View">👁️</button>
                      {userRole === 'admin' && (
                        <>
                          <button onClick={() => {
                            setEditNotification(n);
                            setCreateOpen(true);
                          }} className="px-2.5 py-1 rounded bg-amber-500 text-white hover:bg-amber-600" title="Edit">✎</button>
                          {n.status === 'inactive' ? (
                            <button onClick={() => handleToggleStatus(n)} className="px-2.5 py-1 rounded bg-green-600 text-white hover:bg-green-700" title="Reactivate">↻</button>
                          ) : (
                            <button onClick={() => setDeleteNotification(n)} className="px-2.5 py-1 rounded bg-red-600 text-white hover:bg-red-700" title="Deactivate">🗑️</button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && !loading && (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>No notifications</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select value={limit} onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }} className="border rounded px-2 py-1">
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded border disabled:opacity-50">Previous</button>
            <span>{page}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {createOpen && (
        <CreateNotificationModal
          notification={editNotification}
          isOpen={createOpen}
          onClose={() => {
            setCreateOpen(false);
            setEditNotification(null);
          }}
          onSuccess={resetAndReload}
        />
      )}

      {viewNotification && (
        <NotificationDetailModal
          notification={viewNotification}
          isOpen={!!viewNotification}
          onClose={() => setViewNotification(null)}
        />
      )}

      {deleteNotification && (
        <DeleteConfirmationModal
          notification={deleteNotification}
          isOpen={!!deleteNotification}
          onClose={() => setDeleteNotification(null)}
          onConfirm={async () => {
            await handleToggleStatus(deleteNotification);
            setDeleteNotification(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationManagement;
