import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getLoginHistory } from "@/services/profileService";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export function AccountActivityModal({ open, onOpenChange }) {
    const [displayedLogs, setDisplayedLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortDirection, setSortDirection] = useState("desc");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const scrollContainerRef = useRef(null);

    const fetchLogs = async (pageNum) => {
        try {
            setIsLoading(true);
            const { loginHistory, pagination } = await getLoginHistory(pageNum, ITEMS_PER_PAGE);
            setDisplayedLogs((prev) => pageNum === 1 ? loginHistory : [...prev, ...loginHistory]);
            setTotalPages(pagination.totalPages);
            setPage(pageNum);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch initial logs when modal opens
    useEffect(() => {
        if (open) {
            setSortDirection("desc"); // Reset to "Newest first" when modal opens
            setDisplayedLogs([]);
            setPage(1);
            fetchLogs(1);
        }
    }, [open]);

    // Sort logs when direction changes
    useEffect(() => {
        if (displayedLogs.length > 0) {
            const sorted = [...displayedLogs].sort((a, b) => {
                const timeA = new Date(a.loginTime).getTime();
                const timeB = new Date(b.loginTime).getTime();
                return sortDirection === "desc" ? timeB - timeA : timeA - timeB;
            });
            setDisplayedLogs(sorted);
        }
    }, [sortDirection]);

    const loadMoreItems = () => {
        if (isLoading || page >= totalPages) return;
        fetchLogs(page + 1);
    };

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const scrolledToBottom =
            target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

        if (scrolledToBottom && !isLoading) {
            loadMoreItems();
        }
    };

    const getBadgeProps = (type) => {
        const badgeMap = {
            google: {
                className: "bg-[#4285F4] text-white hover:bg-[#3367D6]",
                label: "Google",
            },
            email: {
                className: "bg-[#6B7280] text-white hover:bg-[#4B5563]",
                label: "Email",
            },
        };
        return badgeMap[type] || {
            className: "bg-[#6B7280] text-white hover:bg-[#4B5563]",
            label: "Unknown",
        };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader className="flex flex-row items-center gap-30">
                    <DialogTitle>Account Activity</DialogTitle>
                    <Select
                        value={sortDirection}
                        onValueChange={(value) => setSortDirection(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Newest first</SelectItem>
                            <SelectItem value="asc">Oldest first</SelectItem>
                        </SelectContent>
                    </Select>
                </DialogHeader>
                <div
                    ref={scrollContainerRef}
                    className="overflow-auto flex-1"
                    onScroll={handleScroll}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Login Time</TableHead>
                                <TableHead>Login Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayedLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        className="text-center text-muted-foreground"
                                    >
                                        No activity logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {displayedLogs.map((log) => {
                                        const date = new Date(log.loginTime);
                                        const formattedDate = date.toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            timeZone: 'Asia/Ho_Chi_Minh',
                                        });
                                        const formattedTime = date.toLocaleTimeString('en-GB', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            timeZone: 'Asia/Ho_Chi_Minh',
                                        });
                                        return (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <strong>{formattedDate}</strong>
                                                        <div>{formattedTime}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const { className: badgeClass, label } = getBadgeProps(log.loginType);
                                                        return (
                                                            <Badge className={badgeClass}>
                                                                {label}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                className="text-center py-4"
                                            >
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {displayedLogs.length < totalPages * ITEMS_PER_PAGE && !isLoading && (
                    <div className="text-center text-muted-foreground py-2 border-t">
                        Scroll down to load more
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}