// AdminLogin.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
//import ReCAPTCHA from 'react-google-recaptcha';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { toast } from 'react-hot-toast';
import { useAuthh } from '../types/useAuthh';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  //const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuthh();

  // Initialize fingerprint on component mount
  React.useEffect(() => {
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceFingerprint(result.visitorId);
    };
    getFingerprint();
  }, []);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     if (step === 'credentials') {
  //       // Verify credentials and request OTP
  //       const response = await axios.post('http://localhost:8000/api/auth/login', {
  //         // username: email,
  //         // password,
  //         email,
  //         password,
  //         device_fingerprint: deviceFingerprint,
  //         invite_token: !email.endsWith('@gmail.com') ? inviteToken : undefined
  //       }, {
  //         headers: {
  //           'Content-Type': 'application/x-www-form-urlencoded',
  //         },
  //       });
  //       if (response.data.requires_otp) {
  //         setStep('otp');
  //         toast.success('OTP sent to your email');
  //       }
  //     } else {
  //       // Verify OTP and complete login
  //       // const response = await axios.post('/api/auth/login/verify', {
  //       //   email,
  //       //   password,
  //       //   otp,
  //       //   device_fingerprint: deviceFingerprint,
  //       // });
        
  //       // // Redirect to dashboard on success
  //       // navigate('/admin/dashboard');
  //       const response = await axios.post('https://localhost:8000/api/auth/login', {
  //         email,
  //         password,
  //         otp,
  //         device_fingerprint: deviceFingerprint,
  //         invite_token: !email.endsWith('@gmail.com') ? inviteToken : undefined
  //       });

  //       // Store the token and redirect
  //       await login(response.data.access_token);
  //       navigate('/admin/dashboard');
  //       toast.success('Login successful');

  //       // const result = await login(email, password, otp);
  //       // if (!result.success) {
  //       //   setError(result.error || 'Login failed');
  //       // }
  //     }
  //   } catch (err) {
  //     if (axios.isAxiosError(err)) {
  //       const errorMsg = err.response?.data?.detail || 'Login failed';
  //       setError(errorMsg);
  //       toast.error(errorMsg);
  //     } else {
  //       setError('An unexpected error occurred');
  //       toast.error('An unexpected error occurred');
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (step === 'credentials') {
        // Check if we need OTP or invite token
        const requiresOtp = email === 'rasikathakur303@gmail.com';
        const requiresInviteToken = !requiresOtp;

        if (requiresInviteToken && !inviteToken) {
          throw new Error('Invite token is required for this email');
        }

        const response = await axios.post('http://localhost:8000/api/auth/login', {
          email,
          password,
          device_fingerprint: deviceFingerprint,
          invite_token: requiresInviteToken ? inviteToken : undefined
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json', // Changed from form-urlencoded
          },
        });

        if (response.data.requires_otp) {
          setStep('otp');
          toast.success('OTP sent to your email');
        } else {
          // Handle direct login if no OTP required
          const authCheck = await login();
          if (authCheck.success) {
            navigate('/admin/dashboard');
            toast.success('Login successful');
          }
        }
      } else {
        // OTP verification step
        const response = await axios.post('http://localhost:8000/api/auth/login', {
          email,
          password,
          otp,
          device_fingerprint: deviceFingerprint
        },{
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // const meResponse = await axios.get('http://localhost:8000/api/auth/me', {
        //   withCredentials: true
        // });

        // if (meResponse.data) {
        //   await login();
        //   navigate('/admin/dashboard');
        //   toast.success('Login successful');
        // } else {
        //   throw new Error("Authentication failed after OTP verification");
        // }

        // After successful OTP verification, check auth status
        const authCheck = await login();
        if (authCheck.success) {
          navigate('/admin/dashboard');
          toast.success('Login successful');
        } else {
          throw new Error("Authentication failed after OTP verification");
        }

        

        // const authCheck = await login();
        // if (authCheck.success) {
        //   navigate('/admin/dashboard');
        //   toast.success('Login successful');
        // } else {
        //   throw new Error("Authentication failed after OTP verification");
        // }
      }
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || 
                      err.response?.data?.message || 
                      'Login failed';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  // In the handleSubmit function of AdminLogin.tsx
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError('');

//   try {
//     if (step === 'credentials') {
//       const isSpecialEmail = email === 'rasikathakur303@gmail.com';
      
//       const response = await axios.post('http://localhost:8000/api/auth/login', {
//         email,
//         password,
//         device_fingerprint: deviceFingerprint,
//         invite_token: !isSpecialEmail ? inviteToken : undefined
//       }, {
//         headers: {
//           'Content-Type': 'application/json', // Changed from form-urlencoded
//         },
//       });

//       if (response.data.requires_otp) {
//         setStep('otp');
//         toast.success('OTP sent to your email');
//       }
//     } else {
//       const isSpecialEmail = email === 'rasikathakur303@gmail.com';
      
//       const response = await axios.post('http://localhost:8000/api/auth/login', {
//         email,
//         password,
//         otp,
//         device_fingerprint: deviceFingerprint,
//         invite_token: !isSpecialEmail ? inviteToken : undefined
//       });

//       await login(response.data.access_token);
//       navigate('/admin/dashboard');
//       toast.success('Login successful');
//     }
//   } catch (err) {
//     if (axios.isAxiosError(err)) {
//       const errorData = err.response?.data;
//       const errorMsg = typeof errorData === 'object' 
//         ? errorData.detail || JSON.stringify(errorData)
//         : errorData || 'Login failed';
//       setError(errorMsg);
//       toast.error(errorMsg);
//       } else {
//         const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
//         setError(errorMsg);
//         toast.error(errorMsg);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

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

        {/* Right Side - Login Form */}
        <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
          <div className="w-full max-w-md space-y-6 p-8">
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Admin Login</h2>

            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            {/*<form onSubmit={handleSubmit} className="space-y-4">
              {step === 'credentials' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email*</label>
                    <input
                      type="email"
                      placeholder="admin@policyvault.com"
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
                </>
              ) : (
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
                ) : step === 'credentials' ? (
                  'Request OTP'
                ) : (
                  'Verify & Login'
                )}
              </button>

              {step === 'otp' && (
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-full text-[#1E3A8A] font-medium py-2 rounded-md hover:underline transition-colors"
                >
                  Back to email/password
                </button>
              )}
            </form>*/}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 'credentials' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email*</label>
                    <input
                      type="email"
                      placeholder="admin@policyvault.com"
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

                  {!email.endsWith('@gmail.com') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invite Token*
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your invite token"
                        value={inviteToken}
                        onChange={(e) => setInviteToken(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        required={!email.endsWith('@gmail.com')}
                      />
                    </div>
                  )}
                </>
              ) : (
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
                ) : step === 'credentials' ? (
                  'Request OTP'
                ) : (
                  'Verify & Login'
                )}
              </button>

              {step === 'otp' && (
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-full text-[#1E3A8A] font-medium py-2 rounded-md hover:underline transition-colors"
                >
                  Back to email/password
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      {/* <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      /> */}
    </div>
  );
};

export default AdminLogin;