// src/components/ui/Dashboard/Contacts/ContactForm.jsx
import React, { useState, useEffect, useRef } from "react";

// --- Format attachment ---
const formatAttachment = (att) => {
    if (!att) return null;
    let preview = att.preview || null;
    const isImage =
        att.type?.startsWith("image/") ||
        att.contentType?.startsWith("image/") ||
        (att.file && att.file.type?.startsWith("image/"));

    if (!preview) {
        if (att.data) {
            const bytes = att.data instanceof Uint8Array ? att.data : new Uint8Array(att.data);
            let binary = "";
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, chunk);
            }
            preview = `data:${att.contentType};base64,${btoa(binary)}`;
        } else if (att.file && isImage) {
            preview = URL.createObjectURL(att.file);
        }
    }

    return { ...att, type: isImage ? "image" : "file", preview, file: att.file || null };
};

export default function ContactForm({
    contact,
    mode,
    setFormMode,
    viewOnly = false,
    onClose,
    onSubmit,
    currentUserId,
    currentUserRole,
}) {
    const [responses, setResponses] = useState([]);
    const [formDataEdit, setFormDataEdit] = useState({
        name: "",
        email: "",
        phone: "",
        type: "Support",
        status: "Complete",
        message: "",
        attachments: [],
    });
    const [formDataReply, setFormDataReply] = useState({ reply: "", files: [] });
    const scrollRef = useRef();

    const isView = mode === "view";
    const isEdit = mode === "edit";
    const isReply = mode === "reply";
    const isDelete = mode === "delete";

    // --- Load contact data ---
    useEffect(() => {
        if (contact) {
            setResponses(
                (contact.responses || []).map((r) => ({
                    ...r,
                    attachments: (r.attachments || []).map(formatAttachment),
                }))
            );

            if (isEdit) {
                setFormDataEdit({
                    name: contact.name || "",
                    email: contact.email || "",
                    phone: contact.phone || "",
                    type: contact.type || "Support",
                    status: contact.status || "pending",
                    message: contact.message || "",
                    attachments: (contact.attachments || []).map(formatAttachment),
                });
            }
        }
    }, [contact, isEdit]);

    // --- Scroll to bottom for reply ---
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [responses]);

    // --- Handlers ---
    const handleEditChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "attachments") {
            const newAttachments = Array.from(files).map((f) => ({
                file: f,
                name: f.name,
                type: f.type.startsWith("image/") ? "image" : "file",
                preview: URL.createObjectURL(f),
            }));

            setFormDataEdit((prev) => ({ ...prev, attachments: newAttachments }));
        } else {
            setFormDataEdit((prev) => ({ ...prev, [name]: value }));

            // Nếu update status, cập nhật luôn contact để ContactTable reflect ngay
            if (name === "status" && contact) {
                contact.status = value;
            }
        }
    };


    const handleReplyChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "files") setFormDataReply((prev) => ({ ...prev, files: Array.from(files) }));
        else setFormDataReply((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelReply = () => {
        // Giống như Back to List
        if (onBackToList) onBackToList(); // ưu tiên dùng callback từ parent
        else onClose(); // fallback
    };

    const handleSubmit = () => {
        if (isDelete) {
            onSubmit({ delete: true });
            onClose();
            return;
        }

        // ===== Edit mode submit =====
        if (isEdit) {
            const payload = new FormData();

            // Admin/Staff chỉ được cập nhật status
            if (currentUserRole === "admin" || currentUserRole === "staff") {
                payload.append("status", formDataEdit.status);
            } else {
                Object.entries(formDataEdit).forEach(([key, val]) => {
                    if (key === "attachments") {
                        val.forEach((f) => payload.append("attachments", f.file || f));
                    } else {
                        payload.append(key, val);
                    }
                });
            }

            onSubmit(payload);
            onClose();
            return;
        }

        // ===== Reply mode submit =====
        if (isReply) {
            if (!formDataReply.reply.trim() && formDataReply.files.length === 0) {
                alert("Please enter a message or attach a file!");
                return;
            }

            const payload = new FormData();
            if (formDataReply.reply) payload.append("message", formDataReply.reply);
            formDataReply.files.forEach((file) => payload.append("attachments", file));

            onSubmit(payload);

            const newResponse = {
                message: formDataReply.reply,
                attachments: formDataReply.files.map((f) => ({
                    file: f,
                    name: f.name,
                    type: f.type.startsWith("image/") ? "image" : "file",
                    preview: URL.createObjectURL(f),
                })),
                createdAt: new Date().toISOString(),
                createdBy: {
                    _id: currentUserId,
                    role: currentUserRole,
                    name: currentUserRole === "admin" ? "Admin" : "User",
                },
            };
            setResponses((prev) => [...prev, newResponse]);
            setFormDataReply({ reply: "", files: [] });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 space-y-4 overflow-hidden max-h-[90vh]">
                <h2 className="text-xl font-bold text-center">
                    {isView ? "View Contact" : isReply ? "Reply Contact" : isEdit ? "Edit Contact" : "Delete Contact"}
                </h2>

                {/* ===================== Delete Mode ===================== */}
                {isDelete && (
                    <div className="text-center py-6">
                        <p className="text-gray-700 mb-4">Are you sure you want to delete this contact?</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={onClose} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
                            <button onClick={handleSubmit} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Confirm Delete</button>
                        </div>
                    </div>
                )}

                {/* ===================== View / Edit Mode ===================== */}
                {(isView || isEdit) && !isDelete && (
                    <div className="space-y-4">
                        {/* Grid các field cơ bản */}
                        <div className="grid grid-cols-3 gap-3">
                            {["name", "email", "phone", "type"].map((field) => (
                                <div key={field} className="flex flex-col">
                                    <label className="text-sm font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                                    {isEdit ? (
                                        currentUserRole === "admin" || currentUserRole === "staff" ? (
                                            <input
                                                name={field}
                                                type="text"
                                                value={formDataEdit[field]}
                                                className="w-full border rounded px-2 py-1 bg-gray-100"
                                                disabled
                                            />
                                        ) : field === "type" ? (
                                            <select
                                                name={field}
                                                value={formDataEdit[field]}
                                                onChange={handleEditChange}
                                                className="w-full border rounded px-2 py-1 bg-white"
                                            >
                                                {["Support", "Feedback", "Complaint"].map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                name={field}
                                                type="text"
                                                value={formDataEdit[field]}
                                                onChange={handleEditChange}
                                                className="w-full border rounded px-2 py-1 bg-white"
                                            />
                                        )
                                    ) : (
                                        <input className="w-full border rounded px-2 py-1 bg-gray-100" value={contact[field]} disabled />
                                    )}
                                </div>
                            ))}

                            {/* Status */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium">Status:</label>
                                {isEdit ? (
                                    <select
                                        name="status"
                                        value={formDataEdit.status}
                                        onChange={handleEditChange}
                                        className="w-full border rounded px-2 py-1 bg-white"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="complete">Complete</option>
                                    </select>
                                ) : (
                                    <select
                                        value={formDataEdit.status || contact.status}
                                        disabled
                                        className="w-full border rounded px-2 py-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="complete">Complete</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium">Message:</label>
                            {isEdit && (currentUserRole !== "admin" && currentUserRole !== "staff") ? (
                                <textarea
                                    name="message"
                                    value={formDataEdit.message}
                                    onChange={handleEditChange}
                                    className="w-full border rounded px-2 py-1 resize-none bg-white"
                                    rows={3}
                                />
                            ) : (
                                <textarea
                                    value={formDataEdit.message || contact.message}
                                    className="w-full border rounded px-2 py-1 resize-none bg-gray-100"
                                    rows={3}
                                    disabled
                                />
                            )}
                        </div>

                        {/* Attachments */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium">Attachments:</label>

                            {/* Hiển thị ảnh cũ + file */}
                            <div className="flex flex-wrap gap-2 mt-1 mb-2">
                                {(formDataEdit.attachments || []).map((att, i) =>
                                    att.type === "image" && att.preview ? (
                                        <img key={i} src={att.preview} alt={att.name} className="w-24 h-24 object-contain border rounded" />
                                    ) : (
                                        <a key={i} href={att.preview || "#"} download={att.name} className="text-blue-600 underline text-xs">{att.name}</a>
                                    )
                                )}

                                {isView && contact.attachments?.length > 0 && contact.attachments.map((att, i) =>
                                    att.type === "image" && att.preview ? (
                                        <img key={i} src={att.preview} alt={att.name} className="w-24 h-24 object-contain border rounded" />
                                    ) : (
                                        <a key={i} href={att.preview || "#"} download={att.name} className="text-blue-600 underline text-xs">{att.name}</a>
                                    )
                                )}
                            </div>

                            {/* Nếu là User cho upload file */}
                            {currentUserRole !== "admin" && currentUserRole !== "staff" && (
                                <input
                                    type="file"
                                    multiple
                                    name="attachments"
                                    onChange={handleEditChange}
                                    className="w-full border rounded px-2 py-1"
                                />
                            )}
                        </div>
                    </div>
                )}


                {/* ===================== Reply Mode ===================== */}
                {isReply && !isDelete && (
                    <div className="flex flex-col h-[70vh]">
                        {/* --- History --- */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 border rounded bg-gray-50">
                            {responses.map((r, idx) => {
                                const senderRole = r.createdBy?.role;
                                const senderId = r.createdBy?._id;
                                const isCurrentUser = String(senderId) === String(currentUserId);
                                const isAdminSender = senderRole === "admin" || senderRole === "staff";
                                const isUserSender = senderRole === "user";

                                let senderName;
                                if (isCurrentUser) senderName = "You";
                                else if (currentUserRole === "admin" || currentUserRole === "staff")
                                    senderName = isUserSender ? "User" : "Admin";
                                else senderName = isAdminSender ? "Admin" : "User";

                                return (
                                    <div key={idx} className={`flex flex-col ${isAdminSender ? "items-end" : "items-start"}`}>
                                        <div className={`p-3 rounded-lg max-w-[75%] ${isAdminSender ? "bg-green-100 text-gray-800 rounded-br-none"
                                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                                            }`}>
                                            <div className="text-xs opacity-75 mb-1">
                                                {senderName} • {new Date(r.createdAt).toLocaleString()}
                                            </div>
                                            <div className="text-sm whitespace-pre-line">{r.message}</div>
                                            {r.attachments?.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {r.attachments.map((att, i) =>
                                                        att.type === "image" && att.preview ? (
                                                            <img key={i} src={att.preview} alt={att.name} className="w-20 h-20 object-cover rounded border" />
                                                        ) : (
                                                            <a
                                                                key={i}
                                                                href={att.preview || "#"}
                                                                download={att.name}
                                                                className={`text-xs underline ${isAdminSender ? "text-gray-800 hover:text-green-600" : "text-blue-700 hover:text-blue-900"}`}
                                                            >
                                                                {att.name || `Attachment ${i + 1}`}
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- Reply area --- */}
                        <div className="flex flex-col gap-3">
                            <textarea
                                name="reply"
                                value={formDataReply.reply}
                                onChange={handleReplyChange}
                                disabled={viewOnly}
                                className={`w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm resize-none placeholder-gray-400 text-sm ${viewOnly ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-400"
                                    }`}
                                placeholder="Type your reply..."
                                rows={4}
                            />

                            {/* Files */}
                            <div className="flex flex-wrap gap-2">
                                {formDataReply.files?.map((file, idx) => (
                                    <div key={idx} className="relative w-20 h-20">
                                        {file.type.startsWith("image/") ? (
                                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover rounded border" />
                                        ) : (
                                            <a
                                                href={URL.createObjectURL(file)}
                                                download={file.name}
                                                className="text-xs underline text-blue-700 block w-20 h-20 overflow-hidden"
                                            >
                                                {file.name}
                                            </a>
                                        )}
                                        {!viewOnly && (
                                            <button
                                                type="button"
                                                onClick={() => setFormDataReply({
                                                    ...formDataReply,
                                                    files: formDataReply.files.filter((_, i) => i !== idx),
                                                })}
                                                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {!viewOnly && (
                                    <label className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded cursor-pointer text-gray-500 hover:bg-gray-100">
                                        +
                                        <input
                                            type="file"
                                            multiple
                                            name="files"
                                            onChange={handleReplyChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* ===================== Footer Buttons ===================== */}
                {!isDelete && (
                    <div className="flex justify-center gap-3 mt-2"> {/* mt-2 để kéo lên */}
                        {/* ===== View Mode ===== */}
                        {isView && (
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    Back to List
                                </button>
                                {contact.status?.trim().toLowerCase() !== "complete" && (
                                    <button
                                        onClick={() => setFormMode("edit")}
                                        className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ===== Edit Mode ===== */}
                        {isEdit && (
                            <>
                                <button
                                    onClick={onClose}
                                    className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Save Changes
                                </button>
                            </>
                        )}

                        {/* ===== Reply Mode ===== */}
                        {isReply && (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose} // <-- dùng onClose trực tiếp
                                    className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>

                                {!(contact.status?.toLowerCase() === "complete" && contact.responses?.length > 0) && (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Send
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
