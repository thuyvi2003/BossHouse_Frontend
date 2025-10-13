// ContactManager.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import contactService from "@/services/contactService";
import ContactTable from "./ContactTable";
import ContactForm from "./ContactForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { Mail } from "lucide-react";

// === Buffer -> Base64 ===
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

// === Normalize attachment ===
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

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [selectedContact, setSelectedContact] = useState(null);
  const [formMode, setFormMode] = useState("view"); // view | edit | delete
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);

  const { user } = useAuthStore();

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("");

  // === Fetch contacts ===
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getAll();
      const formatted = data.map((c) => ({
        ...c,
        attachments: c.attachments?.map(formatAttachment) || [],
        responses:
          c.responses?.map((r) => ({
            ...r,
            attachments: r.attachments?.map(formatAttachment) || [],
          })) || [],
      }));
      setContacts(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Cannot load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // === Reset currentPage when filters/search change ===
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus, filterType]);

  // === Handlers ===
  const handleView = (item) => {
    setSelectedContact(item);
    setFormMode("view");
  };
  const handleEdit = (item) => {
    setSelectedContact(item);
    setFormMode("edit");
  };
  const handleReply = (contact, isViewOnly = false) => {
    setSelectedContact(contact);
    setViewOnly(isViewOnly);
    setShowReplyModal(true);
  };
  const handleDeleteClick = (item) => {
    setSelectedContact(item);
    setFormMode("delete");
  };

  // === Form submit ===
  const handleFormSubmit = async (data) => {
    try {
      if (formMode === "delete" && data.delete) {
        await contactService.delete(selectedContact._id);
        toast.success("Deleted successfully");
      } else if (formMode === "edit") {
        await contactService.update(selectedContact._id, data);
        toast.success("Saved successfully");
      }
      setSelectedContact(null);
      setFormMode("view");
      fetchContacts();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  const handleReplySubmit = async (data) => {
    try {
      const formData = new FormData();
      const message =
        data instanceof FormData ? data.get("message") : data.reply || "";
      if (!message.trim()) {
        toast.warn("Please enter a message before replying");
        return;
      }
      formData.append("message", message);
      const files =
        data instanceof FormData ? data.getAll("attachments") : data.files;
      if (files && files.length > 0) {
        for (const file of files) formData.append("attachments", file);
      }
      formData.append("senderId", user._id);
      formData.append("senderRole", user.role);
      await contactService.reply(selectedContact._id, formData);
      toast.success("Replied successfully");
      setShowReplyModal(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reply");
    }
  };

  // === Filters & pagination ===
  const filteredContacts = contacts
    .filter((c) =>
      searchText
        ? c.message?.toLowerCase().includes(searchText.toLowerCase()) ||
          c.name?.toLowerCase().includes(searchText.toLowerCase())
        : true
    )
    .filter((c) =>
      filterStatus === "ALL"
        ? true
        : c.status?.toUpperCase() === filterStatus.toUpperCase()
    )
    .filter((c) => (filterType ? c.type === filterType : true));

  const totalPages = Math.ceil(filteredContacts.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
      <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
          <Mail size={20} className="text-[#846551]" />
          <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
            Contact Management
          </span>
        </h2>
      </div>

      <div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#846551] mx-auto"></div>
          </div>
        ) : (
          <ContactTable
            contacts={currentItems}
            indexOfFirstItem={indexOfFirstItem} // dùng để đánh số thứ tự liên tục
            onView={handleView}
            onEdit={handleEdit}
            onReply={handleReply}
            onDelete={handleDeleteClick}
            searchText={searchText}
            setSearchText={setSearchText}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage} // đảm bảo pagination update page
          />
        )}
      </div>

      {selectedContact && formMode !== "reply" && (
        <ContactForm
          contact={selectedContact}
          mode={formMode}
          setFormMode={setFormMode}
          onClose={() => setSelectedContact(null)}
          onSubmit={handleFormSubmit}
          currentUserId={user._id}
          currentUserRole={user.role}
        />
      )}

      {showReplyModal && selectedContact && (
        <ContactForm
          contact={selectedContact}
          mode="reply"
          viewOnly={viewOnly}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedContact(null);
          }}
          onSubmit={handleReplySubmit}
          currentUserId={user._id}
          currentUserRole={user.role}
        />
      )}
    </div>
  );
}
