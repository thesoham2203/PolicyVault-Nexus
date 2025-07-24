// import React, { useRef, useState, useEffect } from 'react';
// import axios from 'axios';
// import ReCAPTCHA from 'react-google-recaptcha';
// import OTPBox from './OTPBox';
// import { useNavigate } from 'react-router-dom'; 
// // declare const grecaptcha: ReCAPTCHA | undefined;

// const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const Login = () => {
//   const [account, setAccount] = useState('');
//   const [otpStep, setOtpStep] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [resendCount, setResendCount] = useState(0);
//   const recaptchaRef = useRef<ReCAPTCHA>(null);
//   const navigate = useNavigate();
//   // Ensure reCAPTCHA script is loaded
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
//     script.async = true;
//     script.defer = true;
//     document.head.appendChild(script);

//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   const handleCaptchaAndSubmit = async () => {
//     setIsLoading(true);
//     setError('');

//     try {
//       // Verify reCAPTCHA is loaded
//       // if (!window.grecaptcha || !recaptchaRef.current) {
//       //   throw new Error('reCAPTCHA not loaded. Please refresh the page.');
//       // }

//       // // Get reCAPTCHA token with proper typing
//       // const captchaToken1 = await recaptchaRef.current.executeAsync();
//       // if (!captchaToken1) {
//       //   throw new Error('Failed to get reCAPTCHA token');
//       // }


//       // Get reCAPTCHA token with timeout
//       // const captchaToken = await Promise.race([
//       //   recaptchaRef.current?.executeAsync(),
//       //   new Promise((_, reject) => 
//       //     setTimeout(() => reject(new Error('reCAPTCHA timeout')), 10000)
//       // )]);

//       if (!recaptchaRef.current) {
//         throw new Error('Security check not loaded');
//       }

//       const captchaToken = await recaptchaRef.current.executeAsync();
//       if (!captchaToken) {
//         throw new Error('Failed to get security token');
//       }



//       const response = await axios.post(
//         `${API_BASE_URL}/auth/start-login`,
//         {
//           account_number: account,
//           recaptcha_token: captchaToken,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           //withCredentials: true,
//           timeout: 15000,
//         }
//       );

//       if (response.status !== 200) {
//         throw new Error(response.data?.detail || 'Login failed');
//       }

//       setOtpStep(true);
//       console.log(response.data.message, 'OTP sent');
//     } catch (error) {
//       //console.error('Login error:', error);
      
//       if (axios.isAxiosError(error)) {
//         if (error.response) {
//           setError(error.response.data?.detail || 'Login failed');
//         console.error('Backend error:', error.response.data);
//       } else if (error.request) {
//         // No response received
//         setError('No response from server. Please try again.');
//       } else {
//         // Other Axios errors
//         setError(error.message || 'Login failed');
//       }
//     } else if (error instanceof Error) {
//       setError(error.message);
//     }
//     console.error('Login error:', error);
//   } finally {
//     setIsLoading(false);
//     recaptchaRef.current?.reset();
//   }
// };

//   // const handleOtpVerify = async (otp: string) => {
//   //   try {
//   //     const res = await axios.post(
//   //       `${API_BASE_URL}/auth/verify-otp`,
//   //       {
//   //         account_number: account,
//   //         otp,
//   //       },
//   //       {
//   //         headers: {
//   //           'Content-Type': 'application/json',
//   //         },
//   //         withCredentials: true,
//   //       }
//   //     );

//   //     localStorage.setItem('auth_token', res.data.token);
//   //     window.location.href = '/'; // Redirect to dashboard
//   //   } catch (err) {
//   //     if (axios.isAxiosError(err)) {
//   //       alert(err.response?.data?.detail || 'OTP Verification failed');
//   //     } else {
//   //       console.error('Unexpected error:', err);
//   //       alert('Unexpected error occurred.');
//   //     }
//   //   }
//   // };

//   const handleOtpVerify = async (otp: string) => {
//   try {
//     // Clean the OTP input
//     const cleanedOtp = otp.trim().replace(/\s/g, '');
    
//     if (cleanedOtp.length !== 6) {
//       alert('OTP must be 6 digits');
//       return;
//     }

//     const response = await axios.post(
//       `${API_BASE_URL}/auth/verify-otp`,
//       {
//         account_number: account.trim(),
//         otp: cleanedOtp,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         timeout: 10000,
//       }
//     );

//     if (response.status === 200) {
//       localStorage.setItem('auth_token', response.data.token);
//       //window.location.href = '/';
//       navigate('/user');
//     } else {
//       throw new Error(response.data?.detail || 'Verification failed');
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (error.response) {
//         // Handle specific error codes
//         if (error.response.status === 404) {
//           alert('Session expired. Please login again.');
//           navigate('/');
//           setOtpStep(false);
//         } else if (error.response.status === 400) {
//           alert(error.response.data?.detail || 'Invalid OTP');
//           navigate('/');
//         } else {
//           alert(error.response.data?.detail || 'Verification failed');
//           navigate('/');
//         }
//       } else if (error.request) {
//         alert('No response from server. Please try again.');
//         navigate('/');
//       } else {
//         alert('Request setup error: ' + error.message);
//         navigate('/');
//       }
//     } else {
//       console.error('Unexpected error:', error);
//       alert('An unexpected error occurred');
//       navigate('/');
//     }
//   }
// };

//   const handleResend = async () => {
//     setResendCount(prev => prev + 1);
//     await handleCaptchaAndSubmit();
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center px-4">
//       <div className="max-w-md w-full space-y-6 p-6 bg-white shadow rounded-lg border border-gray-200">
//         <h2 className="text-xl font-bold text-center text-gray-800">Login to PolicyVault</h2>
        
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//             {error}
//           </div>
//         )}

//         {!otpStep ? (
//           <>
//             <input
//               type="text"
//               placeholder="Enter Account Number"
//               value={account}
//               onChange={(e) => setAccount(e.target.value)}
//               className="w-full px-4 py-3 border rounded-md shadow focus:outline-none"
//             />
//             <button
//               onClick={handleCaptchaAndSubmit}
//               disabled={isLoading}
//               className={`w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               {isLoading ? 'Processing...' : 'Continue'}
//             </button>
//           </>
//         ) : (
//           <OTPBox
//             onSubmit={handleOtpVerify}
//             onResend={handleResend}
//             allowResend={true}
//             resendUsed={resendCount >= 1}
//           />
//         )}
//       </div>

//       <ReCAPTCHA
//         ref={recaptchaRef}
//         size="invisible"
//         sitekey={RECAPTCHA_SITE_KEY}
//       />
//     </div>
//   );
// };

// export default Login;

// EnhancedLogin.tsx (Updated)
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import OTPBox from './OTPBox';
import { useNavigate } from 'react-router-dom';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [account, setAccount] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/user', { replace: true }); 
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCaptchaAndSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (!recaptchaRef.current || typeof recaptchaRef.current.executeAsync !== 'function') {
        throw new Error('Security check not loaded');
      }

      const captchaToken = await recaptchaRef.current.executeAsync();
      if (!captchaToken) {
        throw new Error('Failed to get security token');
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/start-login`,
        {
          account_number: account,
          recaptcha_token: captchaToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data?.detail || 'Login failed');
      }

      setOtpStep(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(error.response.data?.detail || 'Login failed');
        } else if (error.request) {
          setError('No response from server. Please try again.');
        } else {
          setError(error.message || 'Login failed');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      if (recaptchaRef.current && typeof recaptchaRef.current.reset === 'function') {
        recaptchaRef.current.reset();
      }
    }
  };

  const handleOtpVerify = async (otp: string) => {
    try {
      const cleanedOtp = otp.trim().replace(/\s/g, '');

      if (cleanedOtp.length !== 6) {
        alert('OTP must be 6 digits');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/verify-otp`,
        {
          account_number: account.trim(),
          otp: cleanedOtp,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        console.log(response.data.token)
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('customer_name', response.data.customer_name || 'User');
        localStorage.setItem('customer_id', response.data.customer_id)
        // // 🔁 Force hard reload so Header picks up new value
        // window.location.replace('/user');
        navigate('/user');
      } else {
        throw new Error(response.data?.detail || 'Verification failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.'+error);
      navigate('/');
    }
  };

  const handleResend = async () => {
    setResendCount(prev => prev + 1);
    await handleCaptchaAndSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />
          {/* <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden shadow-lg border"> */}
          <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">

            {/* Left Side */}
              <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
              {/* <div className="w-1/2 bg-[url('/src/assets/bg.png')] bg-cover bg-center flex items-center justify-center"> */}

                <div className="w-full h-full flex flex-col justify-between p-8">
                  {/* <img src="/logo.svg" alt="Logo" className="h-10" /> */}
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield h-6 w-6 text-indigo-500"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg> */}
                  {/* <span> */}
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-shield h-8 w-8 text-indigo-600"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg> */}
                  {/* <div className="absolute inset-0 h-8 w-8 bg-indigo-600/20 rounded-full blur-sm"></div> */}
                  {/* <h1 class="text-gray-600 dark:text-gray-300 font-bold ">POLICYVAULT</h1> */}
                  {/* <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">PolicyVault</h1> */}
                  {/* </span> */}
                  <span className="flex items-center space-x-2 relative">
                    {/* SVG with shadow effect */}
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

                        {/* Text beside the icon */}
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                          PolicyVault
                        </h1>
                      </span>

            <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
              {/* <h1 className="text-3xl font-bold mb-4">PolicyVault NEXUS</h1> */}
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
                PolicyVault <span className="italic font-semibold text-white">NEXUS</span>
                </h1>

                <p className="text-md font-light text-white">
                  Empowering secure, consent-based data sharing between users and financial institutions.
                </p>
                <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
                  Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
                </div>

            </div>
          </div>
      </div>

        {/* Right Side */}
        <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
          <div className="w-full max-w-md space-y-6 p-8">
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Sign In</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            {!otpStep ? (
              <>
                <input
                  type="text"
                  placeholder="Account Number (e.g., CNRB100XXXX)"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md shadow focus:outline-none"
                />
                <button
                  onClick={handleCaptchaAndSubmit}
                  disabled={isLoading}
                  className={`w-full bg-[#1E3A8A] text-[#DBEAFE] font-semibold py-3 rounded hover:bg-[#DBEAFE] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                </button>
              </>
            ) : (
              <OTPBox
                onSubmit={handleOtpVerify}
                onResend={handleResend}
                allowResend={true}
                resendUsed={resendCount >= 1}
              />
            )}
          </div>
        </div>
      </div>
      <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={RECAPTCHA_SITE_KEY} />
    </div>
  );
};

export default Login;
