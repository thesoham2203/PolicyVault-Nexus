// import React, { useState } from 'react';
// import { Clock, Building, Database, Calendar, Check, X, AlertCircle, Sparkles } from 'lucide-react';

// // Mock ConsentRequest type
// interface ConsentRequest {
//   id: string;
//   fiuName: string;
//   status: string;
//   dataFields: string[];
//   purpose: string;
//   requestedDate: string;
//   expiryDate: string;
// }

// interface PendingRequestsProps {
//   requests: ConsentRequest[];
//   onApproveRequest: (requestId: string) => void;
//   onRejectRequest: (requestId: string, reason?: string) => void;
// }

// const PendingRequests: React.FC<PendingRequestsProps> = ({
//   requests,
//   onApproveRequest,
//   onRejectRequest
// }) => {
//   const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
//   const [rejectionReason, setRejectionReason] = useState('');

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

//   const handleReject = (requestId: string) => {
//     onRejectRequest(requestId, rejectionReason);
//     setRejectingRequest(null);
//     setRejectionReason('');
//   };

//   const pendingRequests = requests.filter(req => req.status === 'pending');

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
//               <div 
//                 key={request.id}
//                 className="relative flex flex-col justify-between h-full bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
//               >
//                 {/* Consistent glow effect */}
//                 <div className="absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-r from-blue-400/10 via-blue-500/10 to-blue-600/10 -z-10 blur-xl"></div>
                
//                 <div className="flex flex-col flex-grow">
//                   {/* Header */}
//                   <div className="flex items-start justify-between mb-4 sm:mb-6 lg:mb-8">
//                     <div className="flex items-center gap-3 sm:gap-4">
//                     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
//                     <Building size={20} className="text-white" />
//                   </div>
//                       <div className="min-w-0">
//                         <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{request.fiuName}</h3>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Request Details */}
//                   <div className="flex flex-col flex-grow justify-between space-y-4 sm:space-y-6 mb-4 sm:mb-6 lg:mb-8">
//                     <div className="space-y-4 sm:space-y-6">
//                       <div>
//                         <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-3 sm:mb-4">
//                           <Database size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
//                           Data Requested
//                         </label>
//                         <div className="flex flex-wrap gap-2 sm:gap-3">
//                           {request.dataFields.map((field) => (
//                             <span
//                               key={field}
//                               className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-400/30 to-blue-500/30 backdrop-blur-sm text-blue-700 dark:text-blue-200 rounded-lg sm:rounded-xl font-medium border border-blue-300/50 dark:border-blue-400/20 hover:bg-blue-400/40 transition-colors duration-300"
//                             >
//                               <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
//                               <span className="leading-none">{field}</span>
//                             </span>
//                           ))}
//                         </div>
//                       </div>

//                       <div>
//                         <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3 block">Purpose</label>
//                         <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 dark:border-white/10">
//                           <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
//                             {request.purpose}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                         <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 dark:border-white/10">
//                           <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 sm:mb-2 block">Requested On</label>
//                           <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 font-medium">{formatDate(request.requestedDate)}</p>
//                         </div>
//                         <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-white/30 dark:border-white/10">
//                           <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
//                             <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
//                             Valid Until
//                           </label>
//                           <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 font-medium">{formatDate(request.expiryDate)}</p>
//                           <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
//                             ({getDaysUntilExpiry(request.expiryDate)} days remaining)
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                   <button
//                   onClick={() => onApproveRequest(request.id)}
//                   className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-[1.02]"
//                 >
//                   <Check size={16} />
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => setRejectingRequest(request.id)}
//                   className="flex-1 inline-flex items-center justify-center gap-2 border border-red-300 dark:border-red-600/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-[1.02]"
//                 >
//                   <X size={16} />
//                   Reject
//                 </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
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
// import React, { useState, useEffect } from 'react';
// import { Clock, Building, Database, Calendar, Check, X, AlertCircle, Sparkles, Eye, Download, Copy } from 'lucide-react';
// import axios from 'axios';
// // import { useAuthh } from '../types/useAuthh'; 
// //import Cookies from 'js-cookie';
// // import { useCookies } from 'react-cookie';

// interface DataField {
//   name: string;
//   value?: string;
// }

// interface ConsentRequest {
//   id: string;
//   fiu_name: string;
//   status: string;
//   data_fields: DataField[];
//   purpose: string;
//   requested_date: string;
//   expiry_date: string;
//   days_remaining: number;
//   customer_id: string;
//   fiu_id: string;
// }

// const AdminPendingRequests = () => {
//   const [requests, setRequests] = useState<ConsentRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedConsent, setSelectedConsent] = useState<ConsentRequest | null>(null);
//   const [accountData, setAccountData] = useState<any>(null);
//   const [selectedFields, setSelectedFields] = useState<Record<string, string>>({});
//   // const [cookies] = useCookies(['adminToken']);
//   //const token = Cookies.get('adminToken');
//   //console.log(token)
//   // const { isAuthenticated, isLoading, adminData, login, logout } = useAuthh();
//   useEffect(() => {
//     const fetchPendingConsents = async () => {
//       try {
//         const response = await axios.get('http://localhost:8000/admin/pending-consents', {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           withCredentials: true
//         });
//         setRequests(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching pending consents:', error);
//         setLoading(false);
//       }
//     };
    
//     fetchPendingConsents();
//   }, []);

//   const fetchConsentDetails = async (consentId: string) => {
//     try {
//       const response = await axios.get(`http://localhost:8000/admin/consent-details/${consentId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         withCredentials: true
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching consent details:', error);
//       return null;
//     }
//   };

//   const handleApprove = async (consentId: string) => {
//     try {
//       // First get the account data
//       const details = await fetchConsentDetails(consentId);
//       if (!details) return;
      
//       setSelectedConsent(requests.find(r => r.id === consentId) || null);
//       setAccountData(details.account_data);
      
//       // Initialize selected fields with all available fields marked as "not found"
//       const initialFields: Record<string, string> = {};
//       Object.keys(details.account_data).forEach(key => {
//         initialFields[key] = details.account_data[key] || "not found";
//       });
//       setSelectedFields(initialFields);
//     } catch (error) {
//       console.error('Error preparing approval:', error);
//     }
//   };

//   const handleReject = async (consentId: string, reason: string) => {
//     try {
//       await axios.post('http://localhost:8000/admin/reject-consent', {
//         consent_id: consentId,
//         reason: reason
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         withCredentials: true
//       });
      
//       setRequests(requests.filter(req => req.id !== consentId));
//     } catch (error) {
//       console.error('Error rejecting consent:', error);
//     }
//   };

//   const handleRevoke = async (consentId: string) => {
//     try {
//       await axios.post('http://localhost:8000/admin/revoke-consent', {
//         consent_id: consentId
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         withCredentials: true
//       });
      
//       // Update the UI as needed
//       setRequests(requests.filter(req => req.id !== consentId));
//     } catch (error) {
//       console.error('Error revoking consent:', error);
//     }
//   };

//   const submitApproval = async () => {
//     if (!selectedConsent) return;
    
//     try {
//       await axios.post('http://localhost:8000/admin/approve-consent', {
//         consent_id: selectedConsent.id,
//         approved_fields: selectedFields
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         withCredentials: true
//       });
      
//       setRequests(requests.filter(req => req.id !== selectedConsent.id));
//       setSelectedConsent(null);
//       setAccountData(null);
//     } catch (error) {
//       console.error('Error approving consent:', error);
//     }
//   };

//   const updateFieldValue = (fieldName: string, value: string) => {
//     setSelectedFields(prev => ({
//       ...prev,
//       [fieldName]: value
//     }));
//   };

//   const removeField = (fieldName: string) => {
//     const newFields = {...selectedFields};
//     delete newFields[fieldName];
//     setSelectedFields(newFields);
//   };

//   const pendingRequests = requests.filter(req => req.status === 'APPROVED');

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
//                   You have {pendingRequests.length} pending admin consent request{pendingRequests.length !== 1 ? 's' : ''} awaiting your review.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Requests Grid */}
//         {pendingRequests.length > 0 ? (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//             {pendingRequests.map((request) => (
//               <div key={request.id} className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
//                 {/* Header */}
//                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner border border-white/30 dark:border-white/10 flex-shrink-0">
//                     <Building size={18} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300" />
//                   </div>
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{request.fiu_name}</h3>
//                 </div>

//                 {/* Data Fields */}
//                 <div className="mb-4 sm:mb-6">
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Data Requested</label>
//                   <div className="flex flex-wrap gap-2 sm:gap-3">
//                     {request.data_fields.map((field, index) => (
//                       <span
//                         key={index}
//                         className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl font-medium border
//                           ${field.name === "Other" ? 
//                             'bg-blue-800 text-blue-100 border-blue-700' : 
//                             'bg-gradient-to-r from-blue-400/30 to-blue-500/30 text-blue-700 dark:text-blue-200 border-blue-300/50 dark:border-blue-400/20'
//                           }`}
//                       >
//                         <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
//                         <span className="leading-none">
//                           {field.name === "Other" ? `Other: ${field.value}` : field.name}
//                         </span>
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Purpose */}
//                 <div className="mb-4 sm:mb-6">
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Purpose</label>
//                   <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
//                     <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">{request.purpose}</p>
//                   </div>
//                 </div>

//                 {/* Dates */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
//                   <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Requested On</label>
//                     <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">{request.requested_date}</p>
//                   </div>
//                   <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Valid Until</label>
//                     <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">{request.expiry_date}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                       ({request.days_remaining} days remaining)
//                     </p>
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex gap-3 sm:gap-4">
//                   <button 
//                     onClick={() => handleApprove(request.id)}
//                     className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-green-600/90 hover:to-green-700/90 transition-all duration-300 shadow-lg hover:shadow-green-500/30 border border-green-400/30 text-sm sm:text-base"
//                   >
//                     <Check size={16} />
//                     Approve
//                   </button>
//                   <button 
//                     onClick={() => handleReject(request.id, "Rejected by admin")}
//                     className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-red-600/90 hover:to-red-700/90 transition-all duration-300 shadow-lg hover:shadow-red-500/30 border border-red-400/30 text-sm sm:text-base"
//                   >
//                     <X size={16} />
//                     Reject
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12 sm:py-16 lg:py-24 px-4">
//             <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-lg border border-white/30 dark:border-white/10">
//               <Clock size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-500 dark:text-gray-300" />
//             </div>
//             <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4">No pending requests</h3>
//             <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-sm sm:max-w-md lg:max-w-lg mx-auto leading-relaxed">
//               When financial institutions request access to customer data, they'll appear here for your review.
//             </p>
//           </div>
//         )}

//         {/* Approval Modal */}
//         {selectedConsent && accountData && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
//             <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-white/50 dark:border-white/10 mx-3 overflow-hidden">
//               <div className="p-4 sm:p-6 lg:p-8">
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Approve Consent Request</h3>
//                   <button 
//                     onClick={() => {
//                       setSelectedConsent(null);
//                       setAccountData(null);
//                     }}
//                     className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>

//                 <div className="mb-6">
//                   <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Selected Fields for Approval</h4>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//                     {Object.entries(selectedFields).map(([fieldName, fieldValue]) => (
//                       <div key={fieldName} className="bg-white/50 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-lg p-3 flex justify-between items-center">
//                         <div>
//                           <div className="text-xs text-gray-500 dark:text-gray-400">{fieldName}</div>
//                           <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
//                             {fieldValue === "not found" ? (
//                               <span className="text-red-500">Not found</span>
//                             ) : (
//                               fieldValue
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex gap-2">
//                           {fieldValue === "not found" ? (
//                             <button
//                               onClick={() => {
//                                 const newValue = prompt(`Enter value for ${fieldName}`, "");
//                                 if (newValue !== null) {
//                                   updateFieldValue(fieldName, newValue);
//                                 }
//                               }}
//                               className="text-blue-500 hover:text-blue-700"
//                               title="Edit"
//                             >
//                               <Eye size={16} />
//                             </button>
//                           ) : (
//                             <button
//                               onClick={() => {
//                                 const newValue = prompt(`Edit ${fieldName}`, fieldValue);
//                                 if (newValue !== null) {
//                                   updateFieldValue(fieldName, newValue);
//                                 }
//                               }}
//                               className="text-blue-500 hover:text-blue-700"
//                               title="Edit"
//                             >
//                               <Eye size={16} />
//                             </button>
//                           )}
//                           <button
//                             onClick={() => removeField(fieldName)}
//                             className="text-red-500 hover:text-red-700"
//                             title="Remove"
//                           >
//                             <X size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-3">
//                   <button
//                     onClick={() => {
//                       setSelectedConsent(null);
//                       setAccountData(null);
//                     }}
//                     className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={submitApproval}
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                   >
//                     <Check size={16} />
//                     Approve & Send
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

// export default AdminPendingRequests;

import React, { useState, useEffect } from 'react';
import { Clock, Building, Database, Calendar, Check, X, AlertCircle, Sparkles, Eye, Download, FileText, Lock } from 'lucide-react';
import axios from 'axios';
// import emailjs from '@emailjs/browser';
import { useAuthh } from '../types/useAuthh';
import { Cookies } from 'react-cookie';
interface DataField {
  name: string;
  value?: string;
}

interface ConsentRequest {
  id: string;
  fiu_id: string;
  fiu_name: string;
  status: string;
  status_admin: string;
  data_fields: DataField[];
  purpose: string;
  requested_date: string;
  expiry_date: string;
  days_remaining: number;
  c_id: string;
  customer_id: string;
}

interface AccountData {
  account_number?: string;
  account_type?: string;
  balance?: string;
  branch?: string;
  ifsc?: string;
  [key: string]: string | undefined;
}

const AdminPendingRequests = () => {
  const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ConsentRequest | null>(null);
  const [selectedFields, setSelectedFields] = useState<DataField[]>([]);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [manualData, setManualData] = useState<{[key: string]: string}>({});
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  // In your React code, modify axios defaults
  axios.defaults.withCredentials = true;
  // const cookies = new Cookies();
  // const adminToken = cookies.get('adminToken');
  // console.log(adminToken)
  const { isAuthenticated, isLoading, adminData, login, logout, adminToken } = useAuthh();
    // const navigate = useNavigate();
  console.log(isAuthenticated)
  useEffect(() => {
    const fetchPendingConsents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/admin/pending-consents', {
          // headers: {
          //   Authorization: `Bearer ${adminToken}`,
          //   withCredentials: true
          // }
        });
        
        // Transform the API data to match our interface
        const transformedData = response.data.map((consent: any) => ({
          id: consent.id,
          fiu_id: consent.fiu_id,
          fiu_name: consent.fiu_name,
          status: consent.status,
          status_admin: consent.status_admin || "PENDING",
          // data_fields: consent.data_fields || [],
          purpose: consent.purpose,
          requested_date: consent.requested_date,
          expiry_date: consent.expiry_date,
          days_remaining: consent.days_remaining,
          c_id: consent.customer_id,
          customer_id: consent.customer_id,
          data_fields: Array.isArray(consent.data_fields) 
            ? consent.data_fields.map((field: any) => ({
                name: field.name || field, // Handle both object and string cases
                value: field.value || undefined
              }))
            : []
          
        }));
        // console.log(response.data_fields)
        
        setRequests(transformedData);
      } catch (error) {
        console.error('Error fetching pending consents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingConsents();
  }, [adminToken]);

  const handleApprove = async (request: ConsentRequest) => {
    setSelectedRequest(request);
    setSelectedFields(request.data_fields);
    setShowExpiryModal(true);
  };

  const handleReject = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:8000/admin/reject-consent`, {
        consent_id: requestId,
        reason: rejectionReason
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      setRequests(requests.filter(req => req.id !== requestId));
      setRejectingRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting consent:', error);
    }
  };

  const handleRevoke = async (requestId: string) => {
    try {
      await axios.put(`http://localhost:8000/admin/revoke-consent`, {
        consent_id: requestId
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  };

  const fetchAccountData = async () => {
  if (!selectedRequest) return;
  
  try {
    const response = await axios.get(`http://localhost:8000/admin/consent-details/${selectedRequest.id}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    // Get the raw account data from the response
    const accountData = response.data.account_data || {};
    
    // Create a mapping between requested fields and database fields
    const fieldMapping: Record<string, string> = {
      "account balance": "balance",
      "credit score": "credit_score",
      "account details": "account_details",
      "loan details": "loan_details",
      "repayment history": "repayment_history",
      "transaction history": "transaction_history",
      "salary inflow": "salary_inflow",
      "insurance info": "insurance_info",
      "nominee details": "nominee_details",
      "aadhar number": "aadhaar_number",
      "pan number": "pan_number",
      "DOB": "dob"
    };

    // Transform the account data based on the requested fields
    const transformedData: AccountData = {};
    
    // Check which fields were requested in the consent
    const requestedFields = selectedRequest.data_fields.map(field => field.name);
    
    // Only include fields that were actually requested
    requestedFields.forEach(field => {
      const dbField = fieldMapping[field.toLowerCase()];
      if (dbField && accountData[dbField] !== undefined) {
        // Handle JSONB fields by stringifying them
        if (typeof accountData[dbField] === 'object' && accountData[dbField] !== null) {
          transformedData[field] = JSON.stringify(accountData[dbField]);
        } else {
          transformedData[field] = accountData[dbField];
        }
      }
    });

    // Always include basic account info
    transformedData.account_number = accountData.account_number;
    transformedData.account_type = accountData.account_type;
    transformedData.balance = accountData.balance;
    
    setAccountData(transformedData);
  } catch (error) {
    console.error('Error fetching account data:', error);
    setAccountData({});
  }
};

  // const fetchAccountData = async () => {
  //   if (!selectedRequest) return;
    
  //   try {
  //     const response = await axios.get(`http://localhost:8000/admin/consent-details/${selectedRequest.id}`, {
  //       headers: {
  //         Authorization: `Bearer ${adminToken}`
  //       }
  //     });
      
  //     // Transform the account data to match our interface
  //     const accountData = response.data.account_data || {};
  //     const transformedData: AccountData = {
  //       account_number: accountData.account_number,
  //       account_type: accountData.account_type,
  //       balance: accountData.balance,
  //       branch: accountData.branch,
  //       ifsc: accountData.ifsc,
  //       // Add other fields that might be requested
  //       'pan card': accountData.pan_number,
  //       'aadhaar number': accountData.aadhaar_number
  //     };
      
  //     setAccountData(transformedData);
  //   } catch (error) {
  //     console.error('Error fetching account data:', error);
  //     setAccountData({});
  //   }
  // };

  const handleManualDataChange = (field: string, value: string) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const removeField = (fieldName: string) => {
    setSelectedFields(prev => prev.filter(field => field.name !== fieldName));
  };

  const finalizeApproval = async () => {
    if (!selectedRequest) return;

    try {
      // Prepare approved fields data
      const approvedFields: {[key: string]: unknown} = {};
      selectedFields.forEach(field => {
        const fieldName = field.name.toLowerCase();
        approvedFields[field.name] = accountData?.[fieldName] || manualData[field.name] || '';
      });

      // Call the approve API
      await axios.post('http://localhost:8000/admin/approve-consent', {
        consent_id: selectedRequest.id,
        approved_fields: approvedFields,
        expiry_date: expiryDate
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      // Close modal and update UI
      setSelectedRequest(null);
      setRequests(requests.filter(req => req.id !== selectedRequest.id));
      setExpiryDate('');
    } catch (error) {
      console.error('Error finalizing approval:', error);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const password = Array.from({length: 16}, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    
    return {
      plain: password,
      hash: 'hashed_password_placeholder',
      token: 'one_time_token_placeholder'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  // console.log('Data field:0'+requests.data_fields)
  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          {requests.length > 0 && (
            <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4 text-white" />
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium leading-tight">
                  You have {requests.length} pending consent request{requests.length !== 1 ? 's' : ''} awaiting your review.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Requests Grid */}
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {requests.map((request) => (
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
                          {field.name === "Other" ? `Other: ${field.name}` : field.name}
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
                    onClick={() => handleApprove(request)}
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

        {/* Approval Modal - Step 1: Select Fields */}
        {selectedRequest && !accountData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full border border-white/50 dark:border-white/10 mx-3 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Approve Consent Request</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                  Select the data fields you want to share with {selectedRequest.fiu_name}
                </p>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Available Fields</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {selectedRequest.data_fields.map((field, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer
                          ${selectedFields.some(f => f.name === field.name) 
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                            : 'bg-white/50 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                          }`}
                        onClick={() => {
                          if (selectedFields.some(f => f.name === field.name)) {
                            setSelectedFields(selectedFields.filter(f => f.name !== field.name));
                          } else {
                            setSelectedFields([...selectedFields, field]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Database size={16} className="text-blue-600 dark:text-blue-300" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {field.name === "Other" ? `Other: ${field.value}` : field.name}
                          </span>
                        </div>
                        {selectedFields.some(f => f.name === field.name) ? (
                          <Check size={16} className="text-blue-600 dark:text-blue-300" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={fetchAccountData}
                    disabled={selectedFields.length === 0}
                    className={`px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg text-sm sm:text-base
                      ${selectedFields.length === 0
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white hover:from-blue-600/90 hover:to-blue-700/90 hover:shadow-blue-500/30 border border-blue-400/30'
                      }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExpiryModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
    <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full border border-white/50 dark:border-white/10 mx-3">
      <div className="p-4 sm:p-6 lg:p-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Set Consent Expiry Date
        </h3>
        
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:text-white transition-all duration-300 text-sm sm:text-base"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={() => {
              setShowExpiryModal(false);
              setExpiryDate('');
            }}
            className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (expiryDate) {
                setShowExpiryModal(false);
                fetchAccountData();
              }
            }}
            disabled={!expiryDate}
            className={`flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg text-sm sm:text-base
              ${!expiryDate
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white hover:from-blue-600/90 hover:to-blue-700/90 hover:shadow-blue-500/30 border border-blue-400/30'
              }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Approval Modal - Step 2: Review Data */}
        {selectedRequest && accountData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-white/50 dark:border-white/10 mx-3 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Review Data for Sharing</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                  Review the data that will be shared with {selectedRequest.fiu_name}
                </p>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200">Selected Fields</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{selectedFields.length} fields selected</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                    <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-200">{field.name}</span>
                    <button 
                      onClick={() => removeField(field.name)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {selectedFields.map((field, index) => (
                <div key={index} className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Database size={14} className="text-blue-600 dark:text-blue-300" />
                      {field.name}
                    </label>
                    {accountData[field.name.toLowerCase()] === undefined && (
                      <span className="text-xs text-red-500">Not found in database</span>
                    )}
                  </div>
                  {accountData[field.name.toLowerCase()] !== undefined ? (
                    <input
                      type="text"
                      value={accountData[field.name.toLowerCase()] || ''}
                      readOnly
                      className="w-full px-3 py-2 bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualData[field.name] || ''}
                        onChange={(e) => handleManualDataChange(field.name, e.target.value)}
                        placeholder={`Enter ${field.name} manually`}
                        className="flex-1 px-3 py-2 bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/20">
            <div className="flex justify-between gap-3 sm:gap-4">
              <button
                onClick={() => setAccountData(null)}
                className="px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base"
              >
                Back
              </button>
              <button
                onClick={finalizeApproval}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-green-600/90 hover:to-green-700/90 transition-all duration-300 shadow-lg hover:shadow-green-500/30 border border-green-400/30 text-sm sm:text-base"
              >
                <Check size={16} />
                Approve & Share Data
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

export default AdminPendingRequests;

// import React, { useState, useEffect } from 'react';
// import { Clock, Building, Database, Calendar, Check, X, AlertCircle, Sparkles, Eye, Download, FileText, Lock } from 'lucide-react';
// import axios from 'axios';
// // import { useCookies } from 'react-cookie';
// import emailjs from '@emailjs/browser';
// import { Cookies } from 'react-cookie';

// interface DataField {
//   name: string;
//   value?: string;
// }

// interface ConsentRequest {
//   id: string;
//   fiu_id: string;
//   fiu_name: string;
//   status: string;
//   status_admin: string;
//   data_fields: DataField[];
//   purpose: string;
//   requested_date: string;
//   expiry_date: string;
//   days_remaining: number;
//   c_id: string;
// }

// interface AccountData {
//   account_number?: string;
//   account_type?: string;
//   balance?: string;
//   branch?: string;
//   ifsc?: string;
//   [key: string]: string | undefined;
// }

// const AdminPendingRequests = () => {
//   // const [requests, setRequests] = useState<ConsentRequest[]>([]);
//   // const [loading, setLoading] = useState(true);
//   const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [selectedRequest, setSelectedRequest] = useState<ConsentRequest | null>(null);
//   const [selectedFields, setSelectedFields] = useState<DataField[]>([]);
//   const [accountData, setAccountData] = useState<AccountData | null>(null);
//   const [manualData, setManualData] = useState<{[key: string]: string}>({});
//   const [requests, setRequests] = useState<ConsentRequest[]>([]);
//   const [loading, setLoading] = useState(false);
//   // const [cookies] = useCookies(['adminToken']);
//   const cookies = new Cookies();
//   const adminToken = cookies.get('adminToken');

//   useEffect(() => {
//     // Mock data for pending consents
//     const mockPendingConsents: ConsentRequest[] = [
//       {
//         id: "consent-1",
//         fiu_id: "fiu-1",
//         fiu_name: "Reserved Bank Of India",
//         status: "APPROVED",
//         status_admin: "PENDING",
//         data_fields: [
//           { name: "Account Number" },
//           { name: "Account Balance" },
//           { name: "Transaction History" }
//         ],
//         purpose: "Loan application processing and creditworthiness assessment",
//         requested_date: "15/06/2023",
//         expiry_date: "15/09/2023",
//         days_remaining: 45,
//         c_id: "customer-123"
//       },
//       {
//         id: "consent-2",
//         fiu_id: "fiu-2",
//         fiu_name: "National Insurance Company",
//         status: "APPROVED",
//         status_admin: "PENDING",
//         data_fields: [
//           { name: "PAN Card" },
//           { name: "Aadhaar Number" },
//           { name: "Other", value: "Previous insurance policies" }
//         ],
//         purpose: "Insurance policy underwriting and risk assessment",
//         requested_date: "20/06/2023",
//         expiry_date: "20/08/2023",
//         days_remaining: 30,
//         c_id: "customer-456"
//       }
//     ];

//     // Simulate API call with timeout
//     const timer = setTimeout(() => {
//       setRequests(mockPendingConsents);
//       setLoading(false);
//     }, 500); // Small delay to simulate network request

//     return () => clearTimeout(timer);
//   }, []);
//   // useEffect(() => {
//   //   const fetchPendingConsents = async () => {
//   //     try {
//   //       const response = await axios.get('http://localhost:8000/pending', {
//   //         headers: {
//   //           Authorization: `Bearer ${cookies.adminToken}`
//   //         }
//   //       });
//   //       setRequests(response.data.filter((req: ConsentRequest) => 
//   //         req.status === "APPROVED" && req.status_admin === "PENDING"
//   //       ));
//   //     } catch (error) {
//   //       console.error('Error fetching pending consents:', error);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
    
//   //   fetchPendingConsents();
//   // }, [cookies.adminToken]);

//   const handleApprove = async (request: ConsentRequest) => {
//     setSelectedRequest(request);
//     setSelectedFields(request.data_fields);
//   };

//   const handleReject = async (requestId: string) => {
//     try {
//       await axios.put(`http://localhost:8000/${requestId}/status_admin`, {
//         status_admin: "REJECTED"
//       }, {
//         headers: {
//           Authorization: `Bearer ${cookies.adminToken}`
//         }
//       });
//       setRequests(requests.filter(req => req.id !== requestId));
//       setRejectingRequest(null);
//       setRejectionReason('');
//     } catch (error) {
//       console.error('Error rejecting consent:', error);
//     }
//   };

//   const handleRevoke = async (requestId: string) => {
//     try {
//       await axios.put(`http://localhost:8000/${requestId}/status_admin`, {
//         status_admin: "REVOKED"
//       }, {
//         headers: {
//           Authorization: `Bearer ${cookies.adminToken}`
//         }
//       });
//       setRequests(requests.filter(req => req.id !== requestId));
//     } catch (error) {
//       console.error('Error revoking consent:', error);
//     }
//   };

//   // const fetchAccountData = async () => {
//   //   if (!selectedRequest) return;
    
//   //   try {
//   //     const response = await axios.get(`http://localhost:8000/accounts?c_id=${selectedRequest.c_id}`, {
//   //       headers: {
//   //         Authorization: `Bearer ${cookies.adminToken}`
//   //       }
//   //     });
//   //     setAccountData(response.data);
//   //   } catch (error) {
//   //     console.error('Error fetching account data:', error);
//   //     setAccountData({});
//   //   }
//   // };

//   const fetchAccountData = async () => {
//     if (!selectedRequest) return;
    
//     // Simulate loading
//     setAccountData(null);
    
//     // Mock account data based on c_id
//     const mockAccountData: AccountData = {
//       account_number: selectedRequest.c_id === "customer-123" 
//         ? "XXXXXX7890" 
//         : "XXXXXX4567",
//       account_type: "Savings",
//       balance: selectedRequest.c_id === "customer-123" 
//         ? "₹1,25,000.00" 
//         : "₹85,000.00",
//       branch: "Main Branch",
//       ifsc: "RBIN0XXXXXX",
//       // Add other fields that might be requested
//       'pan card': selectedRequest.c_id === "customer-123" 
//         ? "ABCDE1234F" 
//         : "GHIJK5678L",
//       'aadhaar number': "XXXX-XXXX-XXXX"
//     };

//     // Simulate API call with timeout
//     const timer = setTimeout(() => {
//       setAccountData(mockAccountData);
//     }, 500);

//     return () => clearTimeout(timer);
//   };

//   const handleManualDataChange = (field: string, value: string) => {
//     setManualData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const removeField = (fieldName: string) => {
//     setSelectedFields(prev => prev.filter(field => field.name !== fieldName));
//   };

//   const finalizeApproval = async () => {
//     if (!selectedRequest) return;

//     try {
//       // Generate random password
//       const password = generateRandomPassword();
      
//       // Update consent with approved fields and password hash
//       await axios.put(`http://localhost:8000/${selectedRequest.id}/status_admin`, {
//         status_admin: "APPROVED",
//         approved_fields: selectedFields,
//         vault_password: password.hash // Store hashed password
//       }, {
//         headers: {
//           Authorization: `Bearer ${cookies.adminToken}`
//         }
//       });

//       // Prepare data for vault file
//       const vaultData = {
//         ...accountData,
//         ...manualData,
//         consent_id: selectedRequest.id,
//         timestamp: new Date().toISOString()
//       };

//       // Create vault file
//       const vaultResult = await axios.post('http://localhost:8000/vault/create', {
//         data: vaultData,
//         filename_prefix: `consent_${selectedRequest.id}`
//       }, {
//         headers: {
//           Authorization: `Bearer ${cookies.adminToken}`
//         }
//       });

//       // Send email with links
//       await emailjs.send(
//         'your_emailjs_service_id',
//         'consent_approval_template',
//         {
//           fiu_email: selectedRequest.fiu_email, // Need to get this from organizations table
//           download_link: 'https://example.com/download',
//           password_link: `https://example.com/password/${password.token}`,
//           vault_link: vaultResult.data.download_url,
//           consent_id: selectedRequest.id
//         },
//         'your_emailjs_user_id'
//       );

//       // Close modal and update UI
//       setSelectedRequest(null);
//       setRequests(requests.filter(req => req.id !== selectedRequest.id));
      
//     } catch (error) {
//       console.error('Error finalizing approval:', error);
//     }
//   };

//   const generateRandomPassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     const password = Array.from({length: 16}, () => 
//       chars.charAt(Math.floor(Math.random() * chars.length))
//     ).join('');
    
//     // In a real app, you would hash this password before sending to the server
//     return {
//       plain: password,
//       hash: 'hashed_password_placeholder', // Replace with actual hashing
//       token: 'one_time_token_placeholder' // For the password link
//     };
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-transparent flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-transparent">
//       <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
//         {/* Header Section */}
//         <div className="mb-6 sm:mb-8">
//           {requests.length > 0 && (
//             <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
//               <div className="flex items-center gap-2 sm:gap-3">
//                 <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
//                   <AlertCircle size={14} className="sm:w-4 sm:h-4 text-white" />
//                 </div>
//                 <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium leading-tight">
//                   You have {requests.length} pending consent request{requests.length !== 1 ? 's' : ''} awaiting your review.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Requests Grid */}
//         {requests.length > 0 ? (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//             {requests.map((request) => (
//               <div key={request.id} className="bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
//                 {/* Header */}
//                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner border border-white/30 dark:border-white/10 flex-shrink-0">
//                     <Building size={18} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300" />
//                   </div>
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{request.fiu_name}</h3>
//                 </div>

//                 {/* Data Fields */}
//                 <div className="mb-4 sm:mb-6">
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Data Requested</label>
//                   <div className="flex flex-wrap gap-2 sm:gap-3">
//                     {request.data_fields.map((field, index) => (
//                       <span
//                         key={index}
//                         className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl font-medium border
//                           ${field.name === "Other" ? 
//                             'bg-blue-800 text-blue-100 border-blue-700' : 
//                             'bg-gradient-to-r from-blue-400/30 to-blue-500/30 text-blue-700 dark:text-blue-200 border-blue-300/50 dark:border-blue-400/20'
//                           }`}
//                       >
//                         <Sparkles size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
//                         <span className="leading-none">
//                           {field.name === "Other" ? `Other: ${field.value}` : field.name}
//                         </span>
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Purpose */}
//                 <div className="mb-4 sm:mb-6">
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Purpose</label>
//                   <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
//                     <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">{request.purpose}</p>
//                   </div>
//                 </div>

//                 {/* Dates */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
//                   <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Requested On</label>
//                     <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">{request.requested_date}</p>
//                   </div>
//                   <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
//                     <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Valid Until</label>
//                     <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">{request.expiry_date}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                       ({request.days_remaining} days remaining)
//                     </p>
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex gap-3 sm:gap-4">
//                   {request.fiu_name === "Reserved Bank Of India" ? (
//                     <button 
//                       onClick={() => handleApprove(request)}
//                       className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-green-600/90 hover:to-green-700/90 transition-all duration-300 shadow-lg hover:shadow-green-500/30 border border-green-400/30 text-sm sm:text-base"
//                     >
//                       <Check size={16} />
//                       Approve
//                     </button>
//                   ) : (
//                     <>
//                       <button 
//                         onClick={() => handleApprove(request)}
//                         className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-green-600/90 hover:to-green-700/90 transition-all duration-300 shadow-lg hover:shadow-green-500/30 border border-green-400/30 text-sm sm:text-base"
//                       >
//                         <Check size={16} />
//                         Approve
//                       </button>
//                       <button 
//                         onClick={() => setRejectingRequest(request.id)}
//                         className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-red-600/90 hover:to-red-700/90 transition-all duration-300 shadow-lg hover:shadow-red-500/30 border border-red-400/30 text-sm sm:text-base"
//                       >
//                         <X size={16} />
//                         Reject
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
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
//                     className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={() => handleReject(rejectingRequest)}
//                     className="flex-1 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-blue-600/90 hover:to-blue-700/90 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 border border-blue-400/30 text-sm sm:text-base"
//                   >
//                     Reject Request
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Approval Modal - Step 1: Select Fields */}
//         {selectedRequest && !accountData && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
//             <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full border border-white/50 dark:border-white/10 mx-3 overflow-hidden">
//               <div className="p-4 sm:p-6 lg:p-8">
//                 <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Approve Consent Request</h3>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
//                   Select the data fields you want to share with {selectedRequest.fiu_name}
//                 </p>

//                 <div className="mb-4 sm:mb-6">
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">Available Fields</label>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
//                     {selectedRequest.data_fields.map((field, index) => (
//                       <div 
//                         key={index}
//                         className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer
//                           ${selectedFields.some(f => f.name === field.name) 
//                             ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
//                             : 'bg-white/50 dark:bg-white/5 border-white/40 dark:border-white/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
//                           }`}
//                         onClick={() => {
//                           if (selectedFields.some(f => f.name === field.name)) {
//                             setSelectedFields(selectedFields.filter(f => f.name !== field.name));
//                           } else {
//                             setSelectedFields([...selectedFields, field]);
//                           }
//                         }}
//                       >
//                         <div className="flex items-center gap-2">
//                           <Database size={16} className="text-blue-600 dark:text-blue-300" />
//                           <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
//                             {field.name === "Other" ? `Other: ${field.value}` : field.name}
//                           </span>
//                         </div>
//                         {selectedFields.some(f => f.name === field.name) ? (
//                           <Check size={16} className="text-blue-600 dark:text-blue-300" />
//                         ) : null}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-3 sm:gap-4">
//                   <button
//                     onClick={() => setSelectedRequest(null)}
//                     className="px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={fetchAccountData}
//                     disabled={selectedFields.length === 0}
//                     className={`px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 shadow-lg text-sm sm:text-base
//                       ${selectedFields.length === 0
//                         ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed'
//                         : 'bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-sm text-white hover:from-blue-600/90 hover:to-blue-700/90 hover:shadow-blue-500/30 border border-blue-400/30'
//                       }`}
//                   >
//                     Continue
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Approval Modal - Step 2: Review Data */}
//         {selectedRequest && accountData && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
//             <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-white/50 dark:border-white/10 mx-3 overflow-hidden max-h-[90vh] flex flex-col">
//               <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
//                 <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Review Data for Sharing</h3>
//                 <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
//                   Review the data that will be shared with {selectedRequest.fiu_name}
//                 </p>

//                 <div className="mb-6">
//                   <div className="flex justify-between items-center mb-3">
//                     <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200">Selected Fields</h4>
//                     <span className="text-xs text-gray-500 dark:text-gray-400">{selectedFields.length} fields selected</span>
//                   </div>
//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {selectedFields.map((field, index) => (
//                       <div key={index} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
//                         <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-200">{field.name}</span>
//                         <button 
//                           onClick={() => removeField(field.name)}
//                           className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
//                         >
//                           <X size={14} />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   {selectedFields.map((field, index) => (
//                     <div key={index} className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/40 dark:border-white/10">
//                       <div className="flex justify-between items-center mb-2">
//                         <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
//                           <Database size={14} className="text-blue-600 dark:text-blue-300" />
//                           {field.name}
//                         </label>
//                         {accountData[field.name.toLowerCase()] === undefined && (
//                           <span className="text-xs text-red-500">Not found in database</span>
//                         )}
//                       </div>
//                       {accountData[field.name.toLowerCase()] !== undefined ? (
//                         <input
//                           type="text"
//                           value={accountData[field.name.toLowerCase()] || ''}
//                           readOnly
//                           className="w-full px-3 py-2 bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200"
//                         />
//                       ) : (
//                         <div className="flex gap-2">
//                           <input
//                             type="text"
//                             value={manualData[field.name] || ''}
//                             onChange={(e) => handleManualDataChange(field.name, e.target.value)}
//                             placeholder={`Enter ${field.name} manually`}
//                             className="flex-1 px-3 py-2 bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200"
//                           />
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="p-4 sm:p-6 border-t border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/20">
//                 <div className="flex justify-between gap-3 sm:gap-4">
//                   <button
//                     onClick={() => setAccountData(null)}
//                     className="px-4 py-3 sm:px-6 sm:py-4 bg-white/30 dark:bg-white/5 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-300 rounded-xl sm:rounded-2xl font-semibold border border-white/40 dark:border-white/20 hover:bg-white/40 dark:hover:bg-white/10 text-sm sm:text-base"
//                   >
//                     Back
//                   </button>
//                   <button
//                     onClick={finalizeApproval}
//                     className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500/80 to-green-600/80 backdrop-blur-sm text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:from-green-600/90 hover:to-green-700/90 transition-all duration-300 shadow-lg hover:shadow-green-500/30 border border-green-400/30 text-sm sm:text-base"
//                   >
//                     <Check size={16} />
//                     Approve & Share Data
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

// export default AdminPendingRequests;