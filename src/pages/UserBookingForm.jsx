// src/pages/UserBookingForm.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock } from "lucide-react";
import bookingService from "../services/bookingService";
import optionService from "../services/optionService";
import { toast } from "react-toastify";

export default function UserBookingForm({ onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedServiceFromState = location.state?.selectedService || null;
  const datePickerRef = useRef(null);

  const [form, setForm] = useState({
    user_id: "",
    pet_id: "",
    name: "",
    email: "",
    phone: "",
    pet_name: "",
    pet_species: "",
    pet_species_other: "",
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

  useEffect(() => {
    const fetchUserAndOptions = async () => {
      try {
        const data = await optionService.getAllOptions();
        const currentUser = await optionService.getCurrentUser();

        setOptions(data);

        if (currentUser) {
          setForm((prev) => {
            const userPets = data.pets.filter(
              (p) => p.user_id === currentUser._id
            );
            return {
              ...prev,
              user_id: currentUser._id,
              name: currentUser.name || "",
              email: currentUser.email || "",
              phone: currentUser.phone || "",
              pet_id: userPets[0]?._id || "",
              pet_name: userPets[0]?.name || "",
              pet_species: userPets[0]?.species?._id || "",
              pet_species_other: "",
            };
          });
        }
      } catch (err) {
        console.error("Error loading user/options:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndOptions();
  }, []);

  // allSpecies: array of {id, name}
  const allSpecies = useMemo(() => {
    const speciesMap = {};
    options.pets.forEach((p) => {
      if (p.species && p.species._id && p.species.name) {
        speciesMap[p.species._id] = p.species.name;
      }
    });
    return Object.entries(speciesMap).map(([id, name]) => ({ id, name }));
  }, [options.pets]);

  const totalPrice = useMemo(
    () =>
      form.services.reduce(
        (sum, s) => sum + (s.base_price || 0) * s.quantity,
        0
      ),
    [form.services]
  );

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
      return { ...prev, services: [...prev.services, { ...serviceObj, quantity: 1 }] };
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

  const validateBookingDate = (date) => {
    if (!date) return "Date & Time are required";
    const now = new Date();
    if (date < now) return "Cannot book in the past";
    const hour = date.getHours();
    if (hour < 8 || hour > 17) return "Booking time must be between 08:00-17:00";
    return null;
  };

  // --- handleSubmit trong UserBookingForm.jsx ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.user_id) {
      if (!form.name) newErrors.name = "Name is required";
      if (!form.email) newErrors.email = "Email is required";
    }

    if (!form.pet_name) newErrors.pet_name = "Pet name is required";

    if (!form.pet_species) {
      newErrors.pet_species = "Species is required";
    } else if (form.pet_species === "other" && !form.pet_species_other) {
      newErrors.pet_species = "Please specify species";
    }

    if (!form.services.length) newErrors.services = "Select at least one service";

    const bookingDateError = validateBookingDate(form.bookingDate);
    if (bookingDateError) newErrors.bookingDate = bookingDateError;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      const userId = form.user_id;
      let petId = form.pet_id;

      let petNameToSend = form.pet_name;
      let petSpeciesToSend =
        form.pet_species === "other"
          ? form.pet_species_other
          : allSpecies.find((s) => s.id === form.pet_species)?.name || form.pet_species;

      // Nếu pet chưa tồn tại, tạo mới
      if (!petId) {
        const newPet = await optionService.createPet({
          user_id: userId,
          name: petNameToSend,
          species: petSpeciesToSend,
        });
        petId = newPet._id;
      }

      const payload = {
        user_id: userId,
        pet_id: petId,
        pet_name: petNameToSend,       // <--- gửi thêm
        pet_species: petSpeciesToSend, // <--- gửi thêm
        services: form.services.map((s) => ({
          service_id: s._id,
          quantity: s.quantity,
        })),
        booking_date: form.bookingDate.toISOString(),
        total_price: totalPrice,
        note: form.note,
      };

      await bookingService.create(payload);
      toast.success("Booking created successfully!");
      onSuccess && onSuccess();
      navigate("/");
    } catch (err) {
      console.error("Booking creation failed:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to create booking";
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    }
  };


  if (loading) return <p>Loading options...</p>;

  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const getIsPM = () => form.bookingDate.getHours() >= 12;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-yellow-800 mb-4">Book Service</h2>
      {errors.form && <p className="text-red-600 mb-2">{errors.form}</p>}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={form.user_id ? undefined : handleChange}
            readOnly={!!form.user_id}
            placeholder="Enter your name"
            className={`w-full border rounded p-2 ${form.user_id ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={form.user_id ? undefined : handleChange}
            readOnly={!!form.user_id}
            placeholder="Enter your email"
            className={`w-full border rounded p-2 ${form.user_id ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          />
        </div>

        {/* Pet Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pet Name</label>
          <input
            type="text"
            name="pet_name"
            value={form.pet_name}
            onChange={handleChange}
            placeholder="Enter pet name"
            className="w-full border rounded p-2"
          />
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Species</label>
          <select
            name="pet_species"
            value={form.pet_species || ""}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => ({
                ...prev,
                pet_species: value,
                pet_species_other: value === "other" ? prev.pet_species_other : "",
              }));
              setErrors((prev) => ({ ...prev, pet_species: "" }));
            }}
            className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
          >
            <option value="">Select species</option>
            {allSpecies.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            <option value="other">Other</option>
          </select>

          {form.pet_species === "other" && (
            <input
              type="text"
              name="pet_species_other"
              value={form.pet_species_other}
              onChange={handleChange}
              placeholder="Enter species"
              className="w-full border rounded p-2 mt-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
          )}
          {errors.pet_species && <p className="text-red-600 text-xs mt-1">{errors.pet_species}</p>}
        </div>

        {/* Services */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <select
            className="w-full border rounded p-2 mb-3"
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
          {errors.services && <p className="text-red-600 text-xs mt-1">{errors.services}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {form.services.map((s) => (
              <div key={s._id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                <span>{s.name} × {s.quantity}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => handleAddService(s._id)} className="w-6 h-6 bg-green-500 text-white rounded-full">+</button>
                  <button type="button" onClick={() => handleRemoveService(s._id)} className="w-6 h-6 bg-red-500 text-white rounded-full">-</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
          <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
            <div className="relative min-w-[150px]">
              <DatePicker
                ref={datePickerRef}
                selected={form.bookingDate}
                onChange={(date) =>
                  date &&
                  setForm((prev) => {
                    const newDate = new Date(prev.bookingDate);
                    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    return { ...prev, bookingDate: newDate };
                  })
                }
                dateFormat="dd-MM-yyyy"
                className="w-full border rounded p-2 pl-7"
              />
              <Calendar
                className="absolute left-2 top-2 w-5 h-5 text-gray-500 cursor-pointer"
                onClick={() => datePickerRef.current && datePickerRef.current.setOpen(true)}
              />
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-5 h-5 text-gray-500" />
              <select
                className="border rounded p-2 w-14"
                value={form.bookingDate.getHours() % 12 || 12}
                onChange={(e) => {
                  const h = parseInt(e.target.value);
                  setForm((prev) => {
                    const newDate = new Date(prev.bookingDate);
                    const pm = getIsPM();
                    newDate.setHours(pm ? (h % 12) + 12 : h % 12);
                    return { ...prev, bookingDate: newDate };
                  });
                }}
              >
                {hours12.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="font-semibold">:</span>
              <select
                className="border rounded p-2 w-14"
                value={form.bookingDate.getMinutes()}
                onChange={(e) =>
                  setForm((prev) => {
                    const newDate = new Date(prev.bookingDate);
                    newDate.setMinutes(parseInt(e.target.value));
                    return { ...prev, bookingDate: newDate };
                  })
                }
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <select
                className="border rounded p-2 w-16"
                value={getIsPM() ? "PM" : "AM"}
                onChange={(e) => {
                  const pm = e.target.value === "PM";
                  setForm((prev) => {
                    const newDate = new Date(prev.bookingDate);
                    let h = newDate.getHours();
                    if (pm && h < 12) h += 12;
                    if (!pm && h >= 12) h -= 12;
                    newDate.setHours(h);
                    return { ...prev, bookingDate: newDate };
                  });
                }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          {errors.bookingDate && <p className="text-red-600 text-xs mt-1">{errors.bookingDate}</p>}
        </div>

        {/* Note */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Optional note..."
          />
        </div>

        {/* Total */}
        <div className="col-span-1 md:col-span-2 font-semibold text-yellow-800">
          Total Price: ${totalPrice}
        </div>

        {/* Submit */}
        <div className="col-span-1 md:col-span-2 flex justify-center gap-4 mt-4">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 bg-gray-400 text-white rounded-lg">Cancel</button>
          <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg">Book</button>
        </div>
      </form>
    </div>
  );
}
