// import React, { useState } from 'react';
// import { MoreVertical, Calendar, Building, Database, Eye, TrendingUp, Shield, Activity, Clock } from 'lucide-react';

// // StatusChip component
// const StatusChip = ({ status }) => {
//   const getStatusStyle = () => {
//     switch (status) {
//       case 'active':
//         return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
//       case 'expired':
//         return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700';
//       case 'revoked':
//         return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
//       default:
//         return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
//     }
//   };

//   return (
//     <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle()}`}>
//       {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );
// };

// // Sample data for demonstration
// const sampleConsents = [
//   {
//     id: 'consent-001',
//     fiuName: 'ABC Bank',
//     dataFields: ['Account Balance', 'Transaction History', 'Personal Details'],
//     purpose: 'Loan Application Processing',
//     status: 'active',
//     expiryDate: '2024-12-20',
//     requestedDate: '2024-06-20'
//   },
//   {
//     id: 'consent-002',
//     fiuName: 'XYZ Financial Services',
//     dataFields: ['Income Details', 'Investment Portfolio'],
//     purpose: 'Investment Advisory Services',
//     status: 'active',
//     expiryDate: '2024-11-15',
//     requestedDate: '2024-05-15'
//   },
//   {
//     id: 'consent-003',
//     fiuName: 'DEF Insurance',
//     dataFields: ['Account Balance', 'Personal Details'],
//     purpose: 'Insurance Premium Calculation',
//     status: 'expired',
//     expiryDate: '2024-06-01',
//     requestedDate: '2024-03-01'
//   }
// ];

// interface ConsentDashboardProps {
//   consents: Consent[];
//   onRevokeConsent: (consentId: string) => void;
//   onViewDetails: (consent: Consent) => void;
// }

// const ConsentDashboard: React.FC<ConsentDashboardProps> = ({ 
//   onRevokeConsent, 
//   onViewDetails 
// }) => {
//   const [consents] = useState(sampleConsents);
//   const [selectedConsent, setSelectedConsent] = useState(null);
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getStatusCounts = () => {
//     return {
//       active: consents.filter(c => c.status === 'active').length,
//       expired: consents.filter(c => c.status === 'expired').length,
//       revoked: consents.filter(c => c.status === 'revoked').length,
//       total: consents.length
//     };
//   };

//   const handleRevokeConsent = (consentId: string) => {
//     onRevokeConsent(consentId);
//   };

//   const handleViewDetails = (consent: { id: string; fiuName: string; dataFields: string[]; purpose: string; status: string; expiryDate: string; requestedDate: string; }) => {
//     onViewDetails(consent)
//   };

//   const statusCounts = getStatusCounts();

//   return (
//     <div className={isDarkMode ? 'dark' : ''}>
//       <div className="min-h-screen transition-colors duration-300">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
//           {/* Header Section */}
//           <div className="mb-6 sm:mb-8">
            
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
//             <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                   <Database size={16} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Total</p>
//                   <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.total}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                   <Activity size={16} className="sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Active</p>
//                   <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.active}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
//                   <Clock size={16} className="sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Expired</p>
//                   <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.expired}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
//                   <Shield size={16} className="sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Revoked</p>
//                   <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.revoked}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Consents Table/Cards */}
//           <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden">
//             <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
//               <div className="flex items-center gap-3">
//                 <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Consents</h2>
//               </div>
//             </div>

//             {/* Desktop Table View */}
//             <div className="hidden lg:block overflow-x-auto relative bg-white/20 dark:bg-white/5 backdrop-blur-xl  shadow-2xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300">
//               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                 <thead className="dark:bg-gray-800">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                       FIU Name
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                       Data Shared
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                       Purpose
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                       Expiry Date
//                     </th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                   {consents.map((consent) => (
//                     <tr key={consent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
//                             <Building size={16} className="text-blue-600 dark:text-blue-400" />
//                           </div>
//                           <div>
//                             <div className="text-sm font-semibold text-gray-900 dark:text-white">{consent.fiuName}</div>
//                             <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {consent.id}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex flex-wrap gap-1">
//                           {consent.dataFields.map((field) => (
//                             <span
//                               key={field}
//                               className="inline-flex px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg font-medium border border-blue-200 dark:border-blue-700"
//                             >
//                               {field}
//                             </span>
//                           ))}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium max-w-xs">
//                         <div className="truncate">{consent.purpose}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <StatusChip status={consent.status} />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
//                           <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
//                           {formatDate(consent.expiryDate)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => handleViewDetails(consent)}
//                             className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
//                             title="View Details"
//                           >
//                             <Eye size={16} />
//                           </button>
//                           <div className="relative">
//                             <button
//                               onClick={() => setSelectedConsent(
//                                 selectedConsent === consent.id ? null : consent.id
//                               )}
//                               className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
//                             >
//                               <MoreVertical size={16} />
//                             </button>
//                             {selectedConsent === consent.id && (
//                               <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
//                                 <div className="py-1">
//                                   {consent.status === 'active' && (
//                                     <button
//                                       onClick={() => {
//                                         handleRevokeConsent(consent.id);
//                                         setSelectedConsent(null);
//                                       }}
//                                       className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
//                                     >
//                                       Revoke Consent
//                                     </button>
//                                   )}
//                                   <button
//                                     onClick={() => {
//                                       handleViewDetails(consent);
//                                       setSelectedConsent(null);
//                                     }}
//                                     className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
//                                   >
//                                     View Details
//                                   </button>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Card View */}
//             <div className="lg:hidden relative bg-white/30 dark:bg-gray-800  backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 hover:shadow-blue-500/20 transition-all duration-300">
//               {consents.map((consent) => (
//                 <div key={consent.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
//                         <Building size={16} className="text-blue-600 dark:text-blue-400" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{consent.fiuName}</div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {consent.id}</div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <StatusChip status={consent.status} />
//                       <div className="relative">
//                         <button
//                           onClick={() => setSelectedConsent(
//                             selectedConsent === consent.id ? null : consent.id
//                           )}
//                           className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
//                         >
//                           <MoreVertical size={16} />
//                         </button>
//                         {selectedConsent === consent.id && (
//                           <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
//                             <div className="py-1">
//                               {consent.status === 'active' && (
//                                 <button
//                                   onClick={() => {
//                                     handleRevokeConsent(consent.id);
//                                     setSelectedConsent(null);
//                                   }}
//                                   className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
//                                 >
//                                   Revoke Consent
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => {
//                                   handleViewDetails(consent);
//                                   setSelectedConsent(null);
//                                 }}
//                                 className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
//                               >
//                                 View Details
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="mb-3">
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
//                     <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{consent.purpose}</p>
//                   </div>

//                   <div className="mb-3">
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Data Requested</p>
//                     <div className="flex flex-wrap gap-1">
//                       {consent.dataFields.map((field) => (
//                         <span
//                           key={field}
//                           className="inline-flex px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md font-medium border border-blue-200 dark:border-blue-700"
//                         >
//                           {field}
//                         </span>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
//                     <div className="flex items-center gap-1">
//                       <Calendar size={12} />
//                       <span>Expires: {formatDate(consent.expiryDate)}</span>
//                     </div>
//                     <button
//                       onClick={() => handleViewDetails(consent)}
//                       className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
//                     >
//                       <Eye size={12} />
//                       <span>View Details</span>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {consents.length === 0 && (
//               <div className="text-center py-12 sm:py-20">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
//                   <Database size={32} className="sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
//                 </div>
//                 <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">No consents yet</h3>
//                 <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm sm:text-lg px-4">
//                   When you approve consent requests, they'll appear here as active consents that you can manage.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConsentDashboard;

import React, { useState, useEffect } from 'react';
import { MoreVertical, Calendar, Building, Database, Eye, TrendingUp, Shield, Activity, Clock } from 'lucide-react';

interface Consent {
  c_id: string;
  user_identifier: string;
  purpose: string;
  datafields: string[];
  status: string;
  status_admin: string;
  created_at: string;
  fiu_id: string;
}

interface Organization {
  id: string;
  org_name: string;
}

// StatusChip component
const StatusChip = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'REVOKED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      case 'EXPIRED':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
      case 'REJECTED':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface ConsentDashboardProps {
  onRevokeConsent: (consentId: string) => void;
  onViewDetails: (consent: Consent) => void;
}

const ConsentDashboard: React.FC<ConsentDashboardProps> = ({ 
  onRevokeConsent, 
  onViewDetails 
}) => {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingConsents, setLoadingConsents] = useState(true);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  // useEffect(() => {
  //   const fetchConsents = async () => {
  //     try {
  //       setLoading(true);
  //       const token = localStorage.getItem('org_auth_token');
        
  //       // Fetch consents
  //       const response = await fetch('http://localhost:8000/consent/consents', {
  //         headers: {
  //           'Authorization': `${token}`
  //         }
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to fetch consents');
  //       }

  //       const data = await response.json();
  //       setConsents(data);

  //       // Fetch organizations to map fiu_id to organization names
  //       const orgResponse = await fetch('http://localhost:8000/organizations', {
  //         headers: {
  //           'Authorization': `${token}`
  //         }
  //       });

  //       if (orgResponse.ok) {
  //         const orgData = await orgResponse.json();
  //         setOrganizations(orgData);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchConsents();
  // }, []);


  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('org_auth_token');
      
      const [consentsResponse, orgsResponse] = await Promise.all([
        fetch('http://localhost:8000/consent/consents-admin', {
          headers: { 'Authorization': `${token}` }
        }),
        fetch('http://localhost:8000/consent/organizations', {
          headers: { 'Authorization': `${token}` }
        })
      ]);

      const [consentsData, orgsData] = await Promise.all([
        consentsResponse.json(),
        orgsResponse.json()
      ]);

      console.log('Raw organizations data:', orgsData); // Debug log

      setConsents(consentsData);
      setOrganizations(orgsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
  const getUiStatus = (status: string, statusAdmin: string): string => {
    if (statusAdmin === 'EXPIRED' || status === 'EXPIRED') return 'EXPIRED';
    if (statusAdmin === 'REVOKED') return 'REVOKED';
    if (status === 'APPROVED' && statusAdmin === 'APPROVED') return 'ACTIVE';
    if (status === 'APPROVED' && statusAdmin === 'PENDING') return 'PENDING';
    if (status === 'PENDING' && statusAdmin === 'PENDING') return 'PENDING';
    if (status === 'APPROVED' && statusAdmin === 'REJECTED') return 'REJECTED';
    if (status === 'REJECTED' && statusAdmin === 'PENDING') return 'REJECTED';
    if (status === 'PENDING' && statusAdmin === 'REJECTED') return 'REJECTED';
    return 'PENDING';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusCounts = () => {
    const counts = {
      active: 0,
      expired: 0,
      revoked: 0,
      rejected: 0,
      pending: 0,
      total: consents.length
    };

    consents.forEach(consent => {
      const status = getUiStatus(consent.status, consent.status_admin);
      switch (status) {
        case 'ACTIVE':
          counts.active++;
          break;
        case 'EXPIRED':
          counts.expired++;
          break;
        case 'REVOKED':
          counts.revoked++;
          break;
        case 'REJECTED':
          counts.rejected++;
          break;
        case 'PENDING':
          counts.pending++;
          break;
      }
    });

    return counts;
  };

  const handleRevokeConsent = (consentId: string) => {
    onRevokeConsent(consentId);
  };

  const handleViewDetails = (consent: Consent) => {
    onViewDetails(consent);
  };

  // const getOrganizationName = (fiuId: string) => {
  //   // const org = organizations.find(org => org.id === fiuId);
  //   // return org ? org.name : 'Unknown Organization';
  //    if (!organizations || organizations.length === 0) {
  //       return `Organization (${fiuId})`;
  //     }
  //     const org = organizations.find(org => org.id === fiuId);
  //     return org ? org.name : `Unknown Organization (${fiuId})`;
  // };
 const getOrganizationName = (fiuId: string) => {
  console.log('Current organizations:', organizations);
  console.log('Looking for fiuId:', fiuId);
  
  if (!fiuId) {
    console.warn('No fiuId provided');
    return 'No Organization';
  }

  // Handle case where organizations haven't loaded yet
  if (!organizations || organizations.length === 0) {
    return 'Loading organizations...';
  }

  // Find the matching organization
  const org = organizations.find(org => 
    org.id === fiuId || 
    org.id?.toString() === fiuId?.toString()
  );

  if (org) {
    return org.org_name;  // Changed from org.name to org.org_name
  }

  // Fallback to showing the ID if organization not found
  return `Organization (${fiuId})`;
};

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="text-center py-12 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading consents...</p>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Database size={16} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.total}</p>
                </div>
              </div>
            </div>

            <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Activity size={16} className="sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Active</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.active}</p>
                </div>
              </div>
            </div>

            <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Clock size={16} className="sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Expired</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.expired}</p>
                </div>
              </div>
            </div>

            <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Shield size={16} className="sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate">Revoked</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.revoked}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consents Table/Cards */}
          <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Consents</h2>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto relative bg-white/20 dark:bg-white/5 backdrop-blur-xl shadow-2xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data Shared
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {consents.map((consent) => {
                    const uiStatus = getUiStatus(consent.status, consent.status_admin);
                    return (
                      <tr key={consent.c_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                              <Building size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {getOrganizationName(consent.fiu_id)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {consent.c_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {consent.user_identifier}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {consent.datafields.map((field) => (
                              <span
                                key={field}
                                className="inline-flex px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg font-medium border border-blue-200 dark:border-blue-700"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium max-w-xs">
                          <div className="truncate">{consent.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusChip status={uiStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {formatDate(consent.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(consent)}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setSelectedConsent(
                                  selectedConsent === consent.c_id ? null : consent.c_id
                                )}
                                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {selectedConsent === consent.c_id && (
                                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                                  <div className="py-1">
                                    {uiStatus === 'ACTIVE' && (
                                      <button
                                        onClick={() => {
                                          handleRevokeConsent(consent.c_id);
                                          setSelectedConsent(null);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                                      >
                                        Revoke Consent
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        handleViewDetails(consent);
                                        setSelectedConsent(null);
                                      }}
                                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden relative bg-white/30 dark:bg-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 hover:shadow-blue-500/20 transition-all duration-300">
              {consents.map((consent) => {
                const uiStatus = getUiStatus(consent.status, consent.status_admin);
                return (
                  <div key={consent.c_id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {getOrganizationName(consent.fiu_id)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {consent.c_id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusChip status={uiStatus} />
                        <div className="relative">
                          <button
                            onClick={() => setSelectedConsent(
                              selectedConsent === consent.c_id ? null : consent.c_id
                            )}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {selectedConsent === consent.c_id && (
                            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                              <div className="py-1">
                                {uiStatus === 'ACTIVE' && (
                                  <button
                                    onClick={() => {
                                      handleRevokeConsent(consent.c_id);
                                      setSelectedConsent(null);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                                  >
                                    Revoke Consent
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleViewDetails(consent);
                                    setSelectedConsent(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer ID</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{consent.user_identifier}</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{consent.purpose}</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Data Requested</p>
                      <div className="flex flex-wrap gap-1">
                        {consent.datafields.map((field) => (
                          <span
                            key={field}
                            className="inline-flex px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md font-medium border border-blue-200 dark:border-blue-700"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Created: {formatDate(consent.created_at)}</span>
                      </div>
                      <button
                        onClick={() => handleViewDetails(consent)}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Eye size={12} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {consents.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Database size={32} className="sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">No consents yet</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm sm:text-lg px-4">
                  When you approve consent requests, they'll appear here as active consents that you can manage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentDashboard;