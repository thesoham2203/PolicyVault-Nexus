import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import RequestConsent from './components/RequestConsent';
import Consents from './components/Consents';
import FetchData from './components/FetchData';
import AuditLogComponent from './components/AuditLog';
import { ConsentRequest, AuditLog } from './types';
import { mockConsents, mockAuditLogs } from './utils/mockData';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [consents, setConsents] = useState<ConsentRequest[]>(mockConsents);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

  const handleRequestConsent = () => setActiveTab('request');

  const handleSubmitConsent = (newConsent: ConsentRequest) => {
    setConsents(prev => [...prev, newConsent]);
    const newAuditLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CREATE',
      consentId: newConsent.id,
      status: 'SUCCESS',
      ipAddress: '192.168.1.100',
      details: 'New consent request created'
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
    setActiveTab('consents');
  };

  const handleRevokeConsent = (consentId: string) => {
    setConsents(prev =>
      prev.map(consent =>
        consent.id === consentId ? { ...consent, status: 'REVOKED' as const } : consent
      )
    );
    const newAuditLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'REVOKE',
      consentId,
      status: 'SUCCESS',
      ipAddress: '192.168.1.100',
      details: 'Consent revoked'
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleFetchData = (consentId: string) => {
    setActiveTab('fetch');
    const newAuditLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'FETCH',
      consentId,
      status: 'SUCCESS',
      ipAddress: '192.168.1.100',
      details: 'Data fetched successfully'
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onRequestConsent={handleRequestConsent} />;
      case 'request':
        return <RequestConsent onBack={() => setActiveTab('dashboard')} onSubmit={handleSubmitConsent} />;
      case 'consents':
        return (
          <Consents consents={consents} onRevoke={handleRevokeConsent} onFetchData={handleFetchData} />
        );
      case 'fetch':
        return <FetchData consents={consents} />;
      case 'audit':
        return <AuditLogComponent logs={auditLogs} />;
      default:
        return <Dashboard onRequestConsent={handleRequestConsent} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex relative">
  {/* Navigation - overlay on mobile, sidebar on desktop */}
  <div className={`
    transition-all duration-300 
    ${collapsed ? 'w-16' : 'w-64'} 
    md:flex-shrink-0
    md:relative md:translate-x-0
    fixed inset-y-0 left-0 z-50
    ${collapsed ? 'translate-x-0' : 'translate-x-0'}
    md:block
  `}>
    <Navigation
      activeTab={activeTab}
      onTabChange={setActiveTab}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />    
  </div>

  {/* Overlay backdrop for mobile when nav is expanded */}
  {!collapsed && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      onClick={() => setCollapsed(true)}
    />
  )}

  {/* Main content - full width on mobile when collapsed, adjusted when expanded */}
  <div className={`
    flex-1 p-4 md:p-8 w-full min-h-screen
    transition-all duration-300
    ${collapsed ? 'md:ml-0' : 'md:ml-0'}
    ${collapsed ? 'pl-20' : 'pl-20'}
    md:pl-8
  `}>
    {renderContent()}
  </div>
</div>
  );
}

export default App;
