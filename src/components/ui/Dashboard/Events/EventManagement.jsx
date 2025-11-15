import { useEffect, useState } from 'react';
import eventService from '@/services/eventService';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Users, Search, Edit, Trash2, Plus, Eye, X, Filter } from 'lucide-react';
import Pagination from '@/components/Layout/Pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(8);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Modals
  const [viewEvent, setViewEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    image: '',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: '',
    category: '',
    is_featured: false,
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    image: '',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: '',
    category: '',
    is_featured: false,
  });

  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      let result;
      if (searchTerm.trim()) {
        result = await eventService.search(searchTerm, {
          category: category || undefined,
          status: status || undefined,
          limit,
          skip: (page - 1) * limit,
        });
      } else {
        result = await eventService.filter({
          category: category || undefined,
          status: status || undefined,
          limit,
          skip: (page - 1) * limit,
        });
      }

      setEvents(result.events || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (e) {
      setError(e.message || 'Error loading events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, category, status, limit, page]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await eventService.getAll({ limit: 1000 });
        const categories = [...new Set(result.events?.map((e) => e.category).filter(Boolean) || [])];
        setAvailableCategories(categories);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    };
    loadCategories();
  }, []);

  const handleCreate = async () => {
    setCreateErrors({});
    const errors = {};

    if (!createForm.title.trim()) errors.title = 'Title is required';
    if (!createForm.description.trim()) errors.description = 'Description is required';
    if (!createForm.start_date) errors.start_date = 'Start date is required';
    if (!createForm.end_date) errors.end_date = 'End date is required';
    if (!createForm.location.trim()) errors.location = 'Location is required';
    if (!createForm.max_participants || createForm.max_participants < 1)
      errors.max_participants = 'Max participants must be at least 1';

    if (createForm.start_date) {
      const now = new Date();
      const startDate = new Date(createForm.start_date);
      if (startDate < now) {
        errors.start_date = 'Start date cannot be in the past';
      }
    }

    // Validation: end_date phải sau start_date
    if (createForm.start_date && createForm.end_date) {
      if (new Date(createForm.start_date) >= new Date(createForm.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    try {
      await eventService.create({
        ...createForm,
        max_participants: parseInt(createForm.max_participants),
        start_date: new Date(createForm.start_date).toISOString(),
        end_date: new Date(createForm.end_date).toISOString(),
      });
      toast.success('Event created successfully');
      setCreateOpen(false);
      setCreateForm({
        title: '',
        description: '',
        image: '',
        start_date: '',
        end_date: '',
        location: '',
        max_participants: '',
        category: '',
        is_featured: false,
      });
      loadEvents();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to create event');
    }
  };

  const handleUpdate = async () => {
    setEditErrors({});
    const errors = {};

    if (!editForm.title.trim()) errors.title = 'Title is required';
    if (!editForm.description.trim()) errors.description = 'Description is required';
    if (!editForm.start_date) errors.start_date = 'Start date is required';
    if (!editForm.end_date) errors.end_date = 'End date is required';
    if (!editForm.location.trim()) errors.location = 'Location is required';
    if (!editForm.max_participants || editForm.max_participants < 1)
      errors.max_participants = 'Max participants must be at least 1';

    // Validation: start_date không được trong quá khứ (chỉ cho event UPCOMING)
    if (editForm.start_date && editEvent) {
      const now = new Date();
      const startDate = new Date(editForm.start_date);
      
      // Chỉ validate nếu event chưa bắt đầu
      if (editEvent.status === 'UPCOMING' && startDate < now) {
        errors.start_date = 'Start date cannot be in the past for upcoming events';
      }
    }

    // Validation: end_date phải sau start_date
    if (editForm.start_date && editForm.end_date) {
      if (new Date(editForm.start_date) >= new Date(editForm.end_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      await eventService.update(editEvent._id, {
        ...editForm,
        max_participants: parseInt(editForm.max_participants),
        start_date: new Date(editForm.start_date).toISOString(),
        end_date: new Date(editForm.end_date).toISOString(),
      });
      toast.success('Event updated successfully');
      setEditEvent(null);
      loadEvents();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to update event');
    }
  };

  const handleDelete = async () => {
    try {
      await eventService.delete(deleteEvent._id);
      toast.success('Event deleted successfully');
      setDeleteEvent(null);
      loadEvents();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to delete event');
    }
  };

  const openEdit = (event) => {
    setEditEvent(event);
    setEditForm({
      title: event.title || '',
      description: event.description || '',
      image: event.image || '',
      start_date: formatDateForInput(event.start_date),
      end_date: formatDateForInput(event.end_date),
      location: event.location || '',
      max_participants: event.max_participants || '',
      category: event.category || '',
      is_featured: event.is_featured || false,
    });
  };

  const handleImageUpload = async (file, isEdit = false) => {
    try {
      const url = await eventService.uploadImage(file);
      if (isEdit) {
        setEditForm((prev) => ({ ...prev, image: url }));
      } else {
        setCreateForm((prev) => ({ ...prev, image: url }));
      }
      toast.success('Image uploaded successfully');
    } catch (e) {
      toast.error('Failed to upload image');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Calendar size={20} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Event Management
          </span>
        </h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Create Event
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white min-w-[180px]"
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Limit Filter */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
            >
              <option value={5}>5 per page</option>
              <option value={8}>8 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {events.length} of {total} events
          </span>
          {(searchTerm || category || status) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategory('');
                setStatus('');
                setPage(1);
              }}
              className="text-[#846551] hover:text-[#5a4639] font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider bg-gradient-to-r from-[#f5f3f2] to-[#eae7e5] border-b shadow-sm">
        <div className="col-span-3">Title</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Location</div>
        <div className="col-span-2">Participants</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-2 text-center">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-transparent">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#846551]"></div>
            </div>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-red-600">{error}</div>
        ) : events.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">No events found</div>
        ) : (
          events.map((event, idx) => {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            return (
              <div
                key={event._id}
                className={`
            relative px-6 py-5 grid grid-cols-12 gap-4 items-center
            bg-white rounded-xl shadow-sm border border-gray-100
            hover:border-[#846551] hover:shadow-lg hover:scale-[1.01]
            transition-all duration-300 ease-in-out
            animate-fade-in-up
          `}
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                {/* Decorative left bar */}
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gray-200 hover:bg-[#846551] transition-all"></div>

                <div className="col-span-3">
                  <div className="font-semibold text-gray-900">{event.title}</div>
                  {event.is_featured && (
                    <span className="text-xs text-yellow-600 font-medium">Featured</span>
                  )}
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </div>
                <div className="col-span-2 text-sm text-gray-600 max-w-xs truncate">
                  {event.location}
                </div>
                <div className="col-span-2 text-sm text-gray-600">
                  {event.current_participants} / {event.max_participants}
                </div>
                <div className="col-span-1">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                      event.status === 'UPCOMING'
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'
                        : event.status === 'ONGOING'
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700'
                        : event.status === 'COMPLETED'
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                        : 'bg-gradient-to-r from-red-100 to-red-200 text-red-700'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setViewEvent(event)}
                    className="px-3 py-1 border border-[#846551] text-[#846551] rounded-lg hover:bg-[#f5f3f2] transition-all duration-300"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(event)}
                    className="px-3 py-1 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteEvent(event)}
                    className="px-3 py-1 border border-[#b85c49] text-[#b85c49] rounded-lg hover:bg-[#fbe9e6] transition-all duration-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="Event title"
              />
              {createErrors.title && <p className="text-red-500 text-xs mt-1">{createErrors.title}</p>}
            </div>

            <div>
              <Label htmlFor="create-description">Description *</Label>
              <textarea
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                placeholder="Event description"
              />
              {createErrors.description && (
                <p className="text-red-500 text-xs mt-1">{createErrors.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="create-image">Image URL</Label>
              <Input
                id="create-image"
                type="text"
                value={createForm.image}
                onChange={(e) => setCreateForm({ ...createForm, image: e.target.value })}
                placeholder="Or upload image below"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) handleImageUpload(e.target.files[0], false);
                }}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-start-date">Start Date *</Label>
                <Input
                  id="create-start-date"
                  type="datetime-local"
                  value={createForm.start_date}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                />
                {createErrors.start_date && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.start_date}</p>
                )}
              </div>
              <div>
                <Label htmlFor="create-end-date">End Date *</Label>
                <Input
                  id="create-end-date"
                  type="datetime-local"
                  value={createForm.end_date}
                  min={createForm.start_date || new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                />
                {createErrors.end_date && (
                  <p className="text-red-500 text-xs mt-1">{createErrors.end_date}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="create-location">Location *</Label>
              <Input
                id="create-location"
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="Event location"
              />
              {createErrors.location && <p className="text-red-500 text-xs mt-1">{createErrors.location}</p>}
            </div>

            <div>
              <Label htmlFor="create-max-participants">Max Participants *</Label>
              <Input
                id="create-max-participants"
                type="number"
                value={createForm.max_participants}
                onChange={(e) => setCreateForm({ ...createForm, max_participants: e.target.value })}
                min="1"
                placeholder="Maximum number of participants"
              />
              {createErrors.max_participants && (
                <p className="text-red-500 text-xs mt-1">{createErrors.max_participants}</p>
              )}
            </div>

            <div>
              <Label htmlFor="create-category">Category</Label>
              <Input
                id="create-category"
                type="text"
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                placeholder="Event category"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-featured"
                checked={createForm.is_featured}
                onChange={(e) => setCreateForm({ ...createForm, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="create-featured" className="cursor-pointer">
                Featured Event
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-[#846551] hover:bg-[#5a4639]">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editEvent} onOpenChange={(open) => !open && setEditEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editEvent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                {editErrors.title && <p className="text-red-500 text-xs mt-1">{editErrors.title}</p>}
              </div>

              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
                />
                {editErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{editErrors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  type="text"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  placeholder="Or upload image below"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) handleImageUpload(e.target.files[0], true);
                  }}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Start Date *</Label>
                  <Input
                    id="edit-start-date"
                    type="datetime-local"
                    value={editForm.start_date}
                    min={
                      editEvent.status === 'UPCOMING'
                        ? new Date().toISOString().slice(0, 16)
                        : undefined
                    }
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                  />
                  {editErrors.start_date && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.start_date}</p>
                  )}
                  {editEvent.status === 'UPCOMING' && (
                    <p className="text-gray-500 text-xs mt-1">
                      Start date cannot be in the past
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-end-date">End Date *</Label>
                  <Input
                    id="edit-end-date"
                    type="datetime-local"
                    value={editForm.end_date}
                    min={editForm.start_date || new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                  />
                  {editErrors.end_date && (
                    <p className="text-red-500 text-xs mt-1">{editErrors.end_date}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-location">Location *</Label>
                <Input
                  id="edit-location"
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
                {editErrors.location && <p className="text-red-500 text-xs mt-1">{editErrors.location}</p>}
              </div>

              <div>
                <Label htmlFor="edit-max-participants">Max Participants *</Label>
                <Input
                  id="edit-max-participants"
                  type="number"
                  value={editForm.max_participants}
                  onChange={(e) => setEditForm({ ...editForm, max_participants: e.target.value })}
                  min="1"
                />
                {editErrors.max_participants && (
                  <p className="text-red-500 text-xs mt-1">{editErrors.max_participants}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={editForm.is_featured}
                  onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-featured" className="cursor-pointer">
                  Featured Event
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEvent(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-[#846551] hover:bg-[#5a4639]">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewEvent} onOpenChange={(open) => !open && setViewEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewEvent?.title || 'Event Details'}</DialogTitle>
          </DialogHeader>
          {viewEvent && (
            <div className="space-y-4">
              {viewEvent.image && (
                <img
                  src={viewEvent.image.startsWith('http') ? viewEvent.image : `${API_BASE}${viewEvent.image}`}
                  alt={viewEvent.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{viewEvent.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Start Date</h4>
                  <p className="text-gray-600">{new Date(viewEvent.start_date).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">End Date</h4>
                  <p className="text-gray-600">{new Date(viewEvent.end_date).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Location</h4>
                  <p className="text-gray-600">{viewEvent.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Participants</h4>
                  <p className="text-gray-600">
                    {viewEvent.current_participants} / {viewEvent.max_participants}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Status</h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      viewEvent.status === 'UPCOMING'
                        ? 'bg-blue-100 text-blue-800'
                        : viewEvent.status === 'ONGOING'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {viewEvent.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Category</h4>
                  <p className="text-gray-600">{viewEvent.category || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEvent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteEvent} onOpenChange={(open) => !open && setDeleteEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          {deleteEvent && (
            <p>
              Are you sure you want to delete <strong>{deleteEvent.title}</strong>? This action cannot be
              undone.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEvent(null)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
