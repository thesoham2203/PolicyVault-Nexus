// // import { useEffect, useState } from 'react';
// // import { useRouter } from 'next/router';

// import PasswordVaultView from "../PasswordView";

// // export default function PasswordView() {
// //   const router = useRouter();
// //   const { consent_id, token } = router.query;
// //   const [password, setPassword] = useState<string | null>(null);
// //   const [error, setError] = useState<string | null>(null);
// //   const [copied, setCopied] = useState(false);
// //   const [downloaded, setDownloaded] = useState(false);

// //   useEffect(() => {
// //     if (!consent_id || !token) return;

// //     // Fetch password from backend
// //     const fetchPassword = async () => {
// //       try {
// //         const response = await fetch(
// //           `http://localhost:8000/password/${consent_id}?token=${token}`,
// //           {
// //             headers: {
// //               'Accept': 'text/html'
// //             }
// //           }
// //         );

// //         if (!response.ok) {
// //           const errorData = await response.json();
// //           throw new Error(errorData.detail || 'Failed to fetch password');
// //         }

// //         const html = await response.text();
// //         // Extract password from HTML (temporary solution)
// //         const passwordMatch = html.match(/value="([^"]*)"/);
// //         if (passwordMatch && passwordMatch[1]) {
// //           setPassword(passwordMatch[1]);
// //         } else {
// //           throw new Error('Password not found in response');
// //         }
// //       } catch (err) {
// //         setError(err instanceof Error ? err.message : 'Unknown error occurred');
// //       }
// //     };

// //     fetchPassword();

// //     // Setup cleanup on window close
// //     const handleBeforeUnload = async () => {
// //       try {
// //         await fetch(`http://localhost:8000/api/cleanup/${consent_id}`, {
// //           method: 'DELETE',
// //           headers: {
// //             'Content-Type': 'application/json'
// //           }
// //         });
// //       } catch (err) {
// //         console.error('Cleanup failed:', err);
// //       }
// //     };

// //     window.addEventListener('beforeunload', handleBeforeUnload);

// //     return () => {
// //       window.removeEventListener('beforeunload', handleBeforeUnload);
// //       // Explicit cleanup if component unmounts
// //       handleBeforeUnload().catch(console.error);
// //     };
// //   }, [consent_id, token]);

// //   const copyPassword = () => {
// //     if (password) {
// //       navigator.clipboard.writeText(password);
// //       setCopied(true);
// //       setTimeout(() => setCopied(false), 2000);
// //     }
// //   };

// //   const downloadPassword = () => {
// //     if (password) {
// //       const blob = new Blob([password], { type: 'text/plain' });
// //       const url = URL.createObjectURL(blob);
// //       const a = document.createElement('a');
// //       a.href = url;
// //       a.download = `password_${consent_id}.txt`;
// //       document.body.appendChild(a);
// //       a.click();
// //       document.body.removeChild(a);
// //       setDownloaded(true);
// //       setTimeout(() => setDownloaded(false), 2000);
// //     }
// //   };

// //   if (error) {
// //     return (
// //       <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
// //         <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
// //         <p className="text-gray-700">{error}</p>
// //         <button
// //           onClick={() => router.push('/')}
// //           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
// //         >
// //           Return Home
// //         </button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
// //       <h1 className="text-2xl font-bold mb-4">Secure Password</h1>
      
// //       {password ? (
// //         <>
// //           <div className="flex items-center mb-4">
// //             <input
// //               type="text"
// //               value={password}
// //               readOnly
// //               className="border p-2 rounded-l w-full bg-gray-50"
// //             />
// //             <button
// //               onClick={copyPassword}
// //               className={`p-2 rounded-r ${copied ? 'bg-green-500' : 'bg-blue-500'} text-white`}
// //             >
// //               {copied ? 'Copied!' : 'Copy'}
// //             </button>
// //           </div>
// //           <button
// //             onClick={downloadPassword}
// //             className={`w-full p-2 rounded mb-4 ${downloaded ? 'bg-green-500' : 'bg-blue-500'} text-white`}
// //           >
// //             {downloaded ? 'Downloaded!' : 'Download Password'}
// //           </button>
// //           <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
// //             <p>⚠️ This password will be permanently deleted when you close this tab.</p>
// //             <p>⚠️ Make sure to save it if you need future access.</p>
// //           </div>
// //         </>
// //       ) : (
// //         <div className="text-center py-8">
// //           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
// //           <p className="mt-4 text-gray-600">Loading secure password...</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';

// export default function PasswordView() {
//   const router = useRouter();
//   const { consent_id, token } = router.query;
//   const [password, setPassword] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [downloaded, setDownloaded] = useState(false);

//   useEffect(() => {
//     if (!consent_id || !token) return;

//     const fetchPassword = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:8000/password/${consent_id}?token=${token}`,
//           {
//             headers: {
//               'Accept': 'application/json'
//             }
//           }
//         );

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.detail || 'Failed to fetch password');
//         }

//         const data = await response.json();
//         setPassword(data.password);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Unknown error occurred');
//       }
//     };

//     fetchPassword();

//     const handleBeforeUnload = async () => {
//       try {
//         await fetch(`http://localhost:8000/api/cleanup/${consent_id}`, {
//           method: 'DELETE',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           credentials: 'include'
//         });
//       } catch (err) {
//         console.error('Cleanup failed:', err);
//       }
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//       handleBeforeUnload().catch(console.error);
//     };
//   }, [consent_id, token]);

//   const copyPassword = () => {
//     if (password) {
//       navigator.clipboard.writeText(password);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const downloadPassword = () => {
//     if (password) {
//       const blob = new Blob([password], { type: 'text/plain' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `password_${consent_id}.txt`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       setDownloaded(true);
//       setTimeout(() => setDownloaded(false), 2000);
//     }
//   };

//   if (error) {
//     return (
//       <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
//         <p className="text-gray-700">{error}</p>
//         {error.includes('already accessed') && (
//           <p className="text-sm text-gray-500 mt-2">
//             This password link can only be used once.
//           </p>
//         )}
//         <button
//           onClick={() => router.push('/')}
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Return Home
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">Secure Password</h1>
      
//       {password ? (
//         <>
//           <div className="flex items-center mb-4">
//             <input
//               type="text"
//               value={password}
//               readOnly
//               className="border p-2 rounded-l w-full bg-gray-50"
//             />
//             <button
//               onClick={copyPassword}
//               className={`p-2 rounded-r ${copied ? 'bg-green-500' : 'bg-blue-500'} text-white`}
//             >
//               {copied ? '✓ Copied' : 'Copy'}
//             </button>
//           </div>
//           <div className="flex space-x-4 mb-4">
//             <button
//               onClick={downloadPassword}
//               className={`flex-1 p-2 rounded ${downloaded ? 'bg-green-500' : 'bg-blue-500'} text-white`}
//             >
//               {downloaded ? '✓ Downloaded' : 'Download'}
//             </button>
//           </div>
//           <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
//             <p>⚠️ This password will be deleted when you close this tab</p>
//             <p>⚠️ Make sure to save it if you need future access</p>
//           </div>
//         </>
//       ) : (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading secure password...</p>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

export default function PasswordVaultView() {
  const { consent_id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!consent_id || !token) return;

    const fetchPassword = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/password-vault/${consent_id}?token=${token}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch password');
        }

        const data = await response.json();
        setPassword(data.password);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    fetchPassword();
  }, [consent_id, token]);


  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPassword = () => {
    if (password) {
      const blob = new Blob([password], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `password_${consent_id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-700">{error}</p>
        {error.includes('already accessed') && (
          <p className="text-sm text-gray-500 mt-2">
            This password link can only be used once.
          </p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Secure Vault Password</h1>
      
      {password ? (
        <>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={password}
              readOnly
              className="border p-2 rounded-l w-full bg-gray-50"
            />
            <button
              onClick={copyPassword}
              className={`p-2 rounded-r ${copied ? 'bg-green-500' : 'bg-blue-500'} text-white`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={downloadPassword}
              className={`flex-1 p-2 rounded ${downloaded ? 'bg-green-500' : 'bg-blue-500'} text-white`}
            >
              {downloaded ? '✓ Downloaded' : 'Download'}
            </button>
          </div>
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
            <p>⚠️ This password will be deleted when you close this tab</p>
            <p>⚠️ Make sure to save it if you need future access</p>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading secure password...</p>
        </div>
      )}
    </div>
  );
}


// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';

// export default function PasswordVaultView() {
//   const router = useRouter();
//   const { consent_id } = router.query;
//   const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;
//   const [password, setPassword] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [downloaded, setDownloaded] = useState(false);

//   useEffect(() => {
//     if (!consent_id || !token) return;

//     const fetchPassword = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:8000/password-vault/${consent_id}?token=${token}`,
//           {
//             headers: {
//               'Accept': 'application/json'
//             }
//           }
//         );

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.detail || 'Failed to fetch password');
//         }

//         const data = await response.json();
//         setPassword(data.password);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Unknown error occurred');
//       }
//     };

//     fetchPassword();

//     // const handleBeforeUnload = async () => {
//     //   try {
//     //     await fetch(`http://localhost:8000/api/cleanup/${consent_id}`, {
//     //       method: 'DELETE',
//     //       headers: {
//     //         'Content-Type': 'application/json'
//     //       },
//     //       credentials: 'include'
//     //     });
//     //   } catch (err) {
//     //     console.error('Cleanup failed:', err);
//     //   }
//     // };

//     // window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       // window.removeEventListener('beforeunload', handleBeforeUnload);
//       // handleBeforeUnload().catch(console.error);
//     };
//   }, [consent_id, token]);

//   const copyPassword = () => {
//     if (password) {
//       navigator.clipboard.writeText(password);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   const downloadPassword = () => {
//     if (password) {
//       const blob = new Blob([password], { type: 'text/plain' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `password_${consent_id}.txt`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       setDownloaded(true);
//       setTimeout(() => setDownloaded(false), 2000);
//     }
//   };

//   if (error) {
//     return (
//       <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
//         <p className="text-gray-700">{error}</p>
//         {error.includes('already accessed') && (
//           <p className="text-sm text-gray-500 mt-2">
//             This password link can only be used once.
//           </p>
//         )}
//         <button
//           onClick={() => router.push('/')}
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Return Home
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">Secure Vault Password</h1>
      
//       {password ? (
//         <>
//           <div className="flex items-center mb-4">
//             <input
//               type="text"
//               value={password}
//               readOnly
//               className="border p-2 rounded-l w-full bg-gray-50"
//             />
//             <button
//               onClick={copyPassword}
//               className={`p-2 rounded-r ${copied ? 'bg-green-500' : 'bg-blue-500'} text-white`}
//             >
//               {copied ? '✓ Copied' : 'Copy'}
//             </button>
//           </div>
//           <div className="flex space-x-4 mb-4">
//             <button
//               onClick={downloadPassword}
//               className={`flex-1 p-2 rounded ${downloaded ? 'bg-green-500' : 'bg-blue-500'} text-white`}
//             >
//               {downloaded ? '✓ Downloaded' : 'Download'}
//             </button>
//           </div>
//           <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
//             <p>⚠️ This password will be deleted when you close this tab</p>
//             <p>⚠️ Make sure to save it if you need future access</p>
//           </div>
//         </>
//       ) : (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading secure password...</p>
//         </div>
//       )}
//     </div>
//   );
// }