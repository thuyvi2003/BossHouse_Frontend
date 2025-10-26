const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class NotificationService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/notifications`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getAllNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.target_audience) queryParams.append('target_audience', params.target_audience);
      if (params.search) queryParams.append('search', params.search);
      if (params.read_status) queryParams.append('read_status', params.read_status);
      
      // Add date filters
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const url = `${this.baseURL}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getNotificationById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  async createNotification(notificationData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async updateNotification(id, notificationData) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  async deleteNotification(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async searchNotifications(searchTerm, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      });

      const response = await fetch(`${this.baseURL}/search?${queryParams.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching notifications:', error);
      throw error;
    }
  }

  async getNotificationStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseURL}/${notificationId}/read`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await fetch(`${this.baseURL}/mark-all-read`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Helper method to get active notifications for homepage
  async getActiveNotifications() {
    try {
      const result = await this.getAllNotifications({
        status: 'active',
        limit: 10
      });
      return result.data || [];
    } catch (error) {
      console.error('Error fetching active notifications:', error);
      return [];
    }
  }

  // Helper method to get unread count
  async getUnreadCount() {
    try {
      const result = await this.getAllNotifications({
        status: 'active',
        limit: 1
      });
      return result.pagination?.total || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
