// import React, { useState, useEffect } from 'react';
// import { Clock, Building, Database, Calendar, Check, X, AlertCircle, Sparkles } from 'lucide-react';
// import axios from 'axios';

// interface ConsentRequest {
//   id: string;
//   fiu_name: string;
//   status: string;
//   data_fields: string[];
//   purpose: string;
//   requested_date: string;
//   expiry_date: string;
//   days_remaining: number;
// }

// interface PendingRequestsProps {
//   currentUserId: string;
// }
// // // Mock ConsentRequest type
// // interface ConsentRequest {
// //   id: string;
// //   fiuName: string;
// //   status: string;
// //   dataFields: string[];
// //   purpose: string;
// //   requestedDate: string;
// //   expiryDate: string;
// // }

// // interface PendingRequestsProps {
// //   requests: ConsentRequest[];
// //   onApproveRequest: (requestId: string) => void;
// //   onRejectRequest: (requestId: string, reason?: string) => void;
// // }

// const PendingRequests: React.FC<PendingRequestsProps> = ({
//   currentUserId
// }) => {
//   // const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
//   // const [rejectionReason, setRejectionReason] = useState('');
//   const [requests, setRequests] = useState<ConsentRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
//   const [rejectionReason, setRejectionReason] = useState('');

//   // useEffect(() => {
//   //   const fetchPendingConsents = async () => {
//   //     try {
//   //       const response = await axios.get(`http://localhost:8000/api/consents/pending`, {
//   //         params: { current_user_id: currentUserId }
//   //       });
//   //       setRequests(response.data);
//   //     } catch (error) {
//   //       console.error('Error fetching pending consents:', error);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchPendingConsents();
//   // }, [currentUserId]);

//   // const handleApprove = async (requestId: string) => {
//   //   try {
//   //     await axios.put(`http://localhost:8000/api/consents/${requestId}/status`, {
//   //       status: "APPROVED"
//   //     });
//   //     setRequests(requests.filter(req => req.id !== requestId));
//   //   } catch (error) {
//   //     console.error('Error approving consent:', error);
//   //   }
//   // };

//   // const handleReject = async (requestId: string) => {
//   //   try {
//   //     await axios.put(`http://localhost:8000/api/consents/${requestId}/status`, {
//   //       status: "REJECTED",
//   //       rejection_reason: rejectionReason
//   //     });
//   //     setRequests(requests.filter(req => req.id !== requestId));
//   //     setRejectingRequest(null);
//   //     setRejectionReason('');
//   //   } catch (error) {
//   //     console.error('Error rejecting consent:', error);
//   //   }
//   // };

//   //const pendingRequests = requests.filter(req => req.status === 'PENDING');
  
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getDaysUntilExpiry = (expiryDate: string) => {
//     const expiry = new Date(expiryDate);
//     const today = new Date();
//     const diffTime = expiry.getTime() - today.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   // const handleReject = (requestId: string) => {
//   //   onRejectRequest(requestId, rejectionReason);
//   //   setRejectingRequest(null);
//   //   setRejectionReason('');
//   // };

//   //const pendingRequests = requests.filter(req => req.status === 'pending');

  
//   useEffect(() => {
//     const fetchPendingConsents = async () => {
//       try {
//         const response = await axios.get(`http://localhost:8000/api/consents/pending`, {
//           params: { current_user_id: currentUserId }
//         });
//         setRequests(response.data);
//       } catch (error) {
//         console.error('Error fetching consents:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPendingConsents();
//   }, [currentUserId]);

//   const handleApprove = async (requestId: string) => {
//     try {
//       await axios.put(`http://localhost:8000/api/consents/${requestId}/status`, {
//         status: "APPROVED"
//       });
//       setRequests(prev => prev.filter(req => req.id !== requestId));
//     } catch (error) {
//       console.error('Error approving:', error);
//     }
//   };

//   const handleReject = async (requestId: string) => {
//     try {
//       await axios.put(`http://localhost:8000/api/consents/${requestId}/status`, {
//         status: "REJECTED",
//         rejection_reason: rejectionReason
//       });
//       setRequests(prev => prev.filter(req => req.id !== requestId));
//       setRejectingRequest(null);
//       setRejectionReason('');
//     } catch (error) {
//       console.error('Error rejecting:', error);
//     }
//   };

//   const pendingRequests = requests.filter(req => req.status === 'PENDING');

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-transparent">
//       <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
//         {/* Header Section */}
//         <div className="mb-6 sm:mb-8">
//           {pendingRequests.length > 0 && (
//             <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
//               <div className="flex items-center gap-2 sm:gap-3">
//                 <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
//                   <AlertCircle size={14} className="sm:w-4 sm:h-4 text-white" />
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium leading-tight">
//                   You have {pendingRequests.length} pending consent request{pendingRequests.length !== 1 ? 's' : ''} awaiting your review.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Requests Grid */}
//         {pendingRequests.length > 0 ? (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//             {pendingRequests.map((request) => (
//         <div key={request.id} className="...">
//           {/* Header */}
//           <div className="...">
//             <div className="...">
//               <h3 className="...">{request.fiu_name}</h3>
//             </div>
//           </div>

//           {/* Data Fields */}
//           <div className="...">
//             <label className="...">Data Requested</label>
//             <div className="flex flex-wrap gap-2 sm:gap-3">
//               {request.data_fields.map((field) => (
//                 <span
//                   key={field}
//                   className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl font-medium border
//                     ${field.startsWith('Other:') ? 
//                       'bg-blue-800 text-blue-100 border-blue-700' : 
//                       'bg-gradient-to-r from-blue-400/30 to-blue-500/30 text-blue-700 dark:text-blue-200 border-blue-300/50 dark:border-blue-400/20'
//                     }`}
//                 >
//                   <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
//                   <span className="leading-none">{field}</span>
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Purpose */}
//           <div className="...">
//             <label className="...">Purpose</label>
//             <div className="...">
//               <p className="...">{request.purpose}</p>
//             </div>
//           </div>

//           {/* Dates */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//             <div className="...">
//               <label className="...">Requested On</label>
//               <p className="...">{request.requested_date}</p>
//             </div>
//             <div className="...">
//               <label className="...">Valid Until</label>
//               <p className="...">{request.expiry_date}</p>
//               <p className="...">
//                 ({request.days_remaining} days remaining)
//               </p>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="...">
//             <button onClick={() => handleApprove(request.id)} className="...">
//               <Check size={16} />
//               Approve
//             </button>
//             <button onClick={() => setRejectingRequest(request.id)} className="...">
//               <X size={16} />
//               Reject
//             </button>
//           </div>
//         </div>
//       ))}
            
//           </div>
//         ) : (
//           <div className="text-center py-12 sm:py-16 lg:py-24 px-4">
//             <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-lg border border-white/30 dark:border-white/10">
//               <Clock size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-500 dark:text-gray-300" />
//             </div>
//             <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4">No pending requests</h3>
//             <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-sm sm:max-w-md lg:max-w-lg mx-auto leading-relaxed">
//               When financial institutions request access to your data, they'll appear here for your review and approval.
//             </p>
//           </div>
//         )}

//         {/* Rejection Modal */}
//         {rejectingRequest && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
//             <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full border border-white/50 dark:border-white/10 mx-3">
//               <div className="p-4 sm:p-6 lg:p-8">
//                 <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Reject Consent Request</h3>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
//                   Are you sure you want to reject this consent request? You can optionally provide a reason.
//                 </p>

//                 <div className="mb-4 sm:mb-6 lg:mb-8">
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">
//                     Reason (Optional)
//                   </label>
//                   <textarea
//                     value={rejectionReason}
//                     onChange={(e) => setRejectionReason(e.target.value)}
//                     placeholder="e.g., Don't need this service right now"
//                     className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:text-white resize-none transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-300 text-sm sm:text-base"
//                     rows={3}
//                   />
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                   <button
//                     onClick={() => {
//                       setRejectingRequest(null);
//                       setRejectionReason('');
//                     }}
//                     className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base touch-manipulation"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={() => handleReject(rejectingRequest)}
//                     className="flex-1 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-blue-600/90 hover:to-blue-700/90 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 border border-blue-400/30 text-sm sm:text-base touch-manipulation"
//                   >
//                     Reject Request
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Mock data for demonstration
// const mockRequests: ConsentRequest[] = [
//   {
//     id: '1',
//     fiuName: 'ABC Bank',
//     status: 'pending',
//     dataFields: ['Account Balance', 'Transaction History', 'Personal Details'],
//     purpose: 'To process your loan application and assess creditworthiness based on your financial history and current account standing.',
//     requestedDate: '2024-06-20',
//     expiryDate: '2024-07-20'
//   },
//   {
//     id: '2',
//     fiuName: 'XYZ Financial Services',
//     status: 'pending',
//     dataFields: ['Income Details', 'Investment Portfolio'],
//     purpose: 'To provide personalized investment recommendations and portfolio management services.',
//     requestedDate: '2024-06-21',
//     expiryDate: '2024-08-21'
//   }
// ];

// export default function App() {
//   const handleApprove = (requestId: string) => {
//     console.log('Approved request:', requestId);
//   };

//   const handleReject = (requestId: string, reason?: string) => {
//     console.log('Rejected request:', requestId, 'Reason:', reason);
//   };

//   return (
//     <PendingRequests 
//       requests={mockRequests}
//       onApproveRequest={handleApprove}
//       onRejectRequest={handleReject}
//     />
//   );
// }

// // {pendingRequests.map((request) => (
// //               <div 
// //                 key={request.id}
// //                 className="relative flex flex-col justify-between h-full bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
// //               >
// //                 {/* Consistent glow effect */}
// //                 <div className="absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-r from-blue-400/10 via-blue-500/10 to-blue-600/10 -z-10 blur-xl"></div>
                
// //                 <div className="flex flex-col flex-grow">
// //                   {/* Header */}
// //                   <div className="flex items-start justify-between mb-4 sm:mb-6 lg:mb-8">
// //                     <div className="flex items-center gap-3 sm:gap-4">
// //                     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
// //                     <Building size={20} className="text-white" />
// //                   </div>
// //                       <div className="min-w-0">
// //                         <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{request.fiuName}</h3>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   {/* Request Details */}
// //                   <div className="flex flex-col flex-grow justify-between space-y-4 sm:space-y-6 mb-4 sm:mb-6 lg:mb-8">
// //                     <div className="space-y-4 sm:space-y-6">
// //                       <div>
// //                         <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3 sm:mb-4">
// //                           <Database size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
// //                           Data Requested
// //                         </label>
// //                         <div className="flex flex-wrap gap-2 sm:gap-3">
// //                           {request.dataFields.map((field) => (
// //                             <span
// //                               key={field}
// //                               className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-400/30 to-blue-500/30 backdrop-blur-sm text-blue-700 dark:text-blue-200 rounded-lg sm:rounded-xl font-medium border border-blue-300/50 dark:border-blue-400/20 hover:bg-blue-400/40 transition-colors duration-300"
// //                             >
// //                               <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
// //                               <span className="leading-none">{field}</span>
// //                             </span>
// //                           ))}
// //                         </div>
// //                       </div>

// //                       <div>
// //                         <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3 block">Purpose</label>
// //                         <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 dark:border-white/10">
// //                           <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
// //                             {request.purpose}
// //                           </p>
// //                         </div>
// //                       </div>

// //                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
// //                         <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 dark:border-white/10">
// //                           <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 sm:mb-2 block">Requested On</label>
// //                           <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 font-medium">{formatDate(request.requestedDate)}</p>
// //                         </div>
// //                         <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 dark:border-white/10">
// //                           <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
// //                             <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
// //                             Valid Until
// //                           </label>
// //                           <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 font-medium">{formatDate(request.expiryDate)}</p>
// //                           <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
// //                             ({getDaysUntilExpiry(request.expiryDate)} days remaining)
// //                           </p>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   {/* Action Buttons */}
// //                   <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
// //                   <button
// //                   onClick={() => onApproveRequest(request.id)}
// //                   className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02]"
// //                 >
// //                   <Check size={16} />
// //                   Approve
// //                 </button>
// //                 <button
// //                   onClick={() => setRejectingRequest(request.id)}
// //                   className="flex-1 inline-flex items-center justify-center gap-2 border border-red-300 dark:border-red-600/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-[1.02]"
// //                 >
// //                   <X size={16} />
// //                   Reject
// //                 </button>
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}

import React, { useState, useEffect } from 'react';
import { Clock, Building, Database, Calendar, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

interface DataField {
  name: string;
  value?: string;
}

interface ConsentRequest {
  id: string;
  fiu_name: string;
  status: string;
  data_fields: DataField[];
  purpose: string;
  requested_date: string;
  expiry_date: string;
  days_remaining: number;
}

interface PendingRequestsProps {
  currentUserId: string;
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ currentUserId }) => {
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  //useEffect(() => {
  //   const fetchPendingConsents = async () => {
  // try {
  //         const response = await axios.get(`http://localhost:8000/pending?current_user_id=${currentUserId}`);
  //         // const response = await axios.get(`http://localhost:8000/pending`, {
  //         //   headers: {
  //         //     'Content-Type': 'application/json',
  //         //     'Accept': 'application/json'
  //         //   }
  //         // });
  //         setRequests(response.data);
  //       } catch (error) {
  //         console.error('Error fetching pending consents:', error);
  //         // Add error state handling if needed
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //   fetchPendingConsents();
  // }, [currentUserId]);

  useEffect(() => {
  // console.log('Current User ID:', currentUserId); // Verify this is correct
  const current_User_Id = localStorage.getItem("customer_id");
  console.log('Current User ID:', current_User_Id);
  const fetchPendingConsents = async () => {
    try {
      console.log('Making API call...');
      const response = await axios.get(`http://localhost:8000/pending?current_user_id=${current_User_Id}`);
      console.log('API Response:', response);
      setRequests(response.data);
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
    }
  };
  fetchPendingConsents();
  }, [currentUserId]);

  const handleApprove = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:8000/${requestId}/status`, {
        status: "APPROVED"
      });
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error approving consent:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:8000/${requestId}/status`, {
        status: "REJECTED",
        rejection_reason: rejectionReason
      });
      setRequests(requests.filter(req => req.id !== requestId));
      setRejectingRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting consent:', error);
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'PENDING');

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-transparent flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          {pendingRequests.length > 0 && (
            <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4 text-white" />
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium leading-tight">
                  You have {pendingRequests.length} pending consent request{pendingRequests.length !== 1 ? 's' : ''} awaiting your review.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Requests Grid */}
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                {/* Header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner border border-white/30 dark:border-white/10 flex-shrink-0">
                    <Building size={18} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{request.fiu_name}</h3>
                </div>

                {/* Data Fields */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Data Requested</label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {request.data_fields.map((field, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl font-medium border
                          ${field.name === "Other" ? 
                            'bg-blue-800 text-blue-100 border-blue-700' : 
                            'bg-gradient-to-r from-blue-400/30 to-blue-500/30 text-blue-700 dark:text-blue-200 border-blue-300/50 dark:border-blue-400/20'
                          }`}
                      >
                        <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="leading-none">
                          {field.name === "Other" ? `Other: ${field.value}` : field.name}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Purpose */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Purpose</label>
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">{request.purpose}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Requested On</label>
                    <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">{request.requested_date}</p>
                  </div>
                  <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Valid Until</label>
                    <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">{request.expiry_date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ({request.days_remaining} days remaining)
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 sm:gap-4">
                  <button 
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-green-600/90 hover:to-green-700/90 transition-all duration-300 shadow-lg hover:shadow-green-500/30 border border-green-400/30 text-sm sm:text-base"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button 
                    onClick={() => setRejectingRequest(request.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-red-600/90 hover:to-red-700/90 transition-all duration-300 shadow-lg hover:shadow-red-500/30 border border-red-400/30 text-sm sm:text-base"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 lg:py-24 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-lg border border-white/30 dark:border-white/10">
              <Clock size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-500 dark:text-gray-300" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4">No pending requests</h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-sm sm:max-w-md lg:max-w-lg mx-auto leading-relaxed">
              When financial institutions request access to your data, they'll appear here for your review and approval.
            </p>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full border border-white/50 dark:border-white/10 mx-3">
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Reject Consent Request</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                  Are you sure you want to reject this consent request? You can optionally provide a reason.
                </p>

                <div className="mb-4 sm:mb-6 lg:mb-8">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g., Don't need this service right now"
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:text-white resize-none transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-300 text-sm sm:text-base"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setRejectingRequest(null);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(rejectingRequest)}
                    className="flex-1 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-blue-600/90 hover:to-blue-700/90 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 border border-blue-400/30 text-sm sm:text-base"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;