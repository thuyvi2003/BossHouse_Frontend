import React, { useEffect, useState, useRef } from "react";
import bookingService from "../../../../services/bookingService";
import { Plus, Minus, Calendar, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingForm({
  initialData,
  mode = "add", // "add" | "edit" | "view"
  options, // { users, pets, vets, services, existingBookings }
  onCancel,
  onSuccess,
  onEditClick,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    customer_id: "",
    pet_id: "",
    services: [],
    veterinarian_id: "",
    bookingDate: new Date(),
    status: "PENDING",
    total_price: 0,
    note: "",
    _id: null,
  });
  const [errors, setErrors] = useState({});
  const [isPastBooking, setIsPastBooking] = useState(false);
  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);

  // Init form
  useEffect(() => {
    const now = new Date();
    if (initialData) {
      const bookingDate = new Date(initialData.booking_date || now);
      setIsPastBooking(bookingDate < now);
      setForm({
        customer_id: initialData.user_id?._id || "",
        pet_id: initialData.pet_id?._id || "",
        services:
          initialData.services?.map((s) => {
            const serviceObj =
              typeof s.service_id === "object" && s.service_id !== null
                ? s.service_id
                : options.services.find((opt) => opt._id === s.service_id);
            return {
              service_id: serviceObj?._id || s.service_id,
              quantity: s.quantity || 1,
              name: serviceObj?.name || "Unknown service",
              base_price: serviceObj?.base_price || 0,
            };
          }) || [],
        veterinarian_id: initialData.veterinarian_id?._id || "",
        bookingDate,
        status: (initialData.status || "PENDING").toUpperCase(),
        total_price: initialData.total_price || 0,
        note: initialData.note || "",
        _id: initialData._id,
      });
    }
  }, [initialData, options.services]);

  // Calculate total price
  useEffect(() => {
    const total = form.services.reduce((sum, s) => {
      const service =
        options.services.find((opt) => opt._id === s.service_id) || s;
      return service ? sum + (service.base_price || 0) * s.quantity : sum;
    }, 0);
    setForm((prev) => ({ ...prev, total_price: total }));
  }, [form.services, options.services]);

  // Add / Remove service
  const handleAddService = (serviceId) => {
    if (isEdit && isPastBooking) return;
    setForm((prev) => {
      const exists = prev.services.find((s) => s.service_id === serviceId);
      if (exists) {
        return {
          ...prev,
          services: prev.services.map((s) =>
            s.service_id === serviceId ? { ...s, quantity: s.quantity + 1 } : s
          ),
        };
      } else {
        const service = options.services.find((opt) => opt._id === serviceId);
        return {
          ...prev,
          services: [
            ...prev.services,
            {
              service_id: serviceId,
              quantity: 1,
              name: service?.name || "",
              base_price: service?.base_price || 0,
            },
          ],
        };
      }
    });
  };

  const handleRemoveService = (serviceId) => {
    if (isEdit && isPastBooking) return;
    setForm((prev) => {
      const exists = prev.services.find((s) => s.service_id === serviceId);
      if (!exists) return prev;
      if (exists.quantity > 1) {
        return {
          ...prev,
          services: prev.services.map((s) =>
            s.service_id === serviceId ? { ...s, quantity: s.quantity - 1 } : s
          ),
        };
      } else {
        return {
          ...prev,
          services: prev.services.filter((s) => s.service_id !== serviceId),
        };
      }
    });
  };

  // Change form field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case "customer_id":
        if (!value) return "Customer is required";
        break;
      case "pet_id":
        if (!value) return "Pet is required";
        break;
      case "services":
        if (!value || value.length === 0)
          return "At least one service is required";
        break;
      case "bookingDate":
        if (!value) return "Date & Time are required";
        const now = new Date();
        if (!isEdit || (isEdit && !isPastBooking)) {
          if (value < now) return "Cannot book in the past";
          const hour = value.getHours();
          if (hour < 8 || hour > 17)
            return "Booking time must be between 08:00-17:00";
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    ["customer_id", "pet_id", "services", "bookingDate"].forEach((f) => {
      const value = form[f];
      const err = validateField(f, value);
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const bookingDateTime = form.bookingDate.toISOString().slice(0, 16);

    const conflict = form.services.some((s) =>
      options.existingBookings?.some(
        (b) =>
          b.services?.some((bs) => bs.service_id === s.service_id) &&
          new Date(b.booking_date).toISOString().slice(0, 16) === bookingDateTime &&
          (mode !== "edit" || b._id !== form._id)
      )
    );

    if (conflict) {
      setErrors({
        services:
          "One or more selected services are already booked at this time.",
      });
      return;
    }

    const payload = {
      user_id: form.customer_id,
      pet_id: form.pet_id,
      services: form.services.map((s) => ({ service_id: s.service_id, quantity: s.quantity })),
      veterinarian_id: form.veterinarian_id || null,
      booking_date: form.bookingDate.toISOString(),
      status: form.status,
      total_price: form.total_price,
      note: form.note,
    };

    try {
      if (mode === "add") await bookingService.create(payload);
      if (mode === "edit" && form._id)
        await bookingService.update(form._id, payload);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      setErrors({ form: err.response?.data?.message || "Failed to save booking" });
    }
  };

  // Dropdown render
  const renderDropdown = (name, label, optionsArr, getLabel, disabled = false) => {
    const bgClass = disabled ? "bg-gray-100" : "";
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${bgClass}`}
        >
          <option value="">Select {label}</option>
          {optionsArr.map((opt) => (
            <option key={opt._id} value={opt._id}>{getLabel(opt)}</option>
          ))}
        </select>
        {errors[name] && <p className="text-red-600 text-xs mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const disableCustomerPet = isView || isEdit;
  const disableOtherFields = isView || (isEdit && isPastBooking);

  // Status options
  let statusOptions = [
    { _id: "PENDING", name: "Pending" },
    { _id: "CONFIRMED", name: "Confirmed" },
    { _id: "COMPLETED", name: "Completed" },
    { _id: "CANCELED", name: "Canceled" },
  ];
  if (isEdit && isPastBooking) {
    statusOptions = [{ _id: "COMPLETED", name: "Completed" }, { _id: "CANCELED", name: "Canceled" }];
  } else if (isEdit && !isPastBooking) {
    const order = ["PENDING", "CONFIRMED", "COMPLETED"];
    statusOptions = statusOptions.filter(o => order.indexOf(o._id) >= order.indexOf(form.status));
  }

  // Helpers for rolling time selector
  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampm = ["AM", "PM"];

  const setHour = (h) => {
    const newDate = new Date(form.bookingDate);
    const currentHour = newDate.getHours();
    const isPM = currentHour >= 12;
    newDate.setHours(isPM ? (h % 12) + 12 : h % 12);
    setForm(prev => ({ ...prev, bookingDate: newDate }));
  };

  const setMinute = (m) => {
    const newDate = new Date(form.bookingDate);
    newDate.setMinutes(m);
    setForm(prev => ({ ...prev, bookingDate: newDate }));
  };

  const setAMPM = (v) => {
    const newDate = new Date(form.bookingDate);
    let h = newDate.getHours();
    if (v === "AM" && h >= 12) h -= 12;
    if (v === "PM" && h < 12) h += 12;
    newDate.setHours(h);
    setForm(prev => ({ ...prev, bookingDate: newDate }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto animate-fade-in">
      <h3 className="text-2xl font-bold text-yellow-800 mb-6">
        {mode === "add" ? "Add Booking" : isEdit ? "Edit Booking" : "View Booking"}
      </h3>

      {errors.form && <div className="text-red-600 mb-4">{errors.form}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Pet */}
        {renderDropdown("customer_id", "Customer", options.users, o => o.name, disableCustomerPet)}
        {renderDropdown("pet_id", "Pet", options.pets, o => (o.name ? `${o.species} - ${o.name}` : o.species), disableCustomerPet)}

        {/* Veterinarian */}
        {renderDropdown("veterinarian_id", "Veterinarian", options.vets, o => `${o.user_id?.name} (${o.specialty})`, disableOtherFields)}

        {/* Services */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Services</label>
          {!isView && !disableOtherFields && (
            <select
              onChange={(e) => { if(e.target.value){ handleAddService(e.target.value); e.target.value=""; } }}
              className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            >
              <option value="">Select a service</option>
              {options.services.map(s => (
                <option key={s._id} value={s._id}>{s.name} - ${s.base_price} - {s.duration_minutes} mins</option>
              ))}
            </select>
          )}
          {errors.services && <p className="text-red-600 text-xs mt-1">{errors.services}</p>}
          {form.services.length === 0 && <div className="p-2 border rounded bg-gray-50">No services selected</div>}
          <div className="flex flex-wrap gap-2 mt-2">
            {form.services.map(s => (
              <div key={s.service_id} className="flex items-center gap-2 px-3 py-1 rounded-full shadow-sm text-yellow-800 bg-yellow-100">
                <span>{s.name} × {s.quantity}</span>
                {!isView && !disableOtherFields && (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleAddService(s.service_id)} className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full"><Plus size={12} /></button>
                    <button type="button" onClick={() => handleRemoveService(s.service_id)} className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"><Minus size={12} /></button>
                  </div>
                )}
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
            {/* Date */}
            <div className="flex flex-col min-w-[150px]">
              {/* <span className="text-xs text-gray-600 mb-1">Date</span> */}
              <div className="relative">
                <DatePicker
                  ref={datePickerRef}
                  selected={form.bookingDate}
                  onChange={(date) => {
                    if (!date) return;
                    setForm(prev => {
                      const newDate = new Date(prev.bookingDate);
                      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                      return { ...prev, bookingDate: newDate };
                    });
                  }}
                  dateFormat="MMMM d, yyyy"
                  disabled={disableOtherFields}
                  className={`w-full border rounded p-2 pl-7 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${disableOtherFields ? "bg-gray-100" : ""}`}
                />
                <Calendar
                  className="absolute left-2 top-2 w-5 h-5 text-gray-500 cursor-pointer"
                  onClick={() => datePickerRef.current && datePickerRef.current.setOpen(true)}
                />
              </div>
            </div>

            {/* Time */}
            <div className="flex flex-col min-w-[180px]">
              {/* <span className="text-xs text-gray-600 mb-1">Time</span> */}
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5 text-gray-500" />
                {/* Hour */}
                <select
                  className="border rounded p-2 w-12"
                  value={form.bookingDate.getHours() % 12 || 12}
                  onChange={(e) => {
                    const h = parseInt(e.target.value);
                    setForm(prev => {
                      const newDate = new Date(prev.bookingDate);
                      const isPM = prev.bookingDate.getHours() >= 12;
                      newDate.setHours(isPM ? (h % 12) + 12 : h % 12);
                      return { ...prev, bookingDate: newDate };
                    });
                  }}
                  disabled={disableOtherFields}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>

                <span className="font-semibold">:</span>

                {/* Minute */}
                <select
                  className="border rounded p-2 w-14"
                  value={form.bookingDate.getMinutes()}
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setForm(prev => {
                      const newDate = new Date(prev.bookingDate);
                      newDate.setMinutes(m);
                      return { ...prev, bookingDate: newDate };
                    });
                  }}
                  disabled={disableOtherFields}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, "0")}</option>
                  ))}
                </select>

                {/* AM/PM */}
                <select
                  className="border rounded p-2 w-16"
                  value={form.bookingDate.getHours() >= 12 ? "PM" : "AM"}
                  onChange={(e) => {
                    const isPM = e.target.value === "PM";
                    setForm(prev => {
                      const newDate = new Date(prev.bookingDate);
                      let h = newDate.getHours();
                      if (isPM && h < 12) h += 12;
                      if (!isPM && h >= 12) h -= 12;
                      newDate.setHours(h);
                      return { ...prev, bookingDate: newDate };
                    });
                  }}
                  disabled={disableOtherFields}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {errors.bookingDate && (
            <p className="text-red-600 text-xs mt-1">{errors.bookingDate}</p>
          )}
        </div>

        {/* Status */}
        {renderDropdown("status", "Status", statusOptions, o => o.name, isView)}

        {/* Total Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Price</label>
          <div className="p-2 border rounded font-semibold text-yellow-800 bg-gray-50">${form.total_price}</div>
        </div>

        {/* Note */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            disabled={disableOtherFields}
            className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${disableOtherFields ? "bg-gray-100" : ""}`}
            placeholder="Optional note..."
          />
        </div>

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex justify-center gap-4 mt-6">
          <button type="button" onClick={onCancel} className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow">{isView ? "Back to List" : "Cancel"}</button>
          {isView && <button type="button" onClick={() => onEditClick && onEditClick(initialData)} className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow">Edit</button>}
          {(mode === "add" || isEdit) && <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">{isEdit ? "Save Changes" : "Save"}</button>}
        </div>
      </form>
    </div>
  );
}
