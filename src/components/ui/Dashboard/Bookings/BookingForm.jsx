import React, { useEffect, useState } from "react";
import bookingService from "../../../../services/bookingService";

export default function BookingForm({
  initialData,
  mode = "add", // "add" | "edit" | "view"
  options, // { users, pets, services, vets }
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
  const [error, setError] = useState("");

  // Load initial data
  useEffect(() => {
    const now = new Date();

    if (initialData) {
      const bookingDate = new Date(initialData.booking_date || now);
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

  // Auto calculate total_price
  useEffect(() => {
    const total = form.services.reduce((sum, s) => {
      const service =
        options.services.find((opt) => opt._id === s.service_id) || s;
      return service ? sum + (service.base_price || 0) * s.quantity : sum;
    }, 0);
    setForm((prev) => ({ ...prev, total_price: total }));
  }, [form.services, options.services]);

  // Handlers
  const handleAddService = (serviceId) => {
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
  };

  const validate = () => {
    if (!form.customer_id) return "Customer is required";
    if (!form.pet_id) return "Pet is required";
    if (!form.services.length) return "At least one service is required";
    if (!form.date || !form.time) return "Date and Time are required";

    const bookingDateTime = new Date(`${form.date}T${form.time}:00`);
    if (bookingDateTime < new Date()) return "Cannot book in the past";

    const hour = bookingDateTime.getHours();
    if (hour < 8 || hour > 17)
      return "Booking time must be between 08:00-17:00";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    const payload = {
      user_id: form.customer_id,
      pet_id: form.pet_id,
      services: form.services.map((s) => ({
        service_id: s.service_id,
        quantity: s.quantity,
      })),
      veterinarian_id: form.veterinarian_id || null,
      booking_date: new Date(`${form.date}T${form.time}:00`).toISOString(),
      status: form.status,
      total_price: form.total_price,
      note: form.note,
    };

    try {
      let response;
      if (mode === "add") response = await bookingService.create(payload);
      if (mode === "edit" && form._id)
        response = await bookingService.update(form._id, payload);

      onSuccess && onSuccess(response); // gửi dữ liệu về BookingManager
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save booking");
    }
  };

  const renderDropdown = (name, label, optionsArr, getLabel) => {
    if (isView && name !== "status") {
      const selected = optionsArr.find((o) => o._id === form[name]);
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <div className="p-2 border rounded bg-gray-100">
            {selected ? getLabel(selected) : "-"}
          </div>
        </div>
      );
    }

    const disabled = isEdit && name !== "status";

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <select
          name={name}
          value={form[name]}
          onChange={handleChange}
          className="w-full border rounded p-2"
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {optionsArr.map((opt) => (
            <option key={opt._id} value={opt._id}>
              {getLabel(opt)}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-yellow-800 mb-4 text-left">
        {mode === "add" ? "Add Booking" : isEdit ? "Edit Booking" : "View Booking"}
      </h3>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderDropdown("customer_id", "Customer", options.users, (o) => o.name)}
        {renderDropdown("pet_id", "Pet", options.pets, (o) =>
          o.name ? `${o.species} - ${o.name}` : o.species
        )}
        {renderDropdown(
          "veterinarian_id",
          "Veterinarian",
          options.vets,
          (o) => `${o.user_id?.name} (${o.specialty})`
        )}

        {/* Services */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Services</label>
          {!isView && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddService(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full border rounded p-2 mb-2"
            >
              <option value="">Select a service</option>
              {options.services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} - ${s.base_price} - {s.duration_minutes} mins
                </option>
              ))}
            </select>
          )}

          {form.services.length === 0 && (
            <div className="p-2 border rounded bg-gray-100">No services selected</div>
          )}

          {form.services.map((s) => {
            const service = options.services.find((opt) => opt._id === s.service_id) || s;
            return (
              <div
                key={s.service_id}
                className="flex justify-between items-center p-2 border rounded mb-2 bg-gray-50"
              >
                <div>
                  {service?.name
                    ? `${service.name} ($${service.base_price}) × ${s.quantity}`
                    : `Service not found × ${s.quantity}`}
                </div>
                {!isView && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddService(s.service_id)}
                      className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full text-lg font-bold shadow"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(s.service_id)}
                      className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full text-lg font-bold shadow"
                    >
                      −
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          {isView ? (
            <div className="p-2 border rounded bg-gray-100">{form.date}</div>
          ) : (
            <input
              type="date"
              name="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={handleChange}
              className="w-full border rounded p-2"
              disabled={isEdit}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          {isView ? (
            <div className="p-2 border rounded bg-gray-100">{form.time}</div>
          ) : (
            <input
              type="time"
              name="time"
              value={form.time}
              min="08:00"
              max="17:00"
              onChange={handleChange}
              className="w-full border rounded p-2"
              disabled={isEdit}
            />
          )}
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
          <div className="p-2 border rounded bg-gray-100">{form.total_price || "-"}</div>
        </div>

        {/* Note */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Note</label>
          {isView ? (
            <div className="p-2 border rounded bg-gray-100">{form.note || "-"}</div>
          ) : (
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Optional note..."
              disabled={isEdit}
            />
          )}
        </div>

        {/* Buttons */}
        <div className="col-span-1 md:col-span-2 flex justify-center gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
          >
            {isView ? "Back to List" : "Cancel"}
          </button>

          {isView && (
            <button
              type="button"
              onClick={() => onEditClick && onEditClick(initialData)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              Edit
            </button>
          )}

          {(mode === "edit" || mode === "add") && (
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              {mode === "edit" ? "Save Changes" : "Save"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
