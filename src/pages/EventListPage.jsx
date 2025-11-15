import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import eventService from '@/services/eventService';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function EventCard({ event }) {
  let imgSrc = '';
  if (event.image && event.image.trim() !== '') {
    if (event.image.startsWith('data:')) {
      imgSrc = event.image;
    } else if (event.image.startsWith('http')) {
      imgSrc = event.image;
    } else {
      imgSrc = `${API_BASE}${event.image}`;
    }
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isFull = event.current_participants >= event.max_participants;
  const isPast = new Date() > endDate;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {imgSrc && (
        <img
          src={imgSrc}
          alt={event.title}
          className="h-48 w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {event.is_featured && (
          <span className="inline-block w-fit px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
            Featured
          </span>
        )}
        <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {event.current_participants} / {event.max_participants} participants
            </span>
          </div>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              event.status === 'UPCOMING'
                ? 'bg-blue-100 text-blue-800'
                : event.status === 'ONGOING'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {event.status}
          </span>
          <Link
            to={`/events/${event._id}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });

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

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError('');
      try {
        let result;
        if (searchTerm.trim()) {
          result = await eventService.search(searchTerm, {
            category: selectedCategory || undefined,
            status: selectedStatus || undefined,
            limit: 20,
          });
        } else {
          result = await eventService.filter({
            category: selectedCategory || undefined,
            status: selectedStatus || undefined,
            limit: 20,
          });
        }

        setEvents(result.events || []);
        setPageInfo({
          page: result.page || 1,
          totalPages: result.totalPages || 1,
          total: result.total || 0,
        });
      } catch (e) {
        setError(e.message || 'Error loading events');
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-indigo-700">
          Events
        </h1>
        <p className="mt-2 text-gray-600">Join our exciting pet care events</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white min-w-[180px]"
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Results info */}
        {pageInfo.total > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {events.length} of {pageInfo.total} events
          </div>
        )}
      </div>

      {loading && <div className="text-center text-gray-500">Loading events...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
          {events.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No events found.</div>
          )}
        </div>
      )}
    </div>
  );
}

