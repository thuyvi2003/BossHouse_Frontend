// ScheduleForm.jsx
import React, { useState, useEffect, useRef } from "react";
import scheduleService from "../../../../services/scheduleService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock } from "lucide-react";

// Modal wrapper
function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fade-in overflow-auto relative">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
                    onClick={onClose}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}

export default function ScheduleForm({ initialData, mode = "add", options, onCancel, onSuccess, onEditMode }) {
    const [form, setForm] = useState({
        veterinarian_id: "",
        start_time: new Date(),
        end_time: new Date(),
        is_available: true,
    });
    const [errors, setErrors] = useState({});
    const datePickerRef = useRef(null);
    const timePickerRef = useRef(null);

    const readOnly = mode === "view";

    useEffect(() => {
        if (initialData) {
            setForm({
                veterinarian_id: initialData.veterinarian_id?._id || "",
                start_time: initialData.start_time ? new Date(initialData.start_time) : new Date(),
                end_time: initialData.end_time ? new Date(initialData.end_time) : new Date(),
                is_available: initialData.is_available,
            });
        }
        setErrors({});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    // --- Time helpers ---
    const setHour = (key, h) => {
        setForm(prev => {
            const newDate = new Date(prev[key]);
            const isPM = newDate.getHours() >= 12;
            newDate.setHours(isPM ? (h % 12) + 12 : h % 12);
            return { ...prev, [key]: newDate };
        });
    };
    const setMinute = (key, m) => {
        setForm(prev => {
            const newDate = new Date(prev[key]);
            newDate.setMinutes(m);
            return { ...prev, [key]: newDate };
        });
    };
    const setAMPM = (key, v) => {
        setForm(prev => {
            const newDate = new Date(prev[key]);
            let h = newDate.getHours();
            if (v === "AM" && h >= 12) h -= 12;
            if (v === "PM" && h < 12) h += 12;
            newDate.setHours(h);
            return { ...prev, [key]: newDate };
        });
    };

    const validate = () => {
        const newErrors = {};
        const now = new Date();

        // --- Veterinarian ---
        if (!form.veterinarian_id) newErrors.veterinarian_id = "Veterinarian is required";

        // --- Start & End ---
        if (!form.start_time) newErrors.start_time = "Start time is required";
        if (!form.end_time) newErrors.end_time = "End time is required";

        if (form.start_time && form.end_time) {
            if (form.start_time >= form.end_time) newErrors.end_time = "End time must be after start time";

            // Check past
            if (form.start_time < now) newErrors.start_time = "Start time cannot be in the past";

            // Check working hours 8-17
            const startHour = form.start_time.getHours();
            const endHour = form.end_time.getHours();
            if (startHour < 8 || startHour >= 17) newErrors.start_time = "Start time must be 08:00–17:00";
            if (endHour < 8 || endHour > 17) newErrors.end_time = "End time must be 08:00–17:00";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const payload = {
                veterinarian_id: form.veterinarian_id,
                start_time: form.start_time.toISOString(),
                end_time: form.end_time.toISOString(),
                is_available: form.is_available,
            };
            let saved;
            if (mode === "add") saved = await scheduleService.create(payload);
            else saved = await scheduleService.update(initialData._id, payload);
            onSuccess(saved);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error saving schedule");
        }
    };

    const formatDateTime = (date) => date ? date.toLocaleString() : "";

    return (
        <Modal onClose={onCancel}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-center mb-4">
                    {mode === "add" ? "Create Schedule" : mode === "edit" ? "Edit Schedule" : "View Schedule"}
                </h2>

                {/* Veterinarian */}
                <div>
                    <label className="block text-sm font-medium">Veterinarian</label>
                    {readOnly ? (
                        <div className="p-2 border rounded bg-gray-100">
                            {options.vets.find(v => v._id === form.veterinarian_id)?.user_id?.name || "Unknown"}
                        </div>
                    ) : (
                        <>
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
                            {errors.veterinarian_id && <p className="text-red-500 text-xs">{errors.veterinarian_id}</p>}
                        </>
                    )}
                </div>

                {/* Start Time */}
                <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    {readOnly ? (
                        <div className="p-2 border rounded bg-gray-100">{formatDateTime(form.start_time)}</div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <DatePicker
                                selected={form.start_time}
                                onChange={(d) => setForm(prev => ({ ...prev, start_time: d }))}
                                dateFormat="dd-MM-yyyy"
                                className="border rounded p-2"
                            />
                            <Clock className="w-5 h-5 text-gray-500" />
                            <select value={form.start_time.getHours() % 12 || 12} onChange={e => setHour("start_time", parseInt(e.target.value))} className="border rounded p-1 w-12">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            :
                            <select value={form.start_time.getMinutes()} onChange={e => setMinute("start_time", parseInt(e.target.value))} className="border rounded p-1 w-12">
                                {Array.from({ length: 60 }, (_, i) => i).map(m => <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>)}
                            </select>
                            <select value={form.start_time.getHours() >= 12 ? "PM" : "AM"} onChange={e => setAMPM("start_time", e.target.value)} className="border rounded p-1 w-16">
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    )}
                    {errors.start_time && <p className="text-red-500 text-xs">{errors.start_time}</p>}
                </div>

                {/* End Time */}
                <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    {readOnly ? (
                        <div className="p-2 border rounded bg-gray-100">{formatDateTime(form.end_time)}</div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <DatePicker
                                selected={form.end_time}
                                onChange={(d) => setForm(prev => ({ ...prev, end_time: d }))}
                                dateFormat="dd-MM-yyyy"
                                className="border rounded p-2"
                            />
                            <Clock className="w-5 h-5 text-gray-500" />
                            <select value={form.end_time.getHours() % 12 || 12} onChange={e => setHour("end_time", parseInt(e.target.value))} className="border rounded p-1 w-12">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            :
                            <select value={form.end_time.getMinutes()} onChange={e => setMinute("end_time", parseInt(e.target.value))} className="border rounded p-1 w-12">
                                {Array.from({ length: 60 }, (_, i) => i).map(m => <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>)}
                            </select>
                            <select value={form.end_time.getHours() >= 12 ? "PM" : "AM"} onChange={e => setAMPM("end_time", e.target.value)} className="border rounded p-1 w-16">
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    )}
                    {errors.end_time && <p className="text-red-500 text-xs">{errors.end_time}</p>}
                </div>

                {/* Available */}
                <div>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} disabled={readOnly} />
                        Available
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-4 mt-4">
                    {mode === "add" && (
                        <>
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create</button>
                        </>
                    )}
                    {mode === "view" && (
                        <>
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Close</button>
                            <button type="button" onClick={() => onEditMode(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                        </>
                    )}
                    {mode === "edit" && (
                        <>
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Changes</button>
                        </>
                    )}
                </div>
            </form>
        </Modal>
    );
}
