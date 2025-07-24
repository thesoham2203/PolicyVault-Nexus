// AdminRegister.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-hot-toast';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';

const AdminRegister = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ORG_ADMIN');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const navigate = useNavigate();
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  useEffect(() => {
  const loadFingerprint = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    setDeviceFingerprint(result.visitorId);
  };
  loadFingerprint();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (step === 1) {
        // Basic validation
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!termsAccepted) {
          throw new Error('You must accept the terms and conditions');
        }
        
        setStep(2);
      } else if (step === 2) {
        const recaptchaToken = await recaptchaRef.current?.executeAsync();
      
      const response = await axios.post('http://localhost:8000/api/auth/send-otp', { 
        email,
        recaptcha_token: recaptchaToken 
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status !== 200) {
        throw new Error(response.data?.detail || 'Failed to send OTP');
      }
      
      setStep(3);
      toast.success('OTP sent to your email');
      } else {
        // Complete registration
        await axios.post('http://localhost:8000/api/auth/register', {
          email,
          password,
          role,
          terms_accepted: termsAccepted,
          otp,
          device_fingerprint: deviceFingerprint
        });
        
        toast.success('Registration successful! Please login.');
        navigate('/admin/login');
      }
    } catch (err) {
      console.error("Registration error:", err);  // Detailed error logging
    
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        setError(err.response.data?.detail || 'Registration failed');
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        setError('No response from server');
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", err.message);
        setError('Request failed');
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />

      <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
        {/* Left Side (unchanged) */}
        <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
          <div className="w-full h-full flex flex-col justify-between p-8">
            <span className="flex items-center space-x-2 relative">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield h-8 w-8 text-indigo-600 z-10 relative"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
                <div className="absolute inset-0 h-8 w-8 bg-indigo-600/30 rounded-full blur-sm z-0" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                PolicyVault
              </h1>
            </span>

            <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
                PolicyVault <span className="italic font-semibold text-white">ADMIN</span>
              </h1>
              <p className="text-md font-light text-white">
                Secure administration portal for PolicyVault Nexus
              </p>
              <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
                Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
          <div className="w-full max-w-md space-y-6 p-8">
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Admin Registration</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Email*</label>
                    <input
                      type="email"
                      placeholder="admin@yourorg.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Role*</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    >
                      <option value="ORG_ADMIN">Organization Admin</option>
                      <option value="AUDITOR">Auditor</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I accept the Terms and Conditions
                    </label>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="text-center">
                  <p className="mb-4">We'll send an OTP to your email to verify your identity.</p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code*</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Check your email for the OTP code (valid for 5 minutes)
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#1E3A8A] text-white font-semibold py-3 rounded-md hover:bg-[#1E40AF] transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  'Processing...'
                ) : step === 1 ? (
                  'Continue to Verification'
                ) : step === 2 ? (
                  'Send OTP'
                ) : (
                  'Complete Registration'
                )}
              </button>

              {step !== 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step === 3 ? 2 : 1)}
                  className="w-full text-[#1E3A8A] font-medium py-2 rounded-md hover:underline transition-colors"
                >
                  Back
                </button>
              )}

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/admin/login"
                  className="text-[#1E3A8A] hover:underline font-medium"
                >
                  Login here
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      />
    </div>
  );
};

export default AdminRegister;