import React from 'react';
import { X, Bell, Users } from 'lucide-react';
import { Button } from '../../button';
import { Card } from '../../card';

const NotificationDetailModal = ({ notification, isOpen, onClose }) => {
  if (!isOpen || !notification) return null;



  const getTargetAudienceText = (audience) => {
    const audienceMap = {
      all: 'All Users',
      admin: 'Admin Only',
      staff: 'Staff Only',
      veterinarian: 'Veterinarian Only',
      user: 'User Only',
      specific: 'Specific Users'
    };
    return audienceMap[audience] || audience;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Bell className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Notification Detail
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-900 font-medium">{notification.title}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-900 whitespace-pre-wrap">{notification.content || notification.description || 'No description provided'}</p>
            </div>
          </div>


          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">
                  {getTargetAudienceText(notification.target_audience)}
                </span>
              </div>
              {notification.target_audience === 'specific' && notification.target_users?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Specific users:</p>
                  <div className="flex flex-wrap gap-1">
                    {notification.target_users.map((user, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {user}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>




        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
