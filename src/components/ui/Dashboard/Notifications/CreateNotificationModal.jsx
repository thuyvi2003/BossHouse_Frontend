import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Card } from '../../card';

const CreateNotificationModal = ({ notification, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_audience: 'all',
    target_users: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userToken = localStorage.getItem('token');
  const isEdit = !!notification;

  useEffect(() => {
    if (isEdit && notification) {
      setFormData({
        title: notification.title || '',
        description: notification.content || notification.description || '',
        target_audience: notification.target_audience || 'all',
        target_users: notification.target_users || []
      });
    } else {
      // Reset form for new notification
      setFormData({
        title: '',
        description: '',
        target_audience: 'all',
        target_users: []
      });
    }
  }, [notification, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTargetUsersChange = (e) => {
    const value = e.target.value;
    const users = value.split(',').map(user => user.trim()).filter(user => user);
    setFormData(prev => ({
      ...prev,
      target_users: users
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit 
        ? `http://localhost:3000/api/notifications/${notification._id}`
        : 'http://localhost:3000/api/notifications';
      
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        // Backend expects 'content' not 'description'
        content: formData.description,
        title: formData.title,
        target_audience: formData.target_audience,
        target_users: formData.target_audience === 'specific' ? formData.target_users : [],
        // Set defaults for required backend fields
        status: 'active', // Always create as active
        type: 'info',
        priority: 'medium'
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
      } else {
        // Read body once and try to parse JSON, otherwise use raw text
        let errorMessage = `Server error (${response.status})`;
        try {
          const raw = await response.text(); // read once
          try {
            const parsed = JSON.parse(raw);
            errorMessage = parsed.message || parsed.error || JSON.stringify(parsed);
          } catch (parseErr) {
            // raw is not JSON (could be HTML or plain text)
            errorMessage = raw || errorMessage;
          }
        } catch (readErr) {
          console.error('Failed to read error response body:', readErr);
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
              {isEdit ? 'Edit Notification' : 'Add New Notification'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter notification title"
              required
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter notification description"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <select
              name="target_audience"
              value={formData.target_audience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="admin">Admin Only</option>
              <option value="staff">Staff Only</option>
              <option value="veterinarian">Veterinarian Only</option>
              <option value="user">User Only</option>
              <option value="specific">Specific Users</option>
            </select>
          </div>

          {/* Specific Users */}
          {formData.target_audience === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Users (comma-separated usernames)
              </label>
              <Input
                type="text"
                value={formData.target_users.join(', ')}
                onChange={handleTargetUsersChange}
                placeholder="username1, username2, username3"
                className="w-full"
              />
            </div>
          )}



          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
