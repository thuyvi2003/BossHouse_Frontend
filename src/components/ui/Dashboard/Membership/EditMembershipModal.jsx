import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EditMembershipModal = ({ isOpen, onClose, onUpdate, item }) => {
  const [form, setForm] = useState({ name: "", point: 0, description: "" });

  useEffect(() => {
    if (item && isOpen) setForm({ name: item.name || "", point: item.point ?? 0, description: item.description || "" });
  }, [item, isOpen]);

  const submit = () => onUpdate(form);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update Membership</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Membership Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Membership Point" type="number" value={form.point} onChange={e => setForm({ ...form, point: e.target.value })} />
          <Textarea rows={6} placeholder="Membership Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 border rounded" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 bg-[#846551] text-white rounded" onClick={submit}>Update</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditMembershipModal;