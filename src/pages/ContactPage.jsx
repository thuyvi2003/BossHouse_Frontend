// src/pages/ContactCreate.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PaperPlane, X } from "phosphor-react";
import contactService from "@/services/contactService";
import { useAuthStore } from "@/stores/useAuthStore";

// --- Convert MongoDB buffer -> Base64 ---
const bufferToBase64 = (buffer) => {
  if (!buffer?.data || !buffer.contentType) return null;
  const bytes = new Uint8Array(buffer.data);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return `data:${buffer.contentType};base64,${btoa(binary)}`;
};

// --- Normalize attachment ---
const formatAttachment = (att) => {
  if (!att) return null;
  let preview = att.preview || null;
  const isImage =
    att.contentType?.startsWith("image/") ||
    (att.file && att.file.type?.startsWith("image/"));

  if (!preview) {
    if (att.data) {
      if (Array.isArray(att.data) || att.data instanceof Uint8Array) {
        preview = bufferToBase64(att);
      } else if (typeof att.data === "string") {
        preview = `data:${att.contentType};base64,${att.data}`;
      }
    } else if (att.file && isImage) {
      preview = URL.createObjectURL(att.file);
    }
  }

  return {
    ...att,
    type: isImage ? "image" : "file",
    preview,
    file: att.file || null,
  };
};

// --- Validate fields ---
const validateField = (name, value) => {
  let error = "";
  if (name === "name" && !value?.trim()) error = "Name is required.";
  if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    error = "Invalid email address.";
  if (name === "phone" && value && !/^\d{10,15}$/.test(value))
    error = "Phone must be 10-15 digits.";
  if (name === "message" && !value?.trim()) error = "Message cannot be empty.";
  return error;
};

export default function ContactCreate() {
  const { user } = useAuthStore();
  const [formCreate, setFormCreate] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    type: "Support",
    message: "",
    attachments: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormCreate((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormCreate((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map((file) => ({
      file,
      name: file.name,
      type: file.type.startsWith("image/") ? "image" : "file",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setFormCreate({ ...formCreate, attachments: [...formCreate.attachments, ...newAttachments] });
  };

  const handleRemoveAttachment = (index) => {
    const att = formCreate.attachments[index];
    if (att?.file && att.preview) URL.revokeObjectURL(att.preview);

    const updated = [...formCreate.attachments];
    updated.splice(index, 1);
    setFormCreate({ ...formCreate, attachments: updated });
  };

  const validateForm = () => {
    let hasError = false;
    const newErrors = {};
    ["name", "email", "phone", "message"].forEach((f) => {
      const error = validateField(f, formCreate[f]);
      if (error) hasError = true;
      newErrors[f] = error;
    });
    setErrors(newErrors);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = new FormData();
      payload.append("name", formCreate.name);
      payload.append("email", formCreate.email);
      payload.append("phone", formCreate.phone);
      payload.append("type", formCreate.type);
      payload.append("message", formCreate.message);
      formCreate.attachments.forEach((att) => att.file && payload.append("attachments", att.file));

      await contactService.create(payload);
      toast.success("Your message has been sent!");
      setFormCreate({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        type: "Support",
        message: "",
        attachments: [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message.");
    }
  };

  const renderAttachments = (attachments, editable = true) => {
    return (
      <div className="flex flex-wrap gap-2 border-2 border-dashed border-gray-300 p-4 rounded relative">
        {attachments.map((att, idx) => (
          <div key={idx} className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border rounded overflow-hidden shadow-sm">
            {att.type === "image" && att.preview ? (
              <img src={att.preview} alt={att.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <a href={att.preview || "#"} download={att.name} className="text-blue-600 underline text-xs text-center px-1 break-all">{att.name}</a>
            )}
            {editable && (
              <button type="button" onClick={() => handleRemoveAttachment(idx)} className="absolute top-0 right-0 bg-white rounded-full p-1 text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        {editable && (
          <label className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center border border-gray-300 rounded cursor-pointer hover:border-blue-400 text-2xl font-bold">
            +
            <input type="file" multiple accept="image/*,application/pdf" onChange={handleAddFiles} className="hidden" />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-md mt-4 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-xl shadow-sm bg-gray-50" autoComplete="off">
        <div className="grid sm:grid-cols-2 gap-3">
          {["name", "email", "phone"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm font-medium mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formCreate[field]}
                onChange={handleChange}
                placeholder={`Your ${field}`}
                className={`border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors[field] ? "border-red-500" : ""}`}
              />
              {errors[field] && <span className="text-red-500 text-xs mt-1">{errors[field]}</span>}
            </div>
          ))}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Type</label>
            <select name="type" value={formCreate.type} onChange={handleChange} className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="Support">Support</option>
              <option value="Feedback">Feedback</option>
              <option value="Complaint">Complaint</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Message</label>
          <textarea name="message" value={formCreate.message} onChange={handleChange} placeholder="Message" rows={3} className={`w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.message ? "border-red-500" : ""}`} />
          {errors.message && <span className="text-red-500 text-xs mt-1">{errors.message}</span>}
        </div>

        {/* Attachments */}
        <div className="flex flex-wrap gap-2">
          {formCreate.attachments.map((att, idx) => (
            <div key={idx} className="relative w-20 h-20 flex items-center justify-center border rounded overflow-hidden shadow-sm">
              {att.type === "image" && att.preview ? (
                <img src={att.preview} alt={att.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <a href={att.preview || "#"} download={att.name} className="text-blue-600 underline text-xs text-center px-1 break-all">{att.name}</a>
              )}
              <button type="button" onClick={() => handleRemoveAttachment(idx)} className="absolute top-0 right-0 bg-white rounded-full p-1 text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded cursor-pointer hover:border-blue-400 text-xl font-bold">
            +
            <input type="file" multiple accept="image/*,application/pdf" onChange={handleAddFiles} className="hidden" />
          </label>
        </div>

        <button type="submit" className="w-full flex justify-center items-center gap-2 bg-black text-white py-2 rounded hover:bg-gray-800">
          <PaperPlane size={16} /> Send
        </button>
      </form>
    </div>
  );
}
