// import React, { useState, useEffect } from 'react';
// import { Search, ChevronDown, Calendar } from 'lucide-react';
// import axios from 'axios';
// import { useRouter } from 'next/router';

// interface Consent {
//   id: string;
//   c_id: string;
//   user_identifier: string;
//   customer_id: string;
//   purpose: string;
//   datafields: string[];
//   status: string;
//   consent_signature: string;
//   consent_details: any;
//   created_at: string;
//   expiry_date?: string;
//   fiu_id: string;
// }

// // interface ConsentsProps {
// //   currentOrgId: string;
// // }

// // const Consents: React.FC<ConsentsProps> = ({ currentOrgId }) => {
// //   const [consents, setConsents] = useState<Consent[]>([]);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [statusFilter, setStatusFilter] = useState('');
// //   const [purposeFilter, setPurposeFilter] = useState('');
// //   const [showFilters, setShowFilters] = useState(false);
// //   const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);

// //   useEffect(() => {
// //     const fetchConsents = async () => {
// //       setIsLoading(true);
// //       try {
// //         const response = await fetchConsentsFromSupabase(currentOrgId);
// //         setConsents(response);
// //       } catch (error) {
// //         console.error("Error fetching consents:", error);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchConsents();
// //   }, [currentOrgId]);

//   // const fetchConsentsFromSupabase = async (orgId: string): Promise<Consent[]> => {
//   //   // This would be replaced with your actual Supabase client call
//   //   // Example:
//   //   // const { data, error } = await supabase
//   //   //   .from('requested_consents')
//   //   //   .select('*')
//   //   //   .eq('fiu_id', orgId);
    
//   //   // For demo purposes, returning mock data
//   //   return [
//   //     {
//   //       id: '1',
//   //       c_id: 'CNS-2023-0001',
//   //       user_identifier: 'CNRB1003001',
//   //       customer_id: 'cust001',
//   //       purpose: 'Loan Eligibility Check',
//   //       datafields: ['account balance', 'credit score'],
//   //       status: 'ACTIVE',
//   //       consent_signature: 'sha256hash',
//   //       consent_details: { policy: '...', timestamp: '...' },
//   //       created_at: '2023-06-15',
//   //       expiry_date: '2023-12-15',
//   //       fiu_id: orgId
//   //     },
//   //     // Add more mock data as needed
//   //   ];
//   // };



// const Consents = () => {
//   const [consents, setConsents] = useState<Consent[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [purposeFilter, setPurposeFilter] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//   const fetchConsents = async () => {
//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem('org_auth_token');
//       console.log("Fetching consents with token:", token);  // Debug logging
      
//       const response = await axios.get('/utils/consents', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
      
//       console.log("Consents data received:", response.data);  // Debug logging
//       setConsents(response.data);
//     } catch (error) {
//       console.error("Error fetching consents:", error);
//       // Handle error state if needed
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   fetchConsents();
// }, []);
//   // useEffect(() => {
//   //   const fetchConsents = async () => {
//   //     setIsLoading(true);
//   //     try {
//   //       const token = localStorage.getItem('org_auth_token');
//   //       const response = await axios.get('/utils/consents', {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`
//   //         }
//   //       });
//   //       setConsents(response.data);
//   //     } catch (error) {
//   //       console.error("Error fetching consents:", error);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };

//   //   fetchConsents();
//   // }, []);

//   const fetchConsentDetails = async (consentId: string) => {
//     try {
//       const token = localStorage.getItem('org_auth_token');
//       const response = await axios.get(`/api/consent/${consentId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching consent details:", error);
//       return null;
//     }
//   };

//   const filteredConsents = consents.filter(consent => {
//     const matchesSearch = consent.user_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          consent.c_id.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === '' || consent.status === statusFilter;
//     const matchesPurpose = purposeFilter === '' || consent.purpose.toLowerCase().includes(purposeFilter.toLowerCase());
    
//     return matchesSearch && matchesStatus && matchesPurpose;
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'ACTIVE':
//         return 'bg-green-100 text-green-800';
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'REVOKED':
//         return 'bg-red-100 text-red-800';
//       case 'EXPIRED':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const isExpiringSoon = (expiryDate?: string) => {
//     if (!expiryDate) return false;
//     const today = new Date();
//     const expiry = new Date(expiryDate);
//     const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
//     return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
//   };

//   const openConsentDetails = async (consent: Consent) => {
//     const details = await fetchConsentDetails(consent.id);
//     if (details) {
//       setSelectedConsent(details);
//     }
//   };

//   const closeConsentDetails = () => {
//     setSelectedConsent(null);
//   };

//   if (isLoading) {
//     return (
//       <div className="text-center py-12 px-4">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//         <p className="text-slate-600">Loading consents...</p>
//       </div>
//     );
//   }

//   if (consents.length === 0) {
//     return (
//       <div className="text-center py-12 px-4">
//         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Search className="w-8 h-8 text-slate-400" />
//         </div>
//         <h3 className="text-lg font-semibold text-slate-800 mb-2">No Consents Yet</h3>
//         <p className="text-slate-600 text-sm sm:text-base">You haven't requested any consents yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
//       {/* Header and search/filter UI remains the same as your original */}
      
//       {/* Desktop Table View */}
//       <div className="hidden lg:block mt-6">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-slate-200">
//                 <th className="text-left py-3 px-4 font-medium text-slate-700">Consent ID</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700">Customer ID</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700">Purpose</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700">Expiry Date</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700">View</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredConsents.map((consent) => (
//                 <tr key={consent.id} className="border-b border-slate-100 hover:bg-slate-50">
//                   <td className="py-3 px-4">
//                     <div className="font-medium text-slate-800">{consent.c_id}</div>
//                     <div className="text-sm text-slate-500">{new Date(consent.created_at).toLocaleDateString()}</div>
//                   </td>
//                   <td className="py-3 px-4 font-medium text-slate-800">{consent.user_identifier}</td>
//                   <td className="py-3 px-4 text-slate-600">{consent.purpose}</td>
//                   <td className="py-3 px-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
//                       {consent.status}
//                     </span>
//                   </td>
//                   <td className="py-3 px-4">
//                     <div className="flex items-center space-x-2">
//                       <span className="text-slate-600">{consent.expiry_date || 'N/A'}</span>
//                       {consent.expiry_date && isExpiringSoon(consent.expiry_date) && consent.status === 'ACTIVE' && (
//                         <div className="flex items-center space-x-1 text-yellow-600">
//                           <Calendar className="w-3 h-3" />
//                           <span className="text-xs">Expiring Soon</span>
//                         </div>
//                       )}
//                     </div>
//                   </td>
//                   <td className="py-3 px-4">
//                     <button
//                       onClick={() => openConsentDetails(consent)}
//                       className="p-1 text-blue-600 hover:text-blue-800"
//                       title="View Details"
//                     >
//                       <ChevronDown className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Consent Details Modal */}
//       {selectedConsent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-xl font-bold text-slate-800">Consent Details</h3>
//                 <button
//                   onClick={closeConsentDetails}
//                   className="text-slate-500 hover:text-slate-700"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Consent ID</h4>
//                     <p className="text-slate-800">{selectedConsent.c_id}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Customer ID</h4>
//                     <p className="text-slate-800">{selectedConsent.user_identifier}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Status</h4>
//                     <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConsent.status)}`}>
//                       {selectedConsent.status}
//                     </p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Created Date</h4>
//                     <p className="text-slate-800">{new Date(selectedConsent.created_at).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Expiry Date</h4>
//                     <p className="text-slate-800">{selectedConsent.expiry_date || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Purpose</h4>
//                     <p className="text-slate-800">{selectedConsent.purpose}</p>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium text-slate-600">Data Fields</h4>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {selectedConsent.datafields.map((field, index) => (
//                       <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
//                         {field}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium text-slate-600">Consent Details</h4>
//                   <div className="mt-2 p-3 bg-slate-50 rounded text-sm">
//                     <pre className="whitespace-pre-wrap">{JSON.stringify(selectedConsent.consent_details, null, 2)}</pre>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium text-slate-600">Consent Signature</h4>
//                   <p className="mt-2 text-xs font-mono break-all">{selectedConsent.consent_signature}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Consents;

// import React, { useState } from 'react';
// import { Search, Filter, Eye, XCircle, Download, Calendar, ChevronRight } from 'lucide-react';
// import { ConsentRequest } from '../types';

// interface ConsentsProps {
//   consents: ConsentRequest[];
//   onRevoke: (id: string) => void;
//   onFetchData: (id: string) => void;
// }

// const Consents: React.FC<ConsentsProps> = ({ consents, onRevoke, onFetchData }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [purposeFilter, setPurposeFilter] = useState('');
//   const [showFilters, setShowFilters] = useState(false);

//   const filteredConsents = consents.filter(consent => {
//     const matchesSearch = consent.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          consent.id.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === '' || consent.status === statusFilter;
//     const matchesPurpose = purposeFilter === '' || consent.purpose === purposeFilter;
    
//     return matchesSearch && matchesStatus && matchesPurpose;
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'ACTIVE':
//         return 'bg-green-100 text-green-800';
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'REVOKED':
//         return 'bg-red-100 text-red-800';
//       case 'EXPIRED':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const isExpiringSoon = (expiryDate: string) => {
//     const today = new Date();
//     const expiry = new Date(expiryDate);
//     const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
//     return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
//   };

//   if (consents.length === 0) {
//     return (
//       <div className="text-center py-12 px-4">
//         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Search className="w-8 h-8 text-slate-400" />
//         </div>
//         <h3 className="text-lg font-semibold text-slate-800 mb-2">No Consents Yet</h3>
//         <p className="text-slate-600 text-sm sm:text-base">You haven't requested any consents yet. Start by creating your first consent request.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Consent Requests</h2>
//           <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your data access requests</p>
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
//         <div className="space-y-4">
//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search by Customer ID or Consent ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//             />
//           </div>

//           {/* Filter Toggle Button (Mobile) */}
//           <div className="flex justify-between items-center md:hidden">
//             <span className="text-sm font-medium text-slate-700">Filters</span>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
//             >
//               <Filter className="w-4 h-4" />
//               <span>{showFilters ? 'Hide' : 'Show'}</span>
//             </button>
//           </div>

//           {/* Filter Dropdowns */}
//           <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//             >
//               <option value="">All Statuses</option>
//               <option value="ACTIVE">Active</option>
//               <option value="PENDING">Pending</option>
//               <option value="REVOKED">Revoked</option>
//               <option value="EXPIRED">Expired</option>
//             </select>
//             <select
//               value={purposeFilter}
//               onChange={(e) => setPurposeFilter(e.target.value)}
//               className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//             >
//               <option value="">All Purposes</option>
//               <option value="Lending">Lending</option>
//               <option value="Insurance">Insurance</option>
//               <option value="Analytics">Analytics</option>
//             </select>
//           </div>
//         </div>

//         {/* Results Count */}
//         <div className="mt-4 text-sm text-slate-600">
//           {filteredConsents.length} consent{filteredConsents.length !== 1 ? 's' : ''} found
//         </div>

//         {/* Desktop Table View */}
//         <div className="hidden lg:block mt-6">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-slate-200">
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Consent ID</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Customer ID</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Purpose</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Expiry Date</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredConsents.map((consent) => (
//                   <tr key={consent.id} className="border-b border-slate-100 hover:bg-slate-50">
//                     <td className="py-3 px-4">
//                       <div className="font-medium text-slate-800">{consent.id}</div>
//                       <div className="text-sm text-slate-500">{consent.createdAt}</div>
//                     </td>
//                     <td className="py-3 px-4 font-medium text-slate-800">{consent.customerId}</td>
//                     <td className="py-3 px-4 text-slate-600">{consent.purpose}</td>
//                     <td className="py-3 px-4">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
//                         {consent.status}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">
//                       <div className="flex items-center space-x-2">
//                         <span className="text-slate-600">{consent.expiryDate}</span>
//                         {isExpiringSoon(consent.expiryDate) && consent.status === 'ACTIVE' && (
//                           <div className="flex items-center space-x-1 text-yellow-600">
//                             <Calendar className="w-3 h-3" />
//                             <span className="text-xs">Expiring Soon</span>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="py-3 px-4">
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() => onFetchData(consent.id)}
//                           disabled={consent.status !== 'ACTIVE'}
//                           className="p-1 text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
//                           title="Fetch Data"
//                         >
//                           <Download className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => onRevoke(consent.id)}
//                           disabled={consent.status !== 'ACTIVE'}
//                           className="p-1 text-red-600 hover:text-red-800 disabled:text-slate-400 disabled:cursor-not-allowed"
//                           title="Revoke"
//                         >
//                           <XCircle className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Mobile Card View */}
//         <div className="lg:hidden mt-6 space-y-4">
//           {filteredConsents.map((consent) => (
//             <div key={consent.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
//               {/* Card Header */}
//               <div className="flex justify-between items-start mb-3">
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-medium text-slate-800 truncate">{consent.id}</h3>
//                   <p className="text-sm text-slate-500">{consent.createdAt}</p>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(consent.status)}`}>
//                   {consent.status}
//                 </span>
//               </div>

//               {/* Card Details */}
//               <div className="space-y-2 mb-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-slate-600">Customer ID:</span>
//                   <span className="text-sm font-medium text-slate-800 truncate ml-2">{consent.customerId}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-slate-600">Purpose:</span>
//                   <span className="text-sm text-slate-800">{consent.purpose}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-slate-600">Expiry Date:</span>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm text-slate-800">{consent.expiryDate}</span>
//                     {isExpiringSoon(consent.expiryDate) && consent.status === 'ACTIVE' && (
//                       <div className="flex items-center space-x-1 text-yellow-600">
//                         <Calendar className="w-3 h-3" />
//                         <span className="text-xs">Expiring Soon</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Card Actions */}
//               <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
//                 <button
//                   onClick={() => onFetchData(consent.id)}
//                   disabled={consent.status !== 'ACTIVE'}
//                   className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
//                 >
//                   <Download className="w-4 h-4" />
//                   <span>Fetch Data</span>
//                 </button>
//                 <button
//                   onClick={() => onRevoke(consent.id)}
//                   disabled={consent.status !== 'ACTIVE'}
//                   className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 disabled:text-slate-400 disabled:cursor-not-allowed"
//                 >
//                   <XCircle className="w-4 h-4" />
//                   <span>Revoke</span>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Consents;

/*next code */

//   const fetchConsentsFromSupabase = async (orgId: string): Promise<Consent[]> => {
//   const { data, error } = await supabase
//     .from('requested_consents')
//     .select('*')
//     .eq('fiu_id', orgId)
//     .order('created_at', { ascending: false });

//   if (error) {
//     throw error;
//   }

//   return data || [];
// };

//   const filteredConsents = consents.filter(consent => {
//     const matchesSearch = consent.user_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          consent.c_id.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === '' || consent.status === statusFilter;
//     const matchesPurpose = purposeFilter === '' || consent.purpose.toLowerCase().includes(purposeFilter.toLowerCase());
    
//     return matchesSearch && matchesStatus && matchesPurpose;
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'ACTIVE':
//         return 'bg-green-100 text-green-800';
//       case 'PENDING':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'REVOKED':
//         return 'bg-red-100 text-red-800';
//       case 'EXPIRED':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const isExpiringSoon = (expiryDate?: string) => {
//     if (!expiryDate) return false;
//     const today = new Date();
//     const expiry = new Date(expiryDate);
//     const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
//     return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
//   };

//   const openConsentDetails = (consent: Consent) => {
//     setSelectedConsent(consent);
//   };

//   const closeConsentDetails = () => {
//     setSelectedConsent(null);
//   };

//   if (isLoading) {
//     return (
//       <div className="text-center py-12 px-4">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//         <p className="text-slate-600">Loading consents...</p>
//       </div>
//     );
//   }

//   if (consents.length === 0) {
//     return (
//       <div className="text-center py-12 px-4">
//         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Search className="w-8 h-8 text-slate-400" />
//         </div>
//         <h3 className="text-lg font-semibold text-slate-800 mb-2">No Consents Yet</h3>
//         <p className="text-slate-600 text-sm sm:text-base">You haven't requested any consents yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Consent Requests</h2>
//           <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your data access requests</p>
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
//         <div className="space-y-4">
//           {/* Search Bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search by Customer ID or Consent ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//             />
//           </div>

//           {/* Filter Toggle Button (Mobile) */}
//           <div className="flex justify-between items-center md:hidden">
//             <span className="text-sm font-medium text-slate-700">Filters</span>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
//             >
//               <Filter className="w-4 h-4" />
//               <span>{showFilters ? 'Hide' : 'Show'}</span>
//             </button>
//           </div>

//           {/* Filter Dropdowns */}
//           <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//             >
//               <option value="">All Statuses</option>
//               <option value="ACTIVE">Active</option>
//               <option value="PENDING">Pending</option>
//               <option value="REVOKED">Revoked</option>
//               <option value="EXPIRED">Expired</option>
//             </select>
//             <select
//               value={purposeFilter}
//               onChange={(e) => setPurposeFilter(e.target.value)}
//               className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//             >
//               <option value="">All Purposes</option>
//               <option value="loan">Loan</option>
//               <option value="insurance">Insurance</option>
//               <option value="credit">Credit</option>
//             </select>
//           </div>
//         </div>

//         {/* Results Count */}
//         <div className="mt-4 text-sm text-slate-600">
//           {filteredConsents.length} consent{filteredConsents.length !== 1 ? 's' : ''} found
//         </div>

//         {/* Desktop Table View */}
//         <div className="hidden lg:block mt-6">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-slate-200">
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Consent ID</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Customer ID</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Purpose</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">Expiry Date</th>
//                   <th className="text-left py-3 px-4 font-medium text-slate-700">View</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredConsents.map((consent) => (
//                   <tr key={consent.id} className="border-b border-slate-100 hover:bg-slate-50">
//                     <td className="py-3 px-4">
//                       <div className="font-medium text-slate-800">{consent.c_id}</div>
//                       <div className="text-sm text-slate-500">{new Date(consent.created_at).toLocaleDateString()}</div>
//                     </td>
//                     <td className="py-3 px-4 font-medium text-slate-800">{consent.user_identifier}</td>
//                     <td className="py-3 px-4 text-slate-600">{consent.purpose}</td>
//                     <td className="py-3 px-4">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
//                         {consent.status}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">
//                       <div className="flex items-center space-x-2">
//                         <span className="text-slate-600">{consent.expiry_date || 'N/A'}</span>
//                         {consent.expiry_date && isExpiringSoon(consent.expiry_date) && consent.status === 'ACTIVE' && (
//                           <div className="flex items-center space-x-1 text-yellow-600">
//                             <Calendar className="w-3 h-3" />
//                             <span className="text-xs">Expiring Soon</span>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="py-3 px-4">
//                       <button
//                         onClick={() => openConsentDetails(consent)}
//                         className="p-1 text-blue-600 hover:text-blue-800"
//                         title="View Details"
//                       >
//                         <ChevronDown className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Mobile Card View */}
//         <div className="lg:hidden mt-6 space-y-4">
//           {filteredConsents.map((consent) => (
//             <div key={consent.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
//               <div className="flex justify-between items-start mb-3">
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-medium text-slate-800 truncate">{consent.c_id}</h3>
//                   <p className="text-sm text-slate-500">{new Date(consent.created_at).toLocaleDateString()}</p>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(consent.status)}`}>
//                   {consent.status}
//                 </span>
//               </div>

//               <div className="space-y-2 mb-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-slate-600">Customer ID:</span>
//                   <span className="text-sm font-medium text-slate-800 truncate ml-2">{consent.user_identifier}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-slate-600">Purpose:</span>
//                   <span className="text-sm text-slate-800">{consent.purpose}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-slate-600">Expiry Date:</span>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm text-slate-800">{consent.expiry_date || 'N/A'}</span>
//                     {consent.expiry_date && isExpiringSoon(consent.expiry_date) && consent.status === 'ACTIVE' && (
//                       <div className="flex items-center space-x-1 text-yellow-600">
//                         <Calendar className="w-3 h-3" />
//                         <span className="text-xs">Expiring Soon</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end pt-3 border-t border-slate-100">
//                 <button
//                   onClick={() => openConsentDetails(consent)}
//                   className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
//                 >
//                   <Eye className="w-4 h-4" />
//                   <span>View Details</span>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Consent Details Modal */}
//       {selectedConsent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-xl font-bold text-slate-800">Consent Details</h3>
//                 <button
//                   onClick={closeConsentDetails}
//                   className="text-slate-500 hover:text-slate-700"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Consent ID</h4>
//                     <p className="text-slate-800">{selectedConsent.c_id}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Customer ID</h4>
//                     <p className="text-slate-800">{selectedConsent.user_identifier}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Status</h4>
//                     <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConsent.status)}`}>
//                       {selectedConsent.status}
//                     </p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Created Date</h4>
//                     <p className="text-slate-800">{new Date(selectedConsent.created_at).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Expiry Date</h4>
//                     <p className="text-slate-800">{selectedConsent.expiry_date || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600">Purpose</h4>
//                     <p className="text-slate-800">{selectedConsent.purpose}</p>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium text-slate-600">Data Fields</h4>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {selectedConsent.datafields.map((field, index) => (
//                       <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
//                         {field}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium text-slate-600">Consent Details</h4>
//                   <div className="mt-2 p-3 bg-slate-50 rounded text-sm">
//                     <pre className="whitespace-pre-wrap">{JSON.stringify(selectedConsent.consent_details, null, 2)}</pre>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium text-slate-600">Consent Signature</h4>
//                   <p className="mt-2 text-xs font-mono break-all">{selectedConsent.consent_signature}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Consents;

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Calendar } from 'lucide-react';
//import { createClient } from '@supabase/supabase-js';

interface Consent {
  c_id: string;
  user_identifier: string;
  purpose: string;
  //expiry_date: string | null;
  status: string;
  status_admin: string;
  created_at: string;
  fiu_id: string;
}

const Consents: React.FC = () => {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Initialize Supabase client
  // const supabase = createClient(
  //   "https://qsmwgqqvaivwgcrpbhpo.supabase.co",
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbXdncXF2YWl2d2djcnBiaHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjMyNzUsImV4cCI6MjA2NTczOTI3NX0.h_JsH4t76LUr5FqC8_dKWW8RizD-LcesOmIuocJoBKw"
  // );

  useEffect(() => {
    const fetchConsents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('org_auth_token');
        
        const response = await fetch('http://localhost:8000/consent/consents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch consents');
        }

        const data = await response.json();
        setConsents(data);
      } catch (error) {
        console.error('Error fetching consents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsents();
  }, []);



  
  // useEffect(() => {
  //   const fetchOrganizationId = () => {
  //     try {
  //       // Get the JWT token from localStorage
  //       const token = localStorage.getItem('org_auth_token');
        
  //       if (!token) {
  //         console.log('No auth token found');
  //         return;
  //       }

  //       // Parse the JWT to get the payload
  //       const payload = JSON.parse(atob(token.split('.')[1]));
  //       const orgId = payload.org_id;
        
  //       //console.log("Orgid from JWT:", orgId);
  //       setOrganizationId(orgId);
  //     } catch (error) {
  //       console.error('Error fetching organization ID:', error);
  //     }
  //   };

  //   fetchOrganizationId();
  // }, []);

  // useEffect(() => {
  //   const fetchConsents = async () => {
  //     if (!organizationId) return;
      
  //     try {
  //       setLoading(true);
  //       const { data, error } = await supabase
  //         .from('requested_consents')
  //         .select('c_id, user_identifier, purpose, status, status_admin, created_at, fiu_id')
  //         .eq('fiu_id', organizationId);

  //       if (error) throw error;
        
  //       setConsents(data || []);
  //     } catch (error) {
  //       console.error('Error fetching consents:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchConsents();
  // }, [organizationId, supabase]);

  // useEffect(() => {
  //   const fetchOrganizationId = async () => {
  //     try {
  //       // Get the current user session
  //       const { data: { user } } = await supabase.auth.getUser();
        
  //       if (user) {
  //         // Assuming organization ID is stored in user_metadata
  //         const orgId = user.user_metadata?.org_id;
  //         console.log("Orgid: "+orgId)
  //         setOrganizationId(orgId);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching organization ID:', error);
  //     }
  //   };

  //   fetchOrganizationId();
  // }, [supabase]);

  // useEffect(() => {
  //   const fetchConsents = async () => {
  //     if (!organizationId) return;
      
  //     try {
  //       setLoading(true);
  //       const { data, error } = await supabase
  //         .from('requested_consents')
  //         .select('c_id, user_identifier, purpose, expiry_date, status, status_admin, created_at, fiu_id')
  //         .eq('fiu_id', organizationId);

  //       if (error) throw error;
        
  //       setConsents(data || []);
  //     } catch (error) {
  //       console.error('Error fetching consents:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchConsents();
  // }, [organizationId, supabase]);

  //ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REVOKED'::text, 'EXPIRED'::text, 'REJECTED'::text])
  const getUiStatus = (status: string, statusAdmin: string): string => {
    if (statusAdmin === 'EXPIRED'|| status === 'EXPIRED') return 'EXPIRED';
    if (statusAdmin === 'REVOKED') return 'REVOKED';
    // if (status === 'REVOKED') return 'REVOKED';
    if (status === 'APPROVED' && statusAdmin === 'APPROVED') return 'ACTIVE';
    if (status === 'APPROVED' && statusAdmin === 'PENDING') return 'PENDING';
    if (status === 'PENDING' && statusAdmin === 'PENDING') return 'PENDING';
    if (status === 'APPROVED' && statusAdmin === 'REJECTED') return 'REJECTED';
    if (status === 'REJECTED' && statusAdmin === 'PENDING') return 'REJECTED';
    if (status === 'PENDING' && statusAdmin === 'REJECTED') return 'REJECTED';
    return 'PENDING'; // default case
  };

  const filteredConsents = consents.filter(consent => {
    const uiStatus = getUiStatus(consent.status, consent.status_admin);
    const matchesSearch = consent.user_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.c_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || uiStatus === statusFilter;
    const matchesPurpose = purposeFilter === '' || consent.purpose === purposeFilter;
    
    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVOKED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const ConsentDetailsModal = () => {
  if (!selectedConsent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-slate-800">Consent Details</h3>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Consent ID</p>
              <p className="font-medium">{selectedConsent.c_id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Customer ID</p>
              <p className="font-medium">{selectedConsent.user_identifier}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Purpose</p>
              <p className="font-medium">{selectedConsent.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(getUiStatus(selectedConsent.status, selectedConsent.status_admin))}`}>
                  {getUiStatus(selectedConsent.status, selectedConsent.status_admin)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Created At</p>
              <p className="font-medium">{new Date(selectedConsent.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Expiry Date</p>
              <p className="font-medium">
                {selectedConsent.expiry_date ? new Date(selectedConsent.expiry_date).toLocaleDateString() : 'N/A'}
                {selectedConsent.expiry_date && isExpiringSoon(selectedConsent.expiry_date) && (
                  <span className="ml-2 text-yellow-600 text-xs">(Expiring Soon)</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Add more fields as needed */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  if (loading) {
    console.log("Orgid: "+organizationId)
    return (
      <div className="text-center py-12 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading consents...</p>
      </div>
    );
  }

  if (consents.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Consents Yet</h3>
        <p className="text-slate-600 text-sm sm:text-base">You haven't requested any consents yet. Start by creating your first consent request.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Consent Requests</h2>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your data access requests</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Customer ID or Consent ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="flex justify-between items-center md:hidden">
            <span className="text-sm font-medium text-slate-700">Filters</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="REVOKED">Revoked</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="">All Purposes</option>
              <option value="Lending">Lending</option>
              <option value="Insurance">Insurance</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600">
          {filteredConsents.length} consent{filteredConsents.length !== 1 ? 's' : ''} found
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Consent ID</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Customer ID</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Purpose</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Expiry Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsents.map((consent) => {
                  const uiStatus = getUiStatus(consent.status, consent.status_admin);
                  return (
                    <tr key={consent.c_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{consent.c_id}</div>
                        <div className="text-sm text-slate-500">{new Date(consent.created_at).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{consent.user_identifier}</td>
                      <td className="py-3 px-4 text-slate-600">{consent.purpose}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(uiStatus)}`}>
                          {uiStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600">{consent.expiry_date ? new Date(consent.expiry_date).toLocaleDateString() : 'N/A'}</span>
                          {consent.expiry_date && isExpiringSoon(consent.expiry_date) && uiStatus === 'ACTIVE' && (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs">Expiring Soon</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View"
                           onClick={() => {
                            setSelectedConsent(consent);
                            setIsModalOpen(true);
                          }}
                        >
                          <Eye className="w-7 h-7" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden mt-6 space-y-4">
          {filteredConsents.map((consent) => {
            const uiStatus = getUiStatus(consent.status, consent.status_admin);
            return (
              <div key={consent.c_id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{consent.c_id}</h3>
                    <p className="text-sm text-slate-500">{new Date(consent.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(uiStatus)}`}>
                    {uiStatus}
                  </span>
                </div>

                {/* Card Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Customer ID:</span>
                    <span className="text-sm font-medium text-slate-800 truncate ml-2">{consent.user_identifier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Purpose:</span>
                    <span className="text-sm text-slate-800">{consent.purpose}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Expiry Date:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-800">{consent.expiry_date ? new Date(consent.expiry_date).toLocaleDateString() : 'N/A'}</span>
                      {consent.expiry_date && isExpiringSoon(consent.expiry_date) && uiStatus === 'ACTIVE' && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">Expiring Soon</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isModalOpen && <ConsentDetailsModal />}
    </div>
  );
};

export default Consents;