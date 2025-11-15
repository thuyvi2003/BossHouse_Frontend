import { Eye, UserCog } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccountStatus } from './types/account';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const AccountTable = ({ accounts, onViewDetail, onAssignRole, onBanUnban }) => {
    if (accounts.length === 0) {
        return (
            <div className="py-20 text-center text-gray-400">
                No accounts found
            </div>
        );
    }

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

    // NEW: Updated for inactive status
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case AccountStatus.ACTIVE:
                return 'bg-green-100 text-green-700 hover:bg-green-100';
            case AccountStatus.BANNED:
                return 'bg-red-100 text-red-700 hover:bg-red-100';
            case AccountStatus.INACTIVE:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-100';  // NEW: Gray for inactive
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
                return 'Inactive';  // NEW: For soft-deleted
            default:
                return status;
        }
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#fafaf9] hover:bg-[#fafaf9]">
                        <TableHead className="text-gray-600">NAME</TableHead>
                        <TableHead className="text-gray-600">EMAIL</TableHead>
                        <TableHead className="text-gray-600">ROLE</TableHead>
                        <TableHead className="text-gray-600">STATUS</TableHead>
                        <TableHead className="text-gray-600">CREATED</TableHead>
                        <TableHead className="text-gray-600 text-center">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {accounts.map((account) => (
                        <TableRow key={account.id} className="hover:bg-gray-50">
                            <TableCell>{account.name}</TableCell>
                            <TableCell className="text-gray-600">{account.email}</TableCell>
                            <TableCell>
                                <Badge className={getRoleBadgeColor(account.role)}>
                                    {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusBadgeClass(account.status)}>
                                    {getStatusLabel(account.status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">
                                {formatDate(account.createdAt)}
                            </TableCell>
                            <TableCell className="text-center">
                                <TooltipProvider>
                                    <div className="flex items-center justify-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewDetail(account)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>View Details</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        {/* UPDATED: Assign Role - Disabled + Tooltip for deleted */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => !account.is_deleted && onAssignRole(account)}  // NEW: Conditional onClick
                                                    disabled={account.is_deleted}  // NEW: Disable for deleted
                                                    className={account.is_deleted ? 'opacity-50 cursor-not-allowed' : ''}  // NEW: Visual disabled
                                                >
                                                    <UserCog className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{account.is_deleted ? 'Cannot assign roles to deleted users' : 'Assign Role'}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        {/* UPDATED: Ban/Unban - Disabled + Tooltip for deleted */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => !account.is_deleted && onBanUnban(account)}  // NEW: Conditional onClick
                                                    disabled={account.is_deleted}  // NEW: Disable for deleted
                                                    className={`min-w-[80px] ${account.is_deleted ? 'opacity-50 cursor-not-allowed' : (account.status === AccountStatus.ACTIVE ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700')}`}  // UPDATED: Conditional class
                                                >
                                                    {account.is_deleted ? 'N/A' : (account.status === AccountStatus.ACTIVE ? 'Ban' : 'Unban')}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{account.is_deleted ? 'Ban/unban not available for deleted users' : (account.status === AccountStatus.ACTIVE ? 'Ban Account' : 'Unban Account')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export { AccountTable };