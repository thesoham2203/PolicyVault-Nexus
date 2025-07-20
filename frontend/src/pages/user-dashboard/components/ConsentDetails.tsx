import React from 'react';
import { X, Calendar, Building, Database, Shield, AlertTriangle } from 'lucide-react';

// Mock StatusChip component
const StatusChip = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-800 dark:text-green-200',
          border: 'border-green-200 dark:border-green-700'
        };
      case 'expired':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800/30',
          text: 'text-gray-800 dark:text-gray-200',
          border: 'border-gray-200 dark:border-gray-600'
        };
      case 'revoked':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-200',
          border: 'border-red-200 dark:border-red-700'
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-800 dark:text-blue-200',
          border: 'border-blue-200 dark:border-blue-700'
        };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Mock Consent type
interface Consent {
  id: string;
  fiuName: string;
  status: string;
  dataFields: string[];
  purpose: string;
  createdDate: string;
  expiryDate: string;
}

interface ConsentDetailsProps {
  consent: Consent;
  isOpen: boolean;
  onClose: () => void;
  onRevokeConsent: (consentId: string) => void;
}

const ConsentDetails: React.FC<ConsentDetailsProps> = ({ 
  consent, 
  isOpen, 
  onClose, 
  onRevokeConsent 
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = () => {
    const expiryDate = new Date(consent.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 lg:p-8">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-lg lg:max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-white/50 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/80 to-purple-600/80 dark:from-purple-400/80 dark:to-purple-500/80 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Building size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">{consent.fiuName}</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Consent ID: {consent.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 touch-manipulation"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 lg:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-4 sm:space-y-6">
            {/* Status Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <StatusChip status={consent.status} />
              {consent.status === 'active' && daysUntilExpiry <= 7 && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertTriangle size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">
                    Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Consent Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Financial Information User</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{consent.fiuName}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Purpose</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{consent.purpose}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Created Date</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">{formatDate(consent.createdDate)}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Expiry Date</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">{formatDate(consent.expiryDate)}</p>
                </div>
              </div>
            </div>

            {/* Data Fields */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Database size={18} className="sm:w-5 sm:h-5" />
                Shared Data Fields
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {consent.dataFields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm"
                  >
                    <Shield size={14} className="sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 leading-tight">{field}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions Timeline */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar size={18} className="sm:w-5 sm:h-5" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-green-800 dark:text-green-200">Consent Created</p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-300">{formatDate(consent.createdDate)}</p>
                  </div>
                </div>
                
                {consent.status === 'expired' && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">Consent Expired</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{formatDate(consent.expiryDate)}</p>
                    </div>
                  </div>
                )}
                
                {consent.status === 'revoked' && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                    <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-red-800 dark:text-red-200">Consent Revoked</p>
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">Manually revoked by user</p>
                    </div>
                  </div>
                )}
                
                {consent.status === 'active' && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg sm:rounded-xl backdrop-blur-sm">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-blue-800 dark:text-blue-200">Currently Active</p>
                      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">
                        Valid until {formatDate(consent.expiryDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg sm:rounded-xl p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Shield size={16} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm sm:text-base font-medium text-blue-800 dark:text-blue-200">Security & Privacy</span>
              </div>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Your data is protected by end-to-end encryption and can only be accessed by the authorized FIU 
                within the scope of this consent. You maintain full control and can revoke access at any time.
              </p>
            </div>
          </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 border-t border-gray-200 dark:border-gray-700 ">
          <button
            onClick={onClose}
            className="order-2 sm:order-1 px-4 py-2.5 sm:py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm sm:text-base touch-manipulation"
          >
            Close
          </button>
          
          {/* {consent.status === 'active' && (
            <button
              onClick={() => {
                onRevokeConsent(consent.id);
                onClose();
              }}
              className="order-1 sm:order-2 px-4 sm:px-6 py-3 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-sm sm:text-base touch-manipulation transform hover:scale-[1.02]"
            >
              Revoke Consent
            </button>
          )} */}
        </div>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

// Demo component with mock data
const mockConsent: Consent = {
  id: 'CNS-2024-001',
  fiuName: 'ABC Bank Ltd.',
  status: 'active',
  dataFields: ['Account Balance', 'Transaction History', 'Personal Details', 'Income Information'],
  purpose: 'To process your loan application and assess creditworthiness based on your financial history.',
  createdDate: '2024-06-15',
  expiryDate: '2024-12-15'
};

export default function App() {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleRevokeConsent = (consentId: string) => {
    console.log('Revoking consent:', consentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
      <div className="max-w-md mx-auto pt-20">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          Open Consent Details
        </button>
      </div>
      
      <ConsentDetails
        consent={mockConsent}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRevokeConsent={handleRevokeConsent}
      />
    </div>
  );
}