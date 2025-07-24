// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import axios, { AxiosError } from 'axios';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// interface ApiErrorResponse {
//   message?: string;
//   detail?: string;
//   statusCode?: number;
// }

// const VerifyOrganization = () => {
//   const router = useRouter();
//   const { token } = router.query;
//   const [message, setMessage] = useState('Verifying your organization...');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);

//   useEffect(() => {
//     if (!token) return;

//     const verifyToken = async () => {
//       try {
//         const response = await axios.get(`${API_BASE_URL}/register_org/verify-org`, {
//           params: { token }
//         });

//         if (response.data.message === "Organization already verified") {
//           setMessage('Your organization has already been verified.');
//         } else {
//           setMessage('Your organization has been successfully verified!');
//         }
//       } catch (error) {
//         setIsError(true);
  
//         const axiosError = error as AxiosError<ApiErrorResponse>;
//       if (axiosError.response) {
//         switch (axiosError.response.status) {
//           case 400:
//             if (axiosError.response.data.detail === "Verification link has expired") {
//               setMessage('The verification link has expired. Please request a new one.');
//             } else {
//               setMessage('Invalid verification link.');
//             }
//             break;
//           case 404:
//             setMessage('Organization not found.');
//             break;
//           default:
//             setMessage(axiosError.response.data?.message || 'Verification failed. Please try again later.');
//         }
//           } else {
//             setMessage('Network error. Please check your connection and try again.');
//           }
//           } finally {
//             setIsLoading(false);
//           }
//         };

//     verifyToken();
//   }, [token]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
//       <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
//         <div className="mb-6">
//           <div className="flex justify-center">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="48"
//               height="48"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="#1E3A8A"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="mb-4"
//             >
//               <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">PolicyVault Nexus</h1>
//         </div>

//         {isLoading ? (
//           <div className="flex flex-col items-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
//             <p className="text-gray-700">{message}</p>
//           </div>
//         ) : (
//           <div>
//             <div className={`mb-6 p-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//               <p>{message}</p>
//             </div>
//             <button
//               onClick={() => router.push('/login-org')}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//             >
//               Go to Login
//             </button>
//           </div>
//         )}

//         <div className="mt-8 text-xs text-gray-500">
//           <p>Empowered by PolicyVault | Supported by Canara Bank</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyOrganization;

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiErrorResponse {
  message?: string;
  detail?: string;
  statusCode?: number;
}

const VerifyOrganization = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verifying your organization...');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/register_org/verify-org`, {
          params: { token }
        });

        if (response.data.verified) {
          setMessage('Your organization has been successfully verified!');
          setIsVerified(true);
        } else if (response.data.message === "Organization is already verified") {
          setMessage('Your organization is already verified.');
          setIsVerified(true);
        }
          else {
          setMessage(response.data.message || 'Verification completed');
        }
      } catch (error) {
        setIsError(true);
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response) {
          switch (axiosError.response.status) {
            case 400:
              if (axiosError.response.data.detail === "Verification link has expired") {
                setMessage('The verification link has expired. Please request a new one.');
              } else {
                setMessage('Invalid verification link.');
              }
              break;
            case 404:
              setMessage('Organization not found.');
              break;
            default:
              setMessage(axiosError.response.data?.message || 'Verification failed. Please try again later.');
          }
        } else {
          setMessage('Network error. Please check your connection and try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

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
                Verify your organization to complete registration.
              </p>
              <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
                Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Verification Status */}
        <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
          <div className="w-full max-w-md space-y-4 p-8">
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Verification Status</h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-700">{message}</p>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                <div className={`p-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  <p className="text-center">{message}</p>
                </div>
                
                {isVerified && (
                  <button
                    onClick={() => navigate('/login-org')}
                    className="w-full bg-[#1E3A8A] text-white py-3 rounded-md hover:bg-[#1E40AF] text-lg font-medium"
                  >
                    Proceed To Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOrganization;