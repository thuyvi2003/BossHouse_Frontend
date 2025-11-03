import { useState, useEffect, useCallback } from 'react';
import { Search, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountTable } from './AccountTable';
import { AccountDetailDialog } from './AccountDetailDialog';
import { AssignRoleDialog } from './AssignRoleDialog';
import { BanConfirmationDialog } from './BanConfirmationDialog';
import { AccountRole, AccountStatus } from './types/account';
import { getAccounts, assignRole, banUnbanAccount } from '@/services/accountManagementService';
import { toast } from "react-toastify";
import Pagination from '@/components/Layout/Pagination';
import { debounce } from 'lodash';  // NEW: For debounced search

const AccountManagement = () => {
    const [accountsData, setAccountsData] = useState({ accounts: [], pagination: {} });
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountToAssignRole, setAccountToAssignRole] = useState(null);
    const [accountToBanUnban, setAccountToBanUnban] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAccounts = async () => {
        setIsLoading(true);
        try {
            const params = {
                search: searchQuery || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: currentPage,
                limit: 8,
            };
            const data = await getAccounts(params);
            setAccountsData(data);
        } catch (error) {
            toast.error(error.message || "Failed to fetch accounts");
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Debounced fetch for search (avoids API spam)
    const debouncedFetchAccounts = useCallback(
        debounce(async () => {
            await fetchAccounts();
        }, 300),
        [searchQuery, roleFilter, statusFilter, currentPage]
    );

    // UPDATED: Main useEffect for fetching
    useEffect(() => {
        debouncedFetchAccounts();
        return () => debouncedFetchAccounts.cancel();
    }, [searchQuery, roleFilter, statusFilter, currentPage, debouncedFetchAccounts]);

    // NEW: Reset page to 1 on search/filter changes (FIXES the bug)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, statusFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAssignRole = async (accountId, newRole) => {
        try {
            await assignRole(accountId, newRole);
            toast.success("Role assigned successfully!");
            setAccountToAssignRole(null);
            fetchAccounts();  // Refresh list
        } catch (error) {
            toast.error(error.message || "Failed to assign role");
        }
    };

    const handleBanUnbanRequest = (account) => {
        setAccountToBanUnban(account);
    };

    const handleBanUnbanConfirm = async () => {
        if (accountToBanUnban) {
            try {
                const newStatus = accountToBanUnban.status === AccountStatus.ACTIVE ? AccountStatus.BANNED : AccountStatus.ACTIVE;
                await banUnbanAccount(accountToBanUnban.id, newStatus);
                toast.success(`Account ${newStatus === AccountStatus.ACTIVE ? 'unbanned' : 'banned'} successfully!`);
                setAccountToBanUnban(null);
                fetchAccounts();  // Refresh list
            } catch (error) {
                toast.error(error.message || "Failed to update status");
            }
        }
    };

    const { accounts, pagination } = accountsData;

    return (
        <div className="min-h-screen bg-[#f5f3f0]">
            <div className="">
                {/* Header */}
                <div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
                    <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
                        <Users size={20} className="text-[#846551]" />
                        <span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
                            Account Management
                        </span>
                    </h2>
                </div>

                {/* Search and Filters */}
                <div className="bg-white shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search accounts by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-[#fafaf9] border-gray-200"
                            />
                        </div>
                        <div className="flex gap-4">
                            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
                                <SelectTrigger className="w-[180px] bg-[#fafaf9] border-gray-200">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value={AccountStatus.ACTIVE}>Active</SelectItem>
                                    <SelectItem value={AccountStatus.BANNED}>Banned</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={roleFilter} onValueChange={setRoleFilter} disabled={isLoading}>
                                <SelectTrigger className="w-[180px] bg-[#fafaf9] border-gray-200">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value={AccountRole.USER}>User</SelectItem>
                                    <SelectItem value={AccountRole.ADMIN}>Admin</SelectItem>
                                    <SelectItem value={AccountRole.STAFF}>Staff</SelectItem>
                                    <SelectItem value={AccountRole.VETERINARIAN}>Veterinarian</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Showing {accounts.length} of {pagination.totalItems || 0} accounts
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading accounts...</div>  // NEW: Loading placeholder
                    ) : (
                        <AccountTable
                            accounts={accounts}
                            onViewDetail={setSelectedAccount}
                            onAssignRole={setAccountToAssignRole}
                            onBanUnban={handleBanUnbanRequest}
                        />
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <Pagination
                            page={currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Dialogs unchanged */}
            <AccountDetailDialog
                account={selectedAccount}
                onClose={() => setSelectedAccount(null)}
            />
            <AssignRoleDialog
                account={accountToAssignRole}
                onClose={() => setAccountToAssignRole(null)}
                onAssign={handleAssignRole}
            />
            <BanConfirmationDialog
                account={accountToBanUnban}
                onClose={() => setAccountToBanUnban(null)}
                onConfirm={handleBanUnbanConfirm}
            />
        </div>
    );
};

export default AccountManagement;