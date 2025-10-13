import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userToken = localStorage.getItem('token');
  const userRole = JSON.parse(localStorage.getItem('user'))?.role;

  useEffect(() => {
    if (userToken) {
      fetchNotifications();
    }
  }, [userToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification Dropdown API response:', result); // Debug log
        console.log('Result.data type:', typeof result.data);
        console.log('Result.data is array:', Array.isArray(result.data));
        console.log('Result.data length:', result.data?.length);
        
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
        
        console.log('All notifications before filter:', notificationsData);
        
        const activeNotifications = notificationsData.filter(notification => 
          notification.status === 'active'
        );
        
        console.log('Active notifications after filter:', activeNotifications);
        console.log('Active notifications count:', activeNotifications.length);
        
        setNotifications(activeNotifications);
        
        // Count unread notifications (assuming all are unread for simplicity)
        // In a real app, you'd track read status
        setUnreadCount(activeNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications available</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => { setIsOpen(false); navigate(`/notifications/${notification._id}`); }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.content || notification.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button onClick={() => { setIsOpen(false); navigate('/notifications'); }} className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
