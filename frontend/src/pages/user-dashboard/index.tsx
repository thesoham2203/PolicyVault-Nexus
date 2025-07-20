import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import Sidebar from './components/Header';
import ConsentDashboard from './components/ConsentDashboard';
import ConsentRejectedDashboard from './components/ConsentRejectedDashboard';
import PendingRequests from './components/PendingRequests';
// import DataAccessViewer from './components/DataAccessViewer';
// import AuditLog from './components/AuditLog';
import ConsentDetails from './components/ConsentDetails';
import LandingPage from './components/LandingPage';
import { mockConsents, mockAuditLog, mockConsentRequests } from './data/mockData';
import { Consent, AuditLogEntry, ConsentRequest } from './types';
import { ChevronLeft, Clock, KeySquare, ScrollText, ShieldCheck } from 'lucide-react';


function UserDashboard() {
  const [currentView, setCurrentView] = useState('pending-requests');
  const [consents, setConsents] = useState<Consent[]>(mockConsents);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(mockAuditLog);
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>(mockConsentRequests);
  const [selectedConsentForDetails, setSelectedConsentForDetails] = useState<Consent | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    setSignedIn(true);
  })
  const [collapsed, setCollapsed] = useState(false);

  const tabs = [
    { key: 'pending-requests', label: 'Pending Requests', icon: <Clock className='text-white' /> },
    { key: 'my-consents', label: 'Consents', icon: <ShieldCheck className='text-white'/> },
    { key: 'audit', label: 'Audit Log', icon: <ScrollText className='text-white'/> },
    { key: 'data-access', label: 'Data Access', icon: <KeySquare className='text-white'/> },
  ]
  const handleApproveRequest = (requestId: string) => {
    const request = consentRequests.find(req => req.id === requestId);
    if (!request) return;

    // Create new consent from approved request
    const newConsent: Consent = {
      id: `CNS-${String(consents.length + 1).padStart(3, '0')}`,
      fiuName: request.fiuName,
      dataFields: request.dataFields,
      purpose: request.purpose,
      expiryDate: request.expiryDate,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    // Create audit log entry
    const newAuditEntry: AuditLogEntry = {
      id: `AUD-${String(auditLog.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      fiuName: request.fiuName,
      consentId: newConsent.id,
      action: 'approved',
      details: `Consent request approved for ${request.purpose.toLowerCase()}`
    };

    // Update state
    setConsents(prev => [newConsent, ...prev]);
    setAuditLog(prev => [newAuditEntry, ...prev]);
    setConsentRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'approved' as const }
          : req
      )
    );
  };

  const handleRejectRequest = (requestId: string, reason?: string) => {
    const request = consentRequests.find(req => req.id === requestId);
    if (!request) return;

    // Create audit log entry
    const newAuditEntry: AuditLogEntry = {
      id: `AUD-${String(auditLog.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      fiuName: request.fiuName,
      consentId: requestId,
      action: 'rejected',
      details: reason ? `Consent request rejected: ${reason}` : 'Consent request rejected by user'
    };

    // Update state
    setAuditLog(prev => [newAuditEntry, ...prev]);
    setConsentRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'rejected' as const, rejectionReason: reason }
          : req
      )
    );
  };

  const handleRevokeConsent = (consentId: string) => {
    setConsents(prev =>
      prev.map(consent =>
        consent.id === consentId
          ? { ...consent, status: 'revoked' as const }
          : consent
      )
    );

    const revokedConsent = consents.find(c => c.id === consentId);
    if (revokedConsent) {
      const newAuditEntry: AuditLogEntry = {
        id: `AUD-${String(auditLog.length + 1).padStart(3, '0')}`,
        timestamp: new Date().toISOString(),
        fiuName: revokedConsent.fiuName,
        consentId: consentId,
        action: 'revoked',
        details: 'User revoked consent manually'
      };

      setAuditLog(prev => [newAuditEntry, ...prev]);
    }
  };

  const handleViewDetails = (consent: Consent) => {
    setSelectedConsentForDetails(consent);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'pending-requests':
        return (
          <PendingRequests
            requests={consentRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        );
      case 'approved-requests':
        return (
          <ConsentDashboard
            onRevokeConsent={handleRevokeConsent}
            onViewDetails={handleViewDetails}
          />
        );
      case 'rejected-requests':
        return (
          <ConsentRejectedDashboard
            onRevokeConsent={handleRevokeConsent}
            onViewDetails={handleViewDetails}
          />
        );
      default:
        return (
          <PendingRequests
            requests={consentRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        );
    }
  };

  if (signedIn) {
    return (
      <div className={`bg-white dark:bg-gray-700`}>
  {/* Header appears only on desktop inside Sidebar */}
  <Sidebar
    currentView={currentView}
    onViewChange={setCurrentView}
    collapsed={collapsed}
    setCollapsed={setCollapsed}
  />

  {/* Overlay for sidebar on mobile */}
  {!collapsed && (
    <div
      className="fixed inset-0 bg-black/40 z-40 lg:hidden"
      onClick={() => setCollapsed(true)}
    />
  )}

  {/* Main Content Area */}
  <div
  className={`transition-all duration-300 ${collapsed ? 'lg:ml-0' : 'lg:ml-64'} bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}
>
    <main className="min-h-screen min-w-screen pb-8">
      {/* Section header for mobile only */}
      <div className="flex items-center w-full space-x-4 py-4 px-4 ">
        <button
          className="text-gray-600 hover:text-gray-900 dark:hover:text-white p-2 rounded transition"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed && <ChevronLeft size={20} />}
        </button>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          {tabs.find((tab) => tab.key === currentView)?.icon}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-3 text-gray-600 font-semibold dark:text-gray-400 text-xl sm:text-2xl">
          <span>{tabs.find((tab) => tab.key === currentView)?.label}</span>
        </div>
      </div>

      {/* Render view */}
      {renderCurrentView()}
    </main>

    {/* Consent Details Modal */}
    {selectedConsentForDetails && (
      <ConsentDetails
        consent={selectedConsentForDetails}
        isOpen={!!selectedConsentForDetails}
        onClose={() => setSelectedConsentForDetails(null)}
        onRevokeConsent={handleRevokeConsent}
      />
    )}

    {/* Footer */}
    <footer className="bg-blue/30 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Powered by Open Data. You're always in control.
          </p>
        </div>
      </div>
    </footer>
  </div>
</div>

    );

  } else return (<LandingPage onSignIn={() => { setSignedIn(true) }} />);
}

function App() {
  return (
    <ThemeProvider>
      <UserDashboard />
    </ThemeProvider>
  );
}

export default UserDashboard;