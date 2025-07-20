import React, { useState } from 'react';
import { MoreVertical, Calendar, Building, Database, Eye, TrendingUp, Shield, Activity, Clock } from 'lucide-react';

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

// Sample data for demonstration
const sampleConsents = [
  {
    id: 'consent-001',
    fiuName: 'ABC Bank',
    dataFields: ['Account Balance', 'Transaction History', 'Personal Details'],
    purpose: 'Loan Application Processing',
    status: 'Rejected',
    expiryDate: '2024-06-20'
  },
  {
    id: 'consent-002',
    fiuName: 'XYZ Financial Services',
    dataFields: ['Income Details', 'Investment Portfolio'],
    purpose: 'Investment Advisory Services',
    status: 'Rejected',
    expiryDate: '2024-11-15',
  },
  {
    id: 'consent-003',
    fiuName: 'DEF Insurance',
    dataFields: ['Account Balance', 'Personal Details'],
    purpose: 'Insurance Premium Calculation',
    status: 'Rejected',
    expiryDate: '2024-06-01',
  }
];

interface ConsentRejectedDashboardProps {
  consents: Consent[];
  onRevokeConsent: (consentId: string) => void;
  onViewDetails: (consent: Consent) => void;
}

const ConsentRejectedDashboard: React.FC<ConsentRejectedDashboardProps> = ({  
  onViewDetails 
}) => {
  const [consents] = useState(sampleConsents);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const handleViewDetails = (consent: { id: string; fiuName: string; dataFields: string[]; purpose: string; status: string; expiryDate: string; requestedDate: string; }) => {
    onViewDetails(consent)
  };

//   const statusCounts = getStatusCounts();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            
          </div>

          {/* Stats Cards
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
          </div> */}

          {/* Consents Table/Cards */}
          <div className="relative bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revoked Consents</h2>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto relative bg-white/20 dark:bg-white/5 backdrop-blur-xl  shadow-2xl border border-white/40 dark:border-white/10 dark:hover:shadow-blue-500/20 transition-all duration-300">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      FIU Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data Requested
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {consents.map((consent) => (
                    <tr key={consent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Building size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{consent.fiuName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {consent.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {consent.dataFields.map((field) => (
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        {/* <StatusChip status={consent.status} /> */} Rejected
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
                          <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                          {formatDate(consent.expiryDate)}
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
                                selectedConsent === consent.id ? null : consent.id
                              )}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {selectedConsent === consent.id && (
                              <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                                <div className="py-1">
                                  {/* {consent.status === 'active' && (
                                    <button
                                      onClick={() => {
                                        handleRevokeConsent(consent.id);
                                        setSelectedConsent(null);
                                      }}
                                      className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                                    >
                                      Revoke Consent
                                    </button>
                                  )} */}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden relative bg-white/30 dark:bg-gray-800  backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 hover:shadow-blue-500/20 transition-all duration-300">
              {consents.map((consent) => (
                <div key={consent.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{consent.fiuName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {consent.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <StatusChip status={consent.status} /> */} Rejected
                      <div className="relative">
                        {/* <button
                          onClick={() => setSelectedConsent(
                            selectedConsent === consent.id ? null : consent.id
                          )}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <MoreVertical size={16} />
                        </button> */}
                        {selectedConsent === consent.id && (
                          <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                            <div className="py-1">
                              {/* {consent.status === 'active' && (
                                <button
                                  onClick={() => {
                                    handleRevokeConsent(consent.id);
                                    setSelectedConsent(null);
                                  }}
                                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                                >
                                  Revoke Consent
                                </button>
                              )} */}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{consent.purpose}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Data Requested</p>
                    <div className="flex flex-wrap gap-1">
                      {consent.dataFields.map((field) => (
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
                      <span>Expires: {formatDate(consent.expiryDate)}</span>
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
              ))}
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

export default ConsentRejectedDashboard;