import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '@/config/api';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const handleVerify = async () => {
    if (otp.length !== 4) {
      toast.error('Please enter a 4-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResendLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, { email });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResendLoading(false);
    }
  };

  if (!email) {
    return <div className="min-h-screen flex items-center justify-center">Invalid email parameter</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background with dog bones pattern */}
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

      {/* Right side - Verification form in a Card */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full mr-1"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <CardTitle className="text-2xl">Verify Your Account</CardTitle>
            <CardDescription>
              We've sent a 4-digit code to your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-lg text-center">Enter verification code</label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isLoading || isResendLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={otp.length !== 4 || isLoading || isResendLoading}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResend}
                  className="text-black hover:underline"
                  disabled={isLoading || isResendLoading}
                >
                  {isResendLoading ? 'Resending...' : 'Resend code'}
                </button>
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              className="px-0 font-bold"
              onClick={() => navigate('/login')}
              disabled={isLoading || isResendLoading}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}