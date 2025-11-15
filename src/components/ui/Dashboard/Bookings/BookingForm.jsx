// BookingForm.jsx
import React, { useEffect, useState, useRef } from "react";
import bookingService from "../../../../services/bookingService";
import { Plus, Minus, Calendar, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Modal component ---
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-yellow-800">{title}</h3>
          <button
            className="text-gray-500 hover:text-red-600 text-2xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// --- BookingForm component ---
export default function BookingForm({
  initialData,
  mode = "add",
  options = { users: [], services: [], vets: [] },
  onCancel,
  onSuccess,
  onEditClick,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    customer_id: "",
    petObj: { name: "", species: "" },
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

  // --- Helper to map services and vets ---
  const mapServicesWithNames = (servicesData) => {
    return servicesData.map((s) => {
      const serviceObj = options.services.find(
        (sv) => String(s.service_id?._id || s.service_id) === String(sv._id)
      );
      return {
        service_id: s.service_id?._id || s.service_id,
        quantity: s.quantity || 1,
        name: serviceObj?.name || "Unknown service",
        base_price: serviceObj?.base_price || 0,
      };
    });
  };

  const mapVetId = (vetId) => {
    const vetObj = options.vets.find((v) => String(v._id) === String(vetId));
    return vetObj ? vetObj._id : "";
  };

  // --- Init form data ---
  useEffect(() => {
    const now = new Date();
    if (initialData) {
      const bookingDate = new Date(initialData.booking_date || now);
      setIsPastBooking(bookingDate < now);

      setForm({
        customer_id: initialData.user_id?._id || initialData.user_id || "",
        petObj: {
          name: initialData.pet_name || "",
          species: initialData.pet_species || "",
        },
        services: initialData.services ? mapServicesWithNames(initialData.services) : [],
        veterinarian_id: mapVetId(initialData.veterinarian_id?._id || initialData.veterinarian_id),
        bookingDate,
        status: (initialData.status || "PENDING").toUpperCase(),
        total_price: initialData.total_price || 0,
        note: initialData.note || "",
        _id: initialData._id,
      });
    } else {
      setForm((prev) => ({
        ...prev,
        customer_id: "",
        petObj: { name: "", species: "" },
        services: [],
        veterinarian_id: "",
        bookingDate: new Date(),
        status: "PENDING",
        total_price: 0,
        note: "",
        _id: null,
      }));
      setIsPastBooking(false);
    }
  }, [initialData, options.services, options.vets]);

  // --- Calculate total price ---
  useEffect(() => {
    const total = (form.services || []).reduce(
      (sum, s) => sum + (s.base_price || 0) * s.quantity,
      0
    );
    setForm((prev) => ({ ...prev, total_price: total }));
  }, [form.services]);

  // --- Add/Remove services ---
  const handleAddService = (serviceId) => {
    if (isEdit && isPastBooking) return;
    const service = options.services.find((s) => String(s._id) === String(serviceId));
    if (!service) return;

    setForm((prev) => {
      const exists = prev.services.find((s) => String(s.service_id) === String(serviceId));
      if (exists) {
        return {
          ...prev,
          services: prev.services.map((s) =>
            String(s.service_id) === String(serviceId)
              ? { ...s, quantity: s.quantity + 1 }
              : s
          ),
        };
      } else {
        return {
          ...prev,
          services: [
            ...prev.services,
            { service_id: serviceId, quantity: 1, name: service.name, base_price: service.base_price },
          ],
        };
      }
    });
  };

  const handleRemoveService = (serviceId) => {
    if (isEdit && isPastBooking) return;
    setForm((prev) => {
      const exists = prev.services.find((s) => String(s.service_id) === String(serviceId));
      if (!exists) return prev;

      if (exists.quantity > 1) {
        return {
          ...prev,
          services: prev.services.map((s) =>
            String(s.service_id) === String(serviceId)
              ? { ...s, quantity: s.quantity - 1 }
              : s
          ),
        };
      } else {
        return {
          ...prev,
          services: prev.services.filter((s) => String(s.service_id) !== String(serviceId)),
        };
      }
    });
  };

  // --- Field change ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pet_name") {
      setForm((prev) => ({ ...prev, petObj: { ...prev.petObj, name: value } }));
      setErrors((prev) => ({ ...prev, pet_name: "" }));
      return;
    }
    if (name === "pet_species") {
      setForm((prev) => ({ ...prev, petObj: { ...prev.petObj, species: value } }));
      setErrors((prev) => ({ ...prev, pet_species: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- Validation ---
  const validateField = (name, value) => {
    switch (name) {
      case "customer_id":
        if (!value) return "Customer is required";
        break;
      case "pet_name":
        if (!value) return "Pet name is required";
        break;
      case "pet_species":
        if (!value) return "Pet species is required";
        break;
      case "services":
        if (!value || value.length === 0) return "At least one service is required";
        break;
      case "bookingDate":
        if (!isView) {
          if (!value) return "Date & Time are required";
          const now = new Date();
          if (!isEdit || (isEdit && !isPastBooking)) {
            if (value < now) return "Cannot book in the past";
            const hour = value.getHours();
            if (hour < 8 || hour > 17) return "Booking time must be between 08:00-17:00";
          }
        }
        break;
      default:
        return null;
    }
    return null;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    ["customer_id", "pet_name", "pet_species", "services", "bookingDate"].forEach((f) => {
      const value =
        f === "pet_name"
          ? form.petObj.name
          : f === "pet_species"
            ? form.petObj.species
            : form[f];
      const err = validateField(f, value);
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      user_id: form.customer_id,
      pet_name: form.petObj.name,
      pet_species: form.petObj.species,
      services: form.services.map((s) => ({ service_id: s.service_id, quantity: s.quantity })),
      veterinarian_id: form.veterinarian_id || null,
      booking_date: form.bookingDate.toISOString(),
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

  // --- Disable logic ---
  const isPastBookingEditable = isEdit && isPastBooking;
  const disableFields = isView || isPastBookingEditable;

  // --- Status options ---
  const allStatus = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"];
  const statusFlow = {
    PENDING: ["CONFIRMED", "CANCELED"],
    CONFIRMED: ["COMPLETED", "CANCELED"],
    COMPLETED: [],
    CANCELED: [],
  };

  let statusOptions = [];
  if (isView) statusOptions = allStatus;
  else if (isPastBookingEditable) statusOptions = [form.status, ...statusFlow[form.status]];
  else statusOptions = allStatus;

  return (
    <Modal
      onClose={onCancel}
      title={mode === "add" ? "Add Booking" : isEdit ? "Edit Booking" : "View Booking"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && <div className="text-red-600">{errors.form}</div>}

        {/* Customer, Pet, Vet */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
              disabled={disableFields}
              className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${disableFields ? "bg-gray-100" : ""}`}
            >
              <option value="">Select Customer</option>
              {options.users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            {errors.customer_id && <p className="text-red-600 text-xs mt-1">{errors.customer_id}</p>}
          </div>

          {/* Pet Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Pet Name</label>
            <input
              type="text"
              name="pet_name"
              value={form.petObj.name}
              onChange={handleChange}
              disabled={disableFields}
              className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${disableFields ? "bg-gray-100" : ""}`}
            />
            {errors.pet_name && <p className="text-red-600 text-xs mt-1">{errors.pet_name}</p>}
          </div>

          {/* Pet Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Pet Species</label>
            <input
              type="text"
              name="pet_species"
              value={form.petObj.species}
              onChange={handleChange}
              disabled={disableFields}
              className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${disableFields ? "bg-gray-100" : ""}`}
            />
            {errors.pet_species && <p className="text-red-600 text-xs mt-1">{errors.pet_species}</p>}
          </div>

          {/* Veterinarian */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Veterinarian</label>
            <select
              name="veterinarian_id"
              value={form.veterinarian_id}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="">Select Vet</option>
              {options.vets.map(v => (
                <option key={v._id} value={v._id}>{v.user_id?.name} ({v.specialty})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
          {!isView && !isPastBookingEditable && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddService(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            >
              <option value="">Select a service</option>
              {options.services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} - ${s.base_price} - {s.duration_minutes} mins
                </option>
              ))}
            </select>
          )}
          {errors.services && <p className="text-red-600 text-xs">{errors.services}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {form.services.length === 0 && (
              <div className="p-2 border rounded bg-gray-50">No services selected</div>
            )}
            {form.services.map((s) => (
              <div
                key={s.service_id}
                className="flex items-center gap-2 px-3 py-1 rounded-full shadow-sm text-yellow-800 bg-yellow-100"
              >
                <span>
                  {s.name} × {s.quantity}
                </span>
                {!isView && !isPastBookingEditable && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddService(s.service_id)}
                      className="w-6 h-6 flex items-center justify-center bg-green-500 text-white rounded-full"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(s.service_id)}
                      className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <DatePicker
                selected={form.bookingDate}
                onChange={(date) => {
                  if (!date) return;
                  setForm((prev) => {
                    const newDate = new Date(prev.bookingDate);
                    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    return { ...prev, bookingDate: newDate };
                  });
                }}
                dateFormat="dd-MM-yyyy"
                disabled={disableFields}
                className={`w-full border rounded p-2 pl-7 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${disableFields ? "bg-gray-100" : ""}`}
              />
              <Calendar
                className="absolute left-2 top-2 w-5 h-5 text-gray-500 cursor-pointer"
                onClick={() => datePickerRef.current && datePickerRef.current.setOpen(true)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <div className="flex items-center gap-1">
              <Clock className="w-5 h-5 text-gray-500" />
              <input
                type="time"
                value={`${form.bookingDate.getHours().toString().padStart(2, "0")}:${form.bookingDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  setForm((prev) => {
                    const newDate = new Date(prev.bookingDate);
                    newDate.setHours(h, m);
                    return { ...prev, bookingDate: newDate };
                  });
                }}
                className={`border rounded p-2 w-32 ${disableFields ? "bg-gray-100" : ""}`}
                disabled={disableFields}
              />
            </div>
            {errors.bookingDate && (
              <p className="text-red-600 text-xs mt-1">{errors.bookingDate}</p>
            )}
          </div>
        </div>

        {/* Status & Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={isView}
              className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${isView ? "bg-gray-100" : ""}`}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Price</label>
            <div className="p-2 border rounded font-semibold text-yellow-800 bg-gray-50">
              ${form.total_price}
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            disabled={disableFields}
            className={`w-full border rounded p-2 focus:ring-2 focus:ring-yellow-600 focus:border-transparent ${disableFields ? "bg-gray-100" : ""}`}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            {isView ? "Back to List" : "Cancel"}
          </button>

          {isView && onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Edit
            </button>
          )}

          {!isView && (
            <button
              type="submit"
              className="px-4 py-2 rounded text-white hover:brightness-110 bg-green-600 hover:bg-green-700"
            >
              {mode === "add" ? "Create Booking" : "Update Booking"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
