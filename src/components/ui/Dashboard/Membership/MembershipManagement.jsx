import React, { useEffect, useState } from "react";
import { getMemberships, createMembership, updateMembership, softDeleteMembership } from "@/services/membershipService";
import ConfirmDialog from "@/components/Layout/ConfirmDialog";
import Toast from "@/components/Layout/Toast";
import CreateMembershipModal from "./CreateMembershipModal";
import EditMembershipModal from "./EditMembershipModal";
import MembershipDetailModal from "./MembershipDetailModal";
import Pagination from "@/components/Layout/Pagination";

const MembershipManagement = () => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, type: "success", message: "" });

    const fetchData = async (p = 1) => {
        const res = await getMemberships(p, limit, search);
        setItems(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setPage(p);
    };

    useEffect(() => {
        const t = setTimeout(() => fetchData(1), 350);
        return () => clearTimeout(t);
    }, [search]);

    const handleCreate = async (form) => {
        await createMembership({ name: form.name, point: Number(form.point || 0), description: form.description });
        setCreateOpen(false);
        await fetchData(1);
    };

    const handleUpdate = async (form) => {
        if (!selected?._id) return;
        await updateMembership(selected._id, { name: form.name, point: Number(form.point || 0), description: form.description });
        setEditOpen(false);
        setSelected(null);
        setToast({ show: true, type: "success", message: "Updated successfully" });
        await fetchData(page);
    };

    const handleConfirmDelete = async () => {
        if (!selected?._id) return;
        await softDeleteMembership(selected._id);
        setConfirmOpen(false);
        setSelected(null);
        setToast({ show: true, type: "success", message: "Deleted successfully" });
        await fetchData(page);
    };

    return (
        <div className="bg-white shadow-xl overflow-hidden flex-1">
            <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
                <h2 className="text-2xl font-extrabold">Membership Management</h2>
                <div className="flex gap-3 items-center">
                    <input
                        className="px-3 py-2 border rounded"
                        placeholder="Search membership..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button onClick={() => setCreateOpen(true)} className="px-4 py-2 bg-[#846551] text-white rounded">
                        Create +
                    </button>
                </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
                <div className="grid grid-cols-13 gap-4 px-6 py-3 font-bold bg-[#f5f3f2]">
                    <div className="col-span-1">Id</div>
                    <div className="col-span-3 text-center">Membership Name</div>
                    <div className="col-span-2 text-center">Membership Point</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-center">Action</div>
                </div>

                <div className="divide-y">
                    {items.map((m, idx) => (
                        <div key={m._id} className="grid grid-cols-13 gap-4 px-6 py-4 items-center bg-white">
                            <div className="col-span-1">{(page - 1) * limit + idx + 1}</div>
                            <div className="col-span-3 text-center">{m.name}</div>
                            <div className="col-span-2 text-center">{m.point?.toLocaleString()}</div>

                            {/* Description: tránh đè nút */}
                            <div
                                className="col-span-5 overflow-hidden whitespace-nowrap text-ellipsis"
                                title={m.description}
                            >
                                {m.description}
                            </div>

                            {/* Action: 3 nút kiểu outline, bo tròn giống mẫu */}
                            <div className="col-span-2 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => { setSelected(m); setDetailOpen(true); }}
                                    className="px-3 py-1 text-[13px] rounded-full border border-[#846551] text-[#846551] hover:bg-[#f3ece9] transition"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => { setSelected(m); setEditOpen(true); }}
                                    className="px-3 py-1 text-[13px] rounded-full border border-[#8c6f5a] text-[#8c6f5a] hover:bg-[#efe7e1] transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => { setSelected(m); setConfirmOpen(true); }}
                                    className="px-3 py-1 text-[13px] rounded-full border border-[#b85c49] text-[#b85c49] hover:bg-[#fbe9e6] transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={(np) => fetchData(np)} />

            {/* Modals */}
            <CreateMembershipModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
            <EditMembershipModal isOpen={editOpen} onClose={() => setEditOpen(false)} onUpdate={handleUpdate} item={selected} />
            <MembershipDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} item={selected} />

            {/* Confirm */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title="Confirm delete"
                message={`Are you sure you want to delete "${selected?.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />

            {toast.show && (
                <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
};

export default MembershipManagement;