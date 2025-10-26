import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Search, Plus, Eye, Trash2, Edit } from 'lucide-react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Card } from '../../card';
import CreateNotificationModal from './CreateNotificationModal';
import NotificationDetailModal from './NotificationDetailModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const userToken = localStorage.getItem('token');
  const userRole = JSON.parse(localStorage.getItem('user'))?.role;

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:3000/api/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification Management API response:', result); // Debug log
        console.log('Result.data type:', typeof result.data);
        console.log('Result.data is array:', Array.isArray(result.data));
        console.log('Result.data length:', result.data?.length);
        console.log('Result.data content:', result.data);
        
        // Handle different response formats
        let notificationsData = [];
        if (result.data && result.data.notifications && Array.isArray(result.data.notifications)) {
          notificationsData = result.data.notifications;
          console.log('Using result.data.notifications, count:', notificationsData.length);
        } else if (Array.isArray(result.data)) {
          notificationsData = result.data;
          console.log('Using result.data, count:', notificationsData.length);
        } else if (Array.isArray(result)) {
          notificationsData = result;
          console.log('Using result directly, count:', notificationsData.length);
        } else if (result.notifications && Array.isArray(result.notifications)) {
          notificationsData = result.notifications;
          console.log('Using result.notifications, count:', notificationsData.length);
        } else {
          console.log('No valid data found, result keys:', Object.keys(result));
        }
        
        console.log('Final notificationsData:', notificationsData);
        console.log('Notifications count:', notificationsData.length);
        
        // Dashboard shows ALL notifications (no status filter)
        setNotifications(notificationsData);
        setTotalItems(result.pagination?.total || notificationsData.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Realtime: connect to Socket.IO and refresh on new notifications
  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const socket = io(baseURL, { transports: ['websocket'] });

    // Optionally join personal room for targeted notifications
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      const userId = u?._id || u?.id;
      if (userId) socket.emit('auth:join', String(userId));
    } catch {}

    socket.on('notification:new', () => {
      // safest for filters/pagination: refetch list
      fetchNotifications();
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateNotification = () => {
    setShowCreateModal(true);
  };

  const handleViewDetail = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleEditNotification = (notification) => {
    setSelectedNotification(notification);
    setShowCreateModal(true);
  };

  const handleDeleteNotification = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };


  const handleNotificationCreated = () => {
    setShowCreateModal(false);
    setSelectedNotification(null);
    fetchNotifications();
  };

  const handleNotificationUpdated = () => {
    setShowCreateModal(false);
    setSelectedNotification(null);
    fetchNotifications();
  };

  const handleNotificationDeleted = async () => {
    if (selectedNotification) {
      try {
        // Toggle status between 'active' and 'inactive'
        const newStatus = selectedNotification.status === 'active' ? 'inactive' : 'active';
        
        const response = await fetch(`http://localhost:3000/api/notifications/${selectedNotification._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          setShowDeleteModal(false);
          setSelectedNotification(null);
          fetchNotifications();
        }
      } catch (error) {
        console.error('Error toggling notification status:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'ACTIVE', className: 'bg-green-100 text-green-800' },
      inactive: { text: 'INACTIVE', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Management</h1>
        <p className="text-gray-600">Manage and monitor all system notifications</p>
      </div>

      <Card className="p-6">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            onClick={handleCreateNotification}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create +
          </Button>
          
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search title or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">📢</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications available</h3>
            <p className="text-gray-500">Create your first notification to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Created by</th>
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Description</th>
                    <th className="px-4 py-3 text-left font-medium">Created</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {notifications.map((notification, index) => (
                    <tr key={notification._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {notification.created_by?.name || notification.created_by?.username || 'System'}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {notification.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {notification.content || notification.description || ''}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(notification.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {getStatusBadge(notification.status)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(notification)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {userRole === 'admin' && (
                            <>
                              <button
                                onClick={() => handleEditNotification(notification)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                                title="Edit Notification"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNotification(notification)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                title={notification.status === 'active' ? 'Hide Notification' : 'Show Notification'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  {currentPage}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateNotificationModal
          notification={selectedNotification}
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedNotification(null);
          }}
          onSuccess={selectedNotification ? handleNotificationUpdated : handleNotificationCreated}
        />
      )}

      {showDetailModal && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedNotification(null);
          }}
        />
      )}

      {showDeleteModal && selectedNotification && (
        <DeleteConfirmationModal
          notification={selectedNotification}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedNotification(null);
          }}
          onConfirm={handleNotificationDeleted}
        />
      )}
    </div>
  );
};

export default NotificationManagement;
