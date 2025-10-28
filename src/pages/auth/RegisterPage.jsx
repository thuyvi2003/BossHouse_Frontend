import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '@/config/api';
import BossHouse_Logo from "@/assets/BossHouse_Logo.png"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length < 3) {
          return 'Name must be at least 3 characters long';
        }
        return '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'password':
        if (!value || value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error on change and validate live
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };
    setErrors(newErrors);

    // Check if any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      toast.success(response.data.message);
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="BossHouse gaming store interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-3xl mb-2">Welcome to BossHouse</h1>
          <p className="text-lg opacity-90">Everything your furry friends need</p>
        </div>
      </div>
      {/* Right side - Registration form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Logo placeholder */}
          <div className="flex justify-center mb-0.5">
            <img
              src={BossHouse_Logo}
              alt="BossHouse_Logo"
              className="w-32 h-32 object-cover"
            />
          </div>
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Join BossHouse</h1>
            <p className="mt-2 text-gray-600">Create your account to get started</p>
          </div>
          {/* Registration Form */}
          <Card className="shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <CardDescription className="text-sm text-gray-600 text-center">
                Fill in your details to create your BossHouse account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`bg-gray-50 border-0 ${errors.name ? 'border-red-500' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`bg-gray-50 border-0 ${errors.email ? 'border-red-500' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`bg-gray-50 border-0 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      required
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
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
                {/* Sign Up Button */}
                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
              {/* Sign In Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Button
                  variant="link"
                  className="px-0 font-bold"
                  onClick={() => navigate('/login')}
                  disabled={isLoading}
                >
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}