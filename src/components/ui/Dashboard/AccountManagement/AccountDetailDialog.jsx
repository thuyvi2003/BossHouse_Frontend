import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AccountStatus } from './types/account';
import { Mail, User, Shield, Calendar, AlertCircle } from 'lucide-react';

const AccountDetailDialog = ({ account, onClose }) => {
    if (!account) return null;

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
            case 'veterinarian':
                return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'staff':
                return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'user':
                return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
        }
    };

    // UPDATED: Handle inactive status (gray badge)
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case AccountStatus.ACTIVE:
                return 'bg-green-100 text-green-700 hover:bg-green-100';
            case AccountStatus.BANNED:
                return 'bg-red-100 text-red-700 hover:bg-red-100';
            case AccountStatus.INACTIVE:  // NEW: Gray for inactive/deleted
                return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case AccountStatus.ACTIVE:
                return 'Active';
            case AccountStatus.BANNED:
                return 'Banned';
            case AccountStatus.INACTIVE:
                return 'Inactive';  // NEW: For deleted
            default:
                return status;
        }
    };

    return (
        <Dialog open={!!account} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Account Details</DialogTitle>
                    <DialogDescription>
                        {account.is_deleted && (  // NEW: Warning for deleted accounts
                            <div className="mb-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                                ⚠️ This account is soft-deleted (inactive).
                            </div>
                        )}
                        View detailed information about this account
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Name */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Name</p>
                            <p className="text-gray-900">{account.name}</p>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="text-gray-900">{account.email}</p>
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Role</p>
                            <Badge className={getRoleBadgeColor(account.role)}>
                                {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                            </Badge>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-3">
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${account.status === AccountStatus.ACTIVE ? 'bg-green-100' :
                                account.status === AccountStatus.BANNED ? 'bg-red-100' : 'bg-gray-100'  // NEW: Gray for inactive
                                }`}
                        >
                            <AlertCircle
                                className={`w-5 h-5 ${account.status === AccountStatus.ACTIVE ? 'text-green-600' :
                                    account.status === AccountStatus.BANNED ? 'text-red-600' : 'text-gray-600'  // NEW: Gray for inactive
                                    }`}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            <Badge className={getStatusBadgeClass(account.status)}>
                                {getStatusLabel(account.status)}
                            </Badge>
                        </div>
                    </div>

                    {/* Created At */}
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Created At</p>
                            <p className="text-gray-900">{formatDate(account.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export { AccountDetailDialog };