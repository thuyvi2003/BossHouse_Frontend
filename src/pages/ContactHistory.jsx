// src/pages/ContactHistory.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import * as PhosphorIcons from "phosphor-react";
import contactService from "../services/contactService";
import { useAuthStore } from "@/stores/useAuthStore";
import Pagination from "../components/Layout/Pagination";

const { X, PencilSimple, Eye, PaperPlane, Funnel, MagnifyingGlass } = PhosphorIcons;

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

export default function ContactHistory() {
    const { user } = useAuthStore();
    const [contacts, setContacts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 4;

    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterType, setFilterType] = useState("");

    // --- Modal State ---
    const [showFormModal, setShowFormModal] = useState(false);
    const [formModal, setFormModal] = useState({
        name: "",
        email: "",
        phone: "",
        type: "Support",
        message: "",
        attachments: [],
        contactId: null,
        isReply: false,
        status: "",
        responses: [],
    });
    const [modalMode, setModalMode] = useState("view"); // "view" | "edit" | "reply"

    // --- Reply state ---
    const [formDataReply, setFormDataReply] = useState({ reply: "", files: [] });
    const scrollRef = useRef(null);

    const fetchContacts = async () => {
        try {
            const data = await contactService.getAll();
            const formatted = data.map((c) => ({
                ...c,
                attachments: c.attachments?.map(formatAttachment) || [],
                responses: c.responses?.map((r) => ({
                    ...r,
                    attachments: r.attachments?.map(formatAttachment) || [],
                })),
            }));
            setContacts(formatted);
        } catch (err) {
            console.error(err);
            toast.error("Cannot load contact history.");
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // --- Filter & Search ---
    const filteredContacts = contacts
        .filter((c) =>
            searchText ? c.message?.toLowerCase().includes(searchText.toLowerCase()) : true
        )
        .filter((c) =>
            filterStatus === "ALL" ? true : c.status?.toUpperCase() === filterStatus.toUpperCase()
        )
        .filter((c) => (filterType ? c.type === filterType : true));

    const totalPages = Math.ceil(filteredContacts.length / rowsPerPage);
    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);

    const openModal = (item, mode = "view") => {
        setFormModal({
            name: mode === "reply" ? user?.name || "" : item.name || "",
            email: mode === "reply" ? user?.email || "" : item.email || "",
            phone: mode === "reply" ? user?.phone || "" : item.phone || "",
            type: item.type,
            message: mode === "reply" ? "" : item.message,
            attachments: item.attachments || [],
            contactId: item._id,
            status: item.status,
            responses: item.responses || [],
        });
        setFormDataReply({ reply: "", files: [] });
        setModalMode(mode);
        setShowFormModal(true);

        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleView = (item) => openModal(item, "view");
    const handleEdit = (item) => openModal(item, "edit");
    const handleReply = (item) => openModal(item, "reply");

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, "0")}-${String(
            d.getMonth() + 1
        ).padStart(2, "0")}-${d.getFullYear()} ${String(d.getHours()).padStart(
            2,
            "0"
        )}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    // --- View/Edit Submit handler ---
    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("name", formModal.name);
            formData.append("email", formModal.email);
            formData.append("phone", formModal.phone);
            formData.append("type", formModal.type);
            formData.append("status", formModal.status);
            formData.append("message", formModal.message);

            formModal.attachments.forEach((att) => {
                if (att.file) {
                    formData.append("attachments", att.file);
                }
            });

            await contactService.update(formModal.contactId, formData);
            toast.success("Updated successfully!");
            setShowFormModal(false);
            fetchContacts();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update contact");
        }
    };

    // --- Reply handlers ---
    const handleReplyChange = (e) => {
        if (e.target.name === "reply") {
            setFormDataReply({ ...formDataReply, reply: e.target.value });
        } else if (e.target.name === "files") {
            setFormDataReply({ ...formDataReply, files: Array.from(e.target.files) });
        }
    };

    const handleSubmitReply = async () => {
        if (!formDataReply.reply.trim() && formDataReply.files.length === 0) {
            toast.error("Cannot send empty reply");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("message", formDataReply.reply);
            formDataReply.files.forEach((file) => formData.append("attachments", file));

            await contactService.reply(formModal.contactId, formData);

            toast.success("Reply sent!");
            setShowFormModal(false);
            fetchContacts();
        } catch (err) {
            console.error(err);
            toast.error("Failed to send reply");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-yellow-800">Contact History</h2>

            {/* --- Search & Filter --- */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search message..."
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                </div>

                {/* Type Filter */}
                <div className="relative">
                    <Funnel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent bg-white"
                    >
                        <option value="">All Types</option>
                        {[...new Set(contacts.map(c => c.type))].map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="relative w-48">
                    <Funnel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                    >
                        <option value="ALL">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Complete">Complete</option>
                    </select>
                </div>
            </div>

            {/* --- Table --- */}
            <div className="overflow-x-auto">
                <table className="w-full border rounded text-sm">
                    <thead className="bg-yellow-100">
                        <tr className="text-left">
                            <th className="w-10 text-center">#</th>
                            <th className="w-32 text-center">Message</th>  {/* message rộng hơn */}
                            <th className="w-32 text-center">Type</th>
                            <th className="w-32 text-center">Status</th>
                            <th className="w-40 text-center">Created At</th>
                            <th className="w-40 text-center">Attachments</th>
                            <th className="min-w-[200px] text-center">Actions</th> {/* flex space */}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">No messages found</td>
                            </tr>
                        )}
                        {currentItems.map((item, idx) => {
                            const normalizedStatus = item.status
                                ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
                                : "Pending";

                            const statusClasses =
                                normalizedStatus === "Complete"
                                    ? "bg-green-100 text-green-800"
                                    : normalizedStatus === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800";

                            return (
                                <tr key={item._id} className="hover:bg-yellow-50">
                                    <td className="p-2 border">{indexOfFirstItem + idx + 1}</td>
                                    <td className="p-2 border max-w-xs truncate" title={item.message}>
                                        {item.message}
                                    </td>
                                    <td className="p-2 border text-center">{item.type}</td>
                                    <td className="p-2 border text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses}`}>
                                            {normalizedStatus}
                                        </span>
                                    </td>
                                    <td className="p-2 border">{formatDate(item.createdAt)}</td>
                                    <td className="p-2 border w-40 h-16">
                                        <div className="flex gap-1 items-center justify-center w-full h-full">
                                            {item.attachments?.length > 0 ? (
                                                <>
                                                    {item.attachments.slice(0, 2).map((att, idx) =>
                                                        att.type === "image" && att.preview ? (
                                                            <div key={idx} className="w-12 h-12 flex items-center justify-center border rounded">
                                                                <img
                                                                    src={att.preview}
                                                                    alt={att.name}
                                                                    className="object-contain w-full h-full"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div key={idx} className="w-12 h-12 flex items-center justify-center border rounded text-xs">
                                                                <a href={att.preview || "#"} download={att.name} className="text-blue-600 underline text-xs">
                                                                    {att.name}
                                                                </a>
                                                            </div>
                                                        )
                                                    )}
                                                    {item.attachments.length > 2 && (
                                                        <div className="w-12 h-12 flex items-center justify-center border rounded bg-gray-200 text-xs text-gray-700 font-medium">
                                                            +{item.attachments.length - 2}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No attachments</span>)}
                                        </div>
                                    </td>

                                    <td className="p-2 border flex flex-wrap gap-2">
                                        <button onClick={() => handleView(item)} className="px-2 py-1 text-blue-600 border rounded hover:bg-gray-100 flex items-center gap-1">
                                            <Eye size={16} /> View
                                        </button>
                                        {item.status?.toUpperCase() !== "COMPLETE" && (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="px-2 py-1 border rounded flex items-center gap-1 text-green-600 hover:bg-gray-100"
                                            >
                                                <PencilSimple size={16} /> Edit
                                            </button>
                                        )}

                                        {item.responses?.length > 0 && item.status !== "Complete" && (
                                            <button onClick={() => handleReply(item)} className="px-2 py-1 text-purple-600 border rounded hover:bg-gray-100 flex items-center gap-1">
                                                <PaperPlane size={16} /> Reply
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </div>

            {/* --- Pagination --- */}
            <div className="mt-4 flex justify-center">
                <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {/* --- Modal: View/Edit/Reply --- */}
            {showFormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl relative">
                        <button
                            onClick={() => setShowFormModal(false)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-semibold mb-4">
                            {modalMode === "reply"
                                ? "Reply Message"
                                : modalMode === "view"
                                    ? "View Message"
                                    : "Edit Message"}
                        </h3>

                        {modalMode === "reply" ? (
                            <div className="flex flex-col h-[70vh]">
                                {/* --- Chat Messages --- */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 border rounded bg-gray-50">
                                    {formModal.responses?.map((r, idx) => {
                                        const isAdmin = r.createdBy?.role === "admin";
                                        const justifyClass = isAdmin ? "justify-start" : "justify-end";
                                        const bubbleClass = isAdmin
                                            ? "bg-green-100 text-gray-800 rounded-bl-none"
                                            : "bg-blue-500 text-white rounded-br-none";

                                        return (
                                            <div key={idx} className={`flex ${justifyClass}`}>
                                                <div className={`p-3 rounded-lg max-w-[75%] ${bubbleClass}`}>
                                                    <div className="text-xs opacity-75 mb-1">
                                                        {isAdmin ? "Admin" : "User"} • {new Date(r.createdAt).toLocaleString()}
                                                    </div>
                                                    <div className="text-sm whitespace-pre-line">{r.message}</div>
                                                    {r.attachments?.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {r.attachments.map((att, i) =>
                                                                att.type === "image" && att.preview ? (
                                                                    <img key={i} src={att.preview} alt={att.name} className="w-20 h-20 object-cover rounded border" />
                                                                ) : (
                                                                    <a key={i} href={att.preview || "#"} download={att.name} className="text-xs underline text-blue-700">
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

                                {/* --- Input Reply --- */}
                                <div className="mt-4 flex flex-col gap-3">
                                    <textarea
                                        name="reply"
                                        value={formDataReply.reply}
                                        onChange={handleReplyChange}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none placeholder-gray-400 text-sm"
                                        placeholder={formModal.status === "Complete" ? "This message cannot be replied." : "Type your reply..."}
                                        rows={4}
                                        readOnly={formModal.status === "Complete" || formModal.responses?.length > 0} // khóa nếu Complete hoặc đã có response
                                    />

                                    {/* --- File chooser + Preview --- */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            {formDataReply.files.map((file, idx) => {
                                                const isImage = file.type?.startsWith("image/");
                                                const preview = isImage ? URL.createObjectURL(file) : null;
                                                return (
                                                    <div key={idx} className="relative w-20 h-20 border rounded flex items-center justify-center overflow-hidden">
                                                        {isImage ? (
                                                            <img src={preview} alt={file.name} className="object-cover w-full h-full" />
                                                        ) : (
                                                            <span className="text-xs text-center">{file.name}</span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormDataReply(prev => ({
                                                                    ...prev,
                                                                    files: prev.files.filter((_, i) => i !== idx)
                                                                }));
                                                            }}
                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                );
                                            })}

                                            {/* + Button để thêm file chỉ hiển thị khi Pending */}
                                            {formModal.status === "Pending" && (
                                                <label className="flex items-center justify-center w-20 h-20 border rounded cursor-pointer text-gray-500 hover:bg-gray-100">
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

                                    {/* --- Buttons --- */}
                                    <div className="flex justify-center gap-3 mt-2">
                                        <button
                                            onClick={() => setShowFormModal(false)}
                                            className="px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 text-base font-medium shadow-sm"
                                        >
                                            Cancel
                                        </button>

                                        {/* Send chỉ hiển thị khi Pending */}
                                        {formModal.status === "Pending" && (
                                            <button
                                                onClick={handleSubmitReply}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-base font-medium shadow-sm"
                                            >
                                                Send
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            // --- View/Edit Form --- (giữ nguyên như trước)
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* --- Name --- */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" value={formModal.name} readOnly className="w-full border rounded px-2 py-1 text-sm bg-gray-100" />
                                </div>

                                {/* --- Email --- */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" value={formModal.email} readOnly className="w-full border rounded px-2 py-1 text-sm bg-gray-100" />
                                </div>

                                {/* --- Status --- */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <input type="text" value={formModal.status} readOnly className="w-full border rounded px-2 py-1 text-sm bg-gray-100" />
                                </div>

                                {/* --- Phone --- */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input type="text" value={formModal.phone} readOnly={modalMode === "view"} className="w-full border rounded px-2 py-1 text-sm" onChange={e => setFormModal({ ...formModal, phone: e.target.value })} />
                                </div>

                                {/* --- Type --- */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    {modalMode === "view" ? (
                                        <input type="text" value={formModal.type} readOnly className="w-full border rounded px-2 py-1 text-sm bg-gray-100" />
                                    ) : (
                                        <select value={formModal.type} onChange={e => setFormModal({ ...formModal, type: e.target.value })} className="w-full border rounded px-2 py-1 text-sm">
                                            {["Support", "Feedback", "Complaint"].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* --- Message --- */}
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium mb-1">Message</label>
                                    <textarea value={formModal.message} readOnly={modalMode === "view"} className="w-full border rounded px-2 py-1 text-sm h-20 resize-none" onChange={e => setFormModal({ ...formModal, message: e.target.value })} />
                                </div>

                                {/* --- Attachments --- */}
                                <div className="md:col-span-3 mt-4 flex gap-2 flex-wrap">
                                    {formModal.attachments?.map((att, idx) => (
                                        <div key={idx} className="relative w-16 h-16">
                                            {att.type === "image" && att.preview ? (
                                                <img src={att.preview} alt={att.name} className="w-16 h-16 object-contain border rounded" />
                                            ) : (
                                                <a href={att.preview || "#"} download={att.name} className="text-blue-600 underline text-xs">{att.name}</a>
                                            )}
                                            {modalMode === "edit" && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newAtt = [...formModal.attachments];
                                                        newAtt.splice(idx, 1);
                                                        setFormModal({ ...formModal, attachments: newAtt });
                                                    }}
                                                    className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    {modalMode === "edit" && (
                                        <label className="w-16 h-16 flex items-center justify-center border rounded cursor-pointer text-gray-500 hover:bg-gray-100">
                                            +
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        const preview = URL.createObjectURL(file);
                                                        setFormModal({
                                                            ...formModal,
                                                            attachments: [...formModal.attachments, { file, type: "image", preview, name: file.name }],
                                                        });
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* --- Buttons --- */}
                                <div className="md:col-span-3 flex gap-2 justify-center mt-4">
                                    {modalMode === "view" ? (
                                        <>
                                            <button
                                                onClick={() => setShowFormModal(false)}
                                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm"
                                            >
                                                Back to List
                                            </button>

                                            {/* Hiển thị Edit chỉ khi status không phải Complete */}
                                            {modalMode === "view" && formModal.status?.toLowerCase() !== "complete" && (
                                                <button
                                                    onClick={() => setModalMode("edit")}
                                                    className="px-4 py-2 rounded text-sm bg-green-600 text-white hover:bg-green-700"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setShowFormModal(false)}
                                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
                                            >
                                                Save Changes
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
