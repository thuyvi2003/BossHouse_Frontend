import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Link } from "react-router-dom";

export default function HomePage() {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Dog className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to BossHouse</CardTitle>
                    {user ? (
                        <p className="text-gray-600">
                            Hello, {user.name}! Your role is{" "}
                            <span className="font-semibold">{user.role}</span>.
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            Welcome, Guest!{" "}
                            <Link to="/login" className="text-primary underline">
                                Sign in
                            </Link>{" "}
                            to access your account.
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-gray-600">
                        Explore everything your furry friends need at BossHouse!
                    </p>
                    {user ? (
                        <Button onClick={logout} className="w-full h-11">
                            Logout
                        </Button>
                    ) : (
                        <Button asChild className="w-full h-11">
                            <Link to="/login">Sign In</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}