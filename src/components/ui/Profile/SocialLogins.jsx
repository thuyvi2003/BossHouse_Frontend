import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Share2,
    Minus,
    Check,
    CircleAlert,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { GoogleLogin } from '@react-oauth/google';
import { linkGoogle, unlinkGoogle } from "@/services/profileService";
import { useState } from "react";

export function SocialLogins({ isConnected, onRefreshProfile }) {
    const [isLinking, setIsLinking] = useState(false);

    const handleGoogleLinkSuccess = async (credentialResponse) => {
        if (!credentialResponse.credential) return;
        try {
            setIsLinking(true);
            await linkGoogle(credentialResponse.credential);
            toast.success("Google account linked successfully!");
            if (onRefreshProfile) onRefreshProfile();  // Refresh parent profile
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLinking(false);
        }
    };

    const handleGoogleLinkError = () => {
        toast.error("Google linking failed");
        setIsLinking(false);
    };

    const handleUnlink = async () => {
        try {
            await unlinkGoogle();
            toast.success("Google account unlinked!");
            if (onRefreshProfile) onRefreshProfile();  // Refresh parent profile
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-black" />
                    <CardTitle className="font-bold">Social logins</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <FcGoogle className="w-6 h-6" />
                        <span>Google</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {!isConnected ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Minus className="h-5 w-5 text-red-500" />
                                <span>Disabled</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-green-500">Connected</span>
                            </div>
                        )}
                        {!isConnected ? (
                            <GoogleLogin
                                onSuccess={handleGoogleLinkSuccess}
                                onError={handleGoogleLinkError}
                                disabled={isLinking}
                                theme="filled_blue"
                                size="medium"
                                text="signin_with"
                                shape="rectangular"
                                width="120"
                                logo_alignment="left"
                                useOneTap={false}  // Disable one-tap for linking context
                            />
                        ) : (
                            <Button
                                onClick={handleUnlink}
                                variant="outline"
                                disabled={isLinking}
                            >
                                Unlink
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex items-start gap-2 pt-2">
                    <div className="mt-0.5">
                        <CircleAlert className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        You can have only one active social login at a time
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}