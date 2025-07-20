// import React, { useRef, useState, useEffect } from 'react';
// import axios from 'axios';
// import ReCAPTCHA from 'react-google-recaptcha';
// import { useNavigate } from 'react-router-dom';

// const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const OrgLogin = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [apiKey, setApiKey] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const recaptchaRef = useRef<ReCAPTCHA | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('org_auth_token');
//     if (token) {
//       navigate('/org/dashboard', { replace: true }); 
//     }
//   }, []);

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

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       if (!recaptchaRef.current || typeof recaptchaRef.current.executeAsync !== 'function') {
//         throw new Error('Security check not loaded');
//       }

//       const captchaToken = await recaptchaRef.current.executeAsync();
//       if (!captchaToken) {
//         throw new Error('Failed to get security token');
//       }

//       const response = await axios.post(
//         `${API_BASE_URL}/org-auth/login`,
//         {
//           email,
//           password,
//           api_key: apiKey,
//           recaptcha_token: captchaToken,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           timeout: 15000,
//         }
//       );

//       if (response.status === 200) {
//         localStorage.setItem('org_auth_token', response.data.token);
//         localStorage.setItem('org_name', response.data.org_name || 'Organization');
//         navigate('/org/dashboard');
//       } else {
//         throw new Error(response.data?.detail || 'Login failed');
//       }
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error)) {
//         if (error.response) {
//           setError(error.response.data?.detail || 'Login failed');
//         } else if (error.request) {
//           setError('No response from server. Please try again.');
//         } else {
//           setError(error.message || 'Login failed');
//         }
//       } else if (error instanceof Error) {
//         setError(error.message);
//       }
//     } finally {
//       setIsLoading(false);
//       if (recaptchaRef.current && typeof recaptchaRef.current.reset === 'function') {
//         recaptchaRef.current.reset();
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
//       <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />
      
//       <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
//         {/* Left Side */}
//         <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
//           <div className="w-full h-full flex flex-col justify-between p-8">
//             <span className="flex items-center space-x-2 relative">
//               <div className="relative">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="32"
//                   height="32"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   className="lucide lucide-shield h-8 w-8 text-indigo-600 z-10 relative"
//                 >
//                   <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
//                 </svg>
//                 <div className="absolute inset-0 h-8 w-8 bg-indigo-600/30 rounded-full blur-sm z-0" />
//               </div>
//               <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
//                 PolicyVault
//               </h1>
//             </span>

//             <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
//               <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
//                 PolicyVault <span className="italic font-semibold text-white">NEXUS</span>
//               </h1>
//               <p className="text-md font-light text-white">
//                 Secure organization portal for managing data sharing policies.
//               </p>
//               <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
//                 Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Login Form */}
//         <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
//           <div className="w-full max-w-md space-y-6 p-8">
//             <h2 className="text-4xl font-bold text-[#1E3A8A]">Organization Login</h2>

//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleLogin} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Organization Email*</label>
//                 <input
//                   type="email"
//                   placeholder="admin@yourorg.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">API Key*</label>
//                 <input
//                   type="password"
//                   placeholder="Your organization API key"
//                   value={apiKey}
//                   onChange={(e) => setApiKey(e.target.value)}
//                   className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
//                   required
//                 />
//                 <p className="mt-1 text-xs text-gray-500">
//                   Find your API key in your organization dashboard
//                 </p>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`w-full bg-[#1E3A8A] text-white font-semibold py-3 rounded-md hover:bg-[#1E40AF] transition-colors ${
//                   isLoading ? 'opacity-70 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {isLoading ? 'Signing In...' : 'Sign In'}
//               </button>

//               <div className="text-center text-sm text-gray-600">
//                 Don't have an account?{' '}
//                 <a 
//                   href="/register-user" 
//                   className="text-[#1E3A8A] hover:underline font-medium"
//                 >
//                   Register your organization
//                 </a>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//       <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={RECAPTCHA_SITE_KEY} />
//     </div>
//   );
// };

// export default OrgLogin;

import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrgLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('org_auth_token');
    if (token) {
      navigate('/login-org', { replace: true });
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        `${API_BASE_URL}/org-auth/login`,
        {
          email,
          password,
          api_key: apiKey,
          recaptcha_token: captchaToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (response.status === 200) {
        console.log(response.data.token)
        localStorage.setItem('org_auth_token', response.data.token);
        localStorage.setItem('org_data', JSON.stringify(response.data.organization));
        navigate('/fiu-dashboard', { state: { orgData: response.data.organization } });
      } else {
        console.log("error:"+response.data.token)
        throw new Error(response.data?.detail || 'Login failed');
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />

      <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
        {/* Left Side */}
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
                PolicyVault <span className="italic font-semibold text-white">NEXUS</span>
              </h1>
              <p className="text-md font-light text-white">
                Secure organization portal for managing data sharing policies.
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
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Organization Login</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key*</label>
                <input
                  type="password"
                  placeholder="Your organization API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Find your API key in your organization dashboard
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#1E3A8A] text-white font-semibold py-3 rounded-md hover:bg-[#1E40AF] transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/register-user"
                  className="text-[#1E3A8A] hover:underline font-medium"
                >
                  Register your organization
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={RECAPTCHA_SITE_KEY} />
    </div>
  );
};

export default OrgLogin;
