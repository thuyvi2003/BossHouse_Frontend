// src/pages/UserBookingForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock } from "lucide-react";
import bookingService from "../services/bookingService";
import optionService from "../services/optionService";

export default function UserBookingForm({ onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedServiceFromState = location.state?.selectedService || null;
  const datePickerRef = useRef(null);

  const [form, setForm] = useState({
    user_id: "", // <-- backend requires this
    pet_id: "", // <-- backend requires this
    name: "",
    email: "",
    phone: "",
    pet_name: "",
    pet_species: "",
    services: selectedServiceFromState
      ? [{ ...selectedServiceFromState, quantity: 1 }]
      : [],
    bookingDate: new Date(),
    total_price: 0,
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [options, setOptions] = useState({
    users: [],
    pets: [],
    services: [],
    vets: [],
  });
  const [loading, setLoading] = useState(true);

  // Load all options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await optionService.getAllOptions();
        setOptions(data);

        // Tự động điền user & pet (lấy cái đầu tiên trong DB cho test)
        if (data.users.length) {
          setForm((prev) => ({
            ...prev,
            user_id: data.users[0]._id,
            name: data.users[0].name,
            email: data.users[0].email || "test@example.com",
            phone: data.users[0].phone || "0123456789",
          }));
        }
        if (data.pets.length) {
          setForm((prev) => ({
            ...prev,
            pet_id: data.pets[0]._id,
            pet_name: data.pets[0].name,
            pet_species: data.pets[0].species,
          }));
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const allSpecies = Array.from(new Set(options.pets.map((p) => p.species)));

  // Tính tổng giá
  useEffect(() => {
    const total = form.services.reduce(
      (sum, s) => sum + (s.base_price || 0) * s.quantity,
      0
    );
    setForm((prev) => ({ ...prev, total_price: total }));
  }, [form.services]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddService = (serviceId) => {
    const serviceObj = options.services.find((s) => s._id === serviceId);
    if (!serviceObj) return;
    setForm((prev) => {
      const exists = prev.services.find((s) => s._id === serviceId);
      if (exists) {
        return {
          ...prev,
          services: prev.services.map((s) =>
            s._id === serviceId ? { ...s, quantity: s.quantity + 1 } : s
          ),
        };
      }
      return {
        ...prev,
        services: [...prev.services, { ...serviceObj, quantity: 1 }],
      };
    });
  };

  const handleRemoveService = (serviceId) => {
    setForm((prev) => {
      const exists = prev.services.find((s) => s._id === serviceId);
      if (!exists) return prev;
      if (exists.quantity > 1) {
        return {
          ...prev,
          services: prev.services.map((s) =>
            s._id === serviceId ? { ...s, quantity: s.quantity - 1 } : s
          ),
        };
      } else {
        return {
          ...prev,
          services: prev.services.filter((s) => s._id !== serviceId),
        };
      }
    });
  };

  // --- Validation for booking date ---
  const validateBookingDate = (date) => {
    if (!date) return "Date & Time are required";
    const now = new Date();
    if (date < now) return "Cannot book in the past";
    const hour = date.getHours();
    if (hour < 8 || hour > 17)
      return "Booking time must be between 08:00-17:00";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.user_id) newErrors.name = "User is required";
    if (!form.pet_id) newErrors.pet_name = "Pet is required";
    if (!form.services.length)
      newErrors.services = "Select at least one service";

    const bookingDateError = validateBookingDate(form.bookingDate);
    if (bookingDateError) newErrors.bookingDate = bookingDateError;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      user_id: form.user_id,
      pet_id: form.pet_id,
      services: form.services.map((s) => ({
        service_id: s._id,
        quantity: s.quantity,
      })),
      booking_date: form.bookingDate.toISOString(),
      total_price: form.total_price,
      note: form.note,
    };

    try {
      await bookingService.create(payload);
      onSuccess && onSuccess();
      navigate("/");
    } catch (err) {
      console.error(err);
      setErrors({
        form: err.response?.data?.message || "Failed to create booking",
      });
    }
  };

  if (loading) return <p>Loading options...</p>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">
          Book Service
        </h2>
        {errors.form && <p className="text-red-600 mb-2">{errors.form}</p>}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              readOnly
              className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              readOnly
              className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Pet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pet Name
            </label>
            <input
              type="text"
              name="pet_name"
              value={form.pet_name}
              readOnly
              className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Species
            </label>
            <select
              name="pet_species"
              value={form.pet_species}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            >
              <option value="">Select species</option>
              {allSpecies.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.pet_species && (
              <p className="text-red-600 text-xs mt-1">{errors.pet_species}</p>
            )}
          </div>

          {/* Services */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Services
            </label>
            <select
              className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              onChange={(e) => {
                if (e.target.value) handleAddService(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Select a service</option>
              {options.services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} - ${s.base_price}
                </option>
              ))}
            </select>
            {errors.services && (
              <p className="text-red-600 text-xs mt-1">{errors.services}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {form.services.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full shadow-sm text-yellow-800 bg-yellow-100"
                >
                  <span>
                    {s.name} × {s.quantity}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddService(s._id)}
                      className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(s._id)}
                      className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
              <div className="flex flex-col min-w-[150px] relative">
                <DatePicker
                  ref={datePickerRef}
                  selected={form.bookingDate}
                  onChange={(date) => {
                    if (!date) return;
                    setForm((prev) => {
                      const newDate = new Date(prev.bookingDate);
                      newDate.setFullYear(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                      );
                      return { ...prev, bookingDate: newDate };
                    });
                  }}
                  dateFormat="MMMM d, yyyy"
                  className="w-full border rounded p-2 pl-7 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                />
                <Calendar
                  className="absolute left-2 top-2 w-5 h-5 text-gray-500 cursor-pointer"
                  onClick={() =>
                    datePickerRef.current && datePickerRef.current.setOpen(true)
                  }
                />
              </div>

              <div className="flex flex-col min-w-[180px]">
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5 text-gray-500" />
                  {/* Hour */}
                  <select
                    className="border rounded p-2 w-14"
                    value={form.bookingDate.getHours() % 12 || 12}
                    onChange={(e) => {
                      const h = parseInt(e.target.value);
                      setForm((prev) => {
                        const newDate = new Date(prev.bookingDate);
                        const isPM = prev.bookingDate.getHours() >= 12;
                        newDate.setHours(isPM ? (h % 12) + 12 : h % 12);
                        return { ...prev, bookingDate: newDate };
                      });
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <span className="font-semibold">:</span>

                  {/* Minute */}
                  <select
                    className="border rounded p-2 w-14"
                    value={form.bookingDate.getMinutes()}
                    onChange={(e) => {
                      const m = parseInt(e.target.value);
                      setForm((prev) => {
                        const newDate = new Date(prev.bookingDate);
                        newDate.setMinutes(m);
                        return { ...prev, bookingDate: newDate };
                      });
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>

                  {/* AM/PM */}
                  <select
                    className="border rounded p-2 w-16"
                    value={form.bookingDate.getHours() >= 12 ? "PM" : "AM"}
                    onChange={(e) => {
                      const isPM = e.target.value === "PM";
                      setForm((prev) => {
                        const newDate = new Date(prev.bookingDate);
                        let h = newDate.getHours();
                        if (isPM && h < 12) h += 12;
                        if (!isPM && h >= 12) h -= 12;
                        newDate.setHours(h);
                        return { ...prev, bookingDate: newDate };
                      });
                    }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {errors.bookingDate && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.bookingDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Note
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
              placeholder="Optional note..."
            />
          </div>

          {/* Total */}
          <div className="col-span-1 md:col-span-2 font-semibold text-yellow-800">
            Total Price: ${form.total_price}
          </div>

          {/* Submit & Cancel */}
          <div className="col-span-1 md:col-span-2 flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
            >
              Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
