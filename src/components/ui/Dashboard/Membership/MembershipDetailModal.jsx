import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MembershipDetailModal = ({ isOpen, onClose, item }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Membership Detail</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div><b>Name:</b> {item?.name}</div>
          <div><b>Point:</b> {item?.point?.toLocaleString()}</div>
          <div><b>Description:</b></div>
          <div className="whitespace-pre-line">{item?.description}</div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 border rounded" onClick={onClose}>Close</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipDetailModal;