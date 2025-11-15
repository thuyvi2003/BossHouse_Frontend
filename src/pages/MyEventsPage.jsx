import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eventService from '@/services/eventService';
import { Calendar, MapPin, Users, Clock, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function EventCard({ registration, onCancel, onReRegister }) {
  // Handle both populated and non-populated event_id
  const event = registration.event_id?._id ? registration.event_id : registration.event_id;
  if (!event || (typeof event === 'object' && !event._id)) return null;

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isPast = new Date() > endDate;
  const isOngoing = new Date() >= startDate && new Date() <= endDate;
  const isCancelled = registration.status === 'CANCELLED';
  const canReRegister = isCancelled && !isPast && (event.status === 'UPCOMING' || event.status === 'ONGOING') && event.current_participants < event.max_participants;

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
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Registered: {new Date(registration.registration_date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-auto pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                event.status === 'UPCOMING'
                  ? 'bg-blue-100 text-blue-800'
                  : event.status === 'ONGOING'
                  ? 'bg-green-100 text-green-800'
                  : event.status === 'COMPLETED'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {event.status}
            </span>
            {isCancelled && (
              <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-800">
                Cancelled
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isPast && registration.status === 'REGISTERED' && (
              <button
                onClick={() => onCancel(event._id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            )}
            {canReRegister && onReRegister && (
              <button
                onClick={() => onReRegister(event._id)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
              >
                Register Again
              </button>
            )}
            <Link
              to={`/events/${event._id}`}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyEventsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadMyEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await eventService.getMyRegistrations();
        setRegistrations(data || []);
      } catch (e) {
        setError(e.message || 'Error loading events');
        toast.error('Failed to load your events');
      } finally {
        setLoading(false);
      }
    };

    loadMyEvents();
  }, [user, navigate]);

  const handleCancel = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration? You can register again later if the event is still available.')) {
      return;
    }

    try {
      await eventService.cancelRegistration(eventId);
      toast.success('Registration cancelled successfully');
      // Reload events
      const data = await eventService.getMyRegistrations();
      setRegistrations(data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to cancel registration');
    }
  };

  const handleReRegister = async (eventId) => {
    try {
      await eventService.register(eventId);
      toast.success('Successfully registered for event again!');
      // Reload events
      const data = await eventService.getMyRegistrations();
      setRegistrations(data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to register for event');
    }
  };

  if (!user) {
    return null;
  }

  const activeRegistrations = registrations.filter((r) => r.status === 'REGISTERED');
  const cancelledRegistrations = registrations.filter((r) => r.status === 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-indigo-700 mb-2">
          My Events
        </h1>
        <p className="text-gray-600">Manage your event registrations</p>
      </div>

      {loading && <div className="text-center text-gray-500 py-8">Loading...</div>}
      {error && <div className="text-center text-red-600 py-8">{error}</div>}

      {!loading && !error && (
        <>
          {/* Active Registrations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Active Registrations ({activeRegistrations.length})
            </h2>
            {activeRegistrations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRegistrations.map((registration) => (
                  <EventCard
                    key={registration._id}
                    registration={registration}
                    onCancel={handleCancel}
                    onReRegister={null}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">You haven't registered for any events yet.</p>
                <Link
                  to="/events"
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Browse Events →
                </Link>
              </div>
            )}
          </div>

          {/* Cancelled Registrations */}
          {cancelledRegistrations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                Cancelled Registrations ({cancelledRegistrations.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cancelledRegistrations.map((registration) => (
                  <EventCard
                    key={registration._id}
                    registration={registration}
                    onCancel={null}
                    onReRegister={handleReRegister}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

