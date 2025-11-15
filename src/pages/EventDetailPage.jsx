import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import eventService from '@/services/eventService';
import { Calendar, MapPin, Users, Clock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/stores/useAuthStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      setError('');
      try {
        const eventData = await eventService.getById(id);
        setEvent(eventData);
        setIsRegistered(eventData.isRegistered || false);
      } catch (e) {
        setError(e.message || 'Error loading event');
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      await eventService.register(id);
      setIsRegistered(true);
      setEvent((prev) => ({
        ...prev,
        current_participants: prev.current_participants + 1,
      }));
      toast.success('Successfully registered for event!');
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration? You can register again later if the event is still available.')) {
      return;
    }

    setRegistering(true);
    try {
      await eventService.cancelRegistration(id);
      // Reload event data để lấy isRegistered từ server
      const eventData = await eventService.getById(id);
      setEvent(eventData);
      setIsRegistered(eventData.isRegistered || false);
      toast.success('Registration cancelled successfully. You can register again if you change your mind.');
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to cancel registration');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
        <Link to="/events" className="text-indigo-600">
          ← Back to events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isFull = event.current_participants >= event.max_participants;
  const isPast = new Date() > endDate;
  const canRegister = !isFull && !isPast && (event.status === 'UPCOMING' || event.status === 'ONGOING');

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-indigo-600">
          Homepage
        </Link>
        <span> / </span>
        <Link to="/events" className="hover:text-indigo-600">
          Events
        </Link>
        <span> / </span>
        <span className="text-gray-700">{event.title}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {imgSrc && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={imgSrc}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {event.is_featured && (
                <span className="inline-block mb-2 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                  Featured
                </span>
              )}
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{event.title}</h1>
              <span
                className={`inline-block text-xs font-medium px-3 py-1 rounded ${
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
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="font-medium">Start Date</div>
                <div className="text-sm text-gray-500">
                  {startDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="font-medium">End Date</div>
                <div className="text-sm text-gray-500">
                  {endDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm text-gray-500">{event.location}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="font-medium">Participants</div>
                <div className="text-sm text-gray-500">
                  {event.current_participants} / {event.max_participants} registered
                </div>
              </div>
            </div>

            {event.category && (
              <div className="text-sm text-gray-500">
                Category: <span className="font-medium">{event.category}</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Registration Section */}
          {canRegister && (
            <div className="border-t pt-6">
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">You are registered for this event</span>
                    </div>
                    <button
                      onClick={handleCancelRegistration}
                      disabled={registering}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {registering ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleRegister}
                    disabled={registering || !user}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {registering
                      ? 'Registering...'
                      : !user
                      ? 'Login to Register'
                      : 'Register for Event'}
                  </button>
                </div>
              )}
            </div>
          )}

          {isFull && !isRegistered && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Event is full</span>
              </div>
            </div>
          )}

          {isPast && (
            <div className="border-t pt-6">
              <div className="text-gray-500">This event has ended</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

