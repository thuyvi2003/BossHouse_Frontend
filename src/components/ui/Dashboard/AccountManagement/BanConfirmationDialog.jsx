import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AccountStatus } from './types/account';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const BanConfirmationDialog = ({ account, onClose, onConfirm }) => {
    if (!account) return null;

    const isBanning = account.status === AccountStatus.ACTIVE;

    return (
        <AlertDialog open={!!account} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {isBanning ? (
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        )}
                        <AlertDialogTitle>
                            {isBanning ? 'Ban Account' : 'Unban Account'}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        {isBanning ? (
                            <>
                                Are you sure you want to ban{' '}
                                <span className="font-medium text-gray-900">{account.name}</span> (
                                {account.email})? This user will no longer be able to access the
                                system.
                            </>
                        ) : (
                            <>
                                Are you sure you want to unban{' '}
                                <span className="font-medium text-gray-900">{account.name}</span> (
                                {account.email})? This user will regain access to the system.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            isBanning
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                        }
                    >
                        {isBanning ? 'Ban Account' : 'Unban Account'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export { BanConfirmationDialog };