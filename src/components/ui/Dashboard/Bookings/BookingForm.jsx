import React, { useEffect, useState } from "react";
import bookingService from "../../../../services/bookingService";
import { Plus, Minus } from "lucide-react";

export default function BookingForm({
  initialData,
  mode = "add",
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
    date: "",
    time: "",
    status: "PENDING",
    total_price: 0,
    note: "",
    _id: null,
  });
  const [errors, setErrors] = useState({});
  const [isPastBooking, setIsPastBooking] = useState(false);

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
            let serviceObj;
            if (typeof s.service_id === "object" && s.service_id !== null) {
              serviceObj = s.service_id;
            } else {
              serviceObj = options.services.find(
                (opt) => opt._id === s.service_id
              );
            }
            return {
              service_id: serviceObj?._id || s.service_id,
              quantity: s.quantity || 1,
              name: serviceObj?.name || "Unknown service",
              base_price: serviceObj?.base_price || 0,
            };
          }) || [],
        veterinarian_id: initialData.veterinarian_id?._id || "",
        date: bookingDate.toISOString().split("T")[0],
        time: bookingDate.toTimeString().slice(0, 5),
        status: (initialData.status || "PENDING").toUpperCase(),
        total_price: initialData.total_price || 0,
        note: initialData.note || "",
        _id: initialData._id,
      });
    } else {
      setForm((f) => ({
        ...f,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
      }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "customer_id":
        if (!value) return "Customer is required";
        break;
      case "pet_id":
        if (!value) return "Pet is required";
        break;
      case "services":
        if (!value || value.length === 0) return "At least one service is required";
        break;
      case "dateTime":
        if (!value) return "Date & Time are required";
        const bookingDateTime = new Date(value);
        const now = new Date();
        if (!isEdit || (isEdit && !isPastBooking)) {
          if (bookingDateTime < now) return "Cannot book in the past";
          const hour = bookingDateTime.getHours();
          if (hour < 8 || hour > 17)
            return "Booking time must be between 08:00-17:00";
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    ["customer_id", "pet_id", "services", "dateTime"].forEach((f) => {
      let value = f === "services" ? form.services : f === "dateTime" ? `${form.date}T${form.time}` : form[f];
      const err = validateField(f, value);
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const bookingDateTime = new Date(`${form.date}T${form.time}:00`).getTime();

    const conflict = form.services.some((s) =>
      options.existingBookings?.some((b) =>
        b.services?.some((bs) => bs.service_id === s.service_id) &&
        new Date(b.booking_date).getTime() === bookingDateTime &&
        (mode !== "edit" || b._id !== form._id)
      )
    );

    if (conflict) {
      setErrors({ services: "One or more selected services are already booked at this time." });
      return;
    }

    const payload = {
      user_id: form.customer_id,
      pet_id: form.pet_id,
      services: form.services.map((s) => ({ service_id: s.service_id, quantity: s.quantity })),
      veterinarian_id: form.veterinarian_id || null,
      booking_date: new Date(`${form.date}T${form.time}:00`).toISOString(),
      status: form.status,
      total_price: form.total_price,
      note: form.note,
    };

    try {
      if (mode === "add") await bookingService.create(payload);
      if (mode === "edit" && form._id) await bookingService.update(form._id, payload);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      setErrors({ form: err.response?.data?.message || "Failed to save booking" });
    }
  };

  const renderDropdown = (name, label, optionsArr, getLabel) => {
    const disabled = isView || (isEdit && isPastBooking && name !== "status");
    const bgClass = disabled ? "bg-gray-100" : "";
    const selected = optionsArr.find((o) => o._id === form[name]);
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

  const fieldBgClass = isView ? "bg-gray-100" : isEdit && isPastBooking ? "bg-gray-100" : "";

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto animate-fade-in">
      <h3 className="text-2xl font-bold text-yellow-800 mb-6">
        {mode === "add" ? "Add Booking" : isEdit ? "Edit Booking" : "View Booking"}
      </h3>

      {errors.form && <div className="text-red-600 mb-4">{errors.form}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderDropdown("customer_id", "Customer", options.users, (o) => o.name)}
        {renderDropdown("pet_id", "Pet", options.pets, (o) => o.name ? `${o.species} - ${o.name}` : o.species)}
        {renderDropdown("veterinarian_id", "Veterinarian", options.vets, (o) => `${o.user_id?.name} (${o.specialty})`)}

        {/* Services */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Services</label>
          {!isView && (
            <select
              onChange={(e) => { if(e.target.value){ handleAddService(e.target.value); e.target.value=""; } }}
              className={`w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${fieldBgClass}`}
              disabled={isView || (isEdit && isPastBooking)}
            >
              <option value="">Select a service</option>
              {options.services.map((s) => (
                <option key={s._id} value={s._id}>{s.name} - ${s.base_price} - {s.duration_minutes} mins</option>
              ))}
            </select>
          )}
          {errors.services && <p className="text-red-600 text-xs mt-1">{errors.services}</p>}

          {form.services.length === 0 && (
            <div className={`p-2 border rounded ${fieldBgClass}`}>No services selected</div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {form.services.map((s) => (
              <div key={s.service_id} className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-sm ${fieldBgClass} text-yellow-800 bg-yellow-100`}>
                <span>{s.name} × {s.quantity}</span>
                {!isView && !(isEdit && isPastBooking) && (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => handleAddService(s.service_id)} className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full"><Plus size={12}/></button>
                    <button type="button" onClick={() => handleRemoveService(s.service_id)} className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"><Minus size={12}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={`${form.date}T${form.time}`}
            onChange={(e) => {
              const [date, time] = e.target.value.split("T");
              setForm((prev) => ({ ...prev, date, time }));
              setErrors((prev) => ({ ...prev, dateTime: "" }));
            }}
            disabled={isView || (isEdit && isPastBooking)}
            className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${fieldBgClass}`}
          />
          {errors.dateTime && <p className="text-red-600 text-xs mt-1">{errors.dateTime}</p>}
        </div>

        {/* Status */}
        {renderDropdown(
          "status",
          "Status",
          [
            { _id: "PENDING", name: "Pending" },
            { _id: "CONFIRMED", name: "Confirmed" },
            { _id: "COMPLETED", name: "Completed" },
            { _id: "CANCELED", name: "Canceled" },
          ],
          (o) => o.name
        )}

        {/* Total Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Price</label>
          <div className={`p-2 border rounded ${fieldBgClass} font-semibold text-yellow-800`}>${form.total_price}</div>
        </div>

        {/* Note */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            disabled={isView || (isEdit && isPastBooking)}
            className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${fieldBgClass}`}
            placeholder="Optional note..."
          />
        </div>

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex justify-center gap-4 mt-6">
          {/* Cancel / Back */}
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow"
          >
            {isView ? "Back to List" : "Cancel"}
          </button>

          {/* Edit button only in View mode */}
          {isView && (
            <button
              type="button"
              onClick={() => onEditClick && onEditClick(initialData)}
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow"
            >
              Edit
            </button>
          )}

          {/* Save / Save Changes */}
          {(mode === "add" || isEdit) && (
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
            >
              {mode === "edit" ? "Save Changes" : "Save"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
