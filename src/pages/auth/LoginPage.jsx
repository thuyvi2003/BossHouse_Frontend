import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import BossHouse_Logo from "@/assets/BossHouse_Logo.png";
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, googleLogin, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login(email, password);

        if (result.success) {
            toast.success("Login successful!");
            // Check the user role from the login result
            if (result.user.role === 'admin') {
                navigate("/Dashboard");
            } else {
                navigate("/");
            }
        } else {
            toast.error(result.error);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const result = await googleLogin(credentialResponse.credential);

        if (result.success) {
            toast.success("Google login successful!");
            if (result.user.role === 'admin') {
                navigate("/Dashboard");
            } else {
                navigate("/");
            }
        } else {
            toast.error(result.error);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <img
                    src="https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Pet store interior"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-8 left-8 text-white">
                    <h2 className="text-3xl mb-2">Welcome to BossHouse</h2>
                    <p className="text-lg opacity-90">Everything your furry friends need</p>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo and Header */}
                    <div className="text-center">
                        <div className="flex items-center justify-center">
                            <img
                                src={BossHouse_Logo}
                                alt="BossHouse_Logo"
                                className="w-32 h-32 object-cover"
                            />
                        </div>
                        <h1 className="text-3xl font-bold">Welcome back</h1>
                        <p className="mt-2 text-gray-600">Login to your BossHouse account</p>
                    </div>

                    {/* Login Card */}
                    <Card className="border-gray-200 shadow-lg">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-2xl text-center">Login</CardTitle>
                            <CardDescription className="text-sm text-gray-600 text-center">
                                Enter your email and password to access your pet store account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-11 pr-10"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="link" className="px-0 text-sm" onClick={() => navigate('/forgot-password')} disabled={isLoading}>
                                        Forgot password?
                                    </Button>
                                </div>

                                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                    {isLoading ? "Logging in..." : "Login"}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator className="w-full" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Google Login Button */}
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap
                                    theme="filled_blue"
                                    size="large"
                                    text="signin_with"
                                    shape="rectangular"
                                    width="100%"
                                    logo_alignment="left"
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="text-center text-sm text-muted-foreground w-full">
                                Don't have an account?{" "}
                                <Button variant="link" className="px-0 font-bold" onClick={() => navigate('/register')} disabled={isLoading}>
                                    Register here
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Footer */}

                </div>
            </div>
        </div>
    );
}