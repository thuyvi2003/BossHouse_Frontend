import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../button';

const DeleteConfirmationModal = ({ notification, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Notification
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
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Toggle notification status?
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Title:</p>
              <p className="font-medium text-gray-900">"{notification.title}"</p>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              This will toggle the notification status between <span className="font-medium text-green-600">Active</span> and <span className="font-medium text-gray-600">Inactive</span>. 
              Current status: <span className={`font-medium ${notification.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                {notification.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Toggle Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
