import React, { useState } from 'react';
import { Eye, Shield, Calendar, Building, Database, TrendingUp, CreditCard, Activity, DollarSign, ChevronDown } from 'lucide-react';
import StatusChip from './StatusChip';
import { Consent } from '../types';

interface DataAccessViewerProps {
  consents: Consent[];
}

const DataAccessViewer: React.FC<DataAccessViewerProps> = ({ consents }) => {
  const [selectedConsent, setSelectedConsent] = useState<string>(
    consents.find(c => c.status === 'active')?.id || consents[0]?.id || ''
  );
  const [isConsentDropdownOpen, setIsConsentDropdownOpen] = useState(false);

  const currentConsent = consents.find(c => c.id === selectedConsent);

  const mockFinancialData = {
    accountNumber: 'HDFC00001234',
    balance: 125000,
    transactions: [
      { date: '2024-03-15', description: 'Salary Credit', amount: 75000, type: 'credit' },
      { date: '2024-03-14', description: 'Online Purchase - Amazon', amount: -2500, type: 'debit' },
      { date: '2024-03-13', description: 'ATM Withdrawal', amount: -5000, type: 'debit' },
      { date: '2024-03-12', description: 'UPI Payment', amount: -1200, type: 'debit' },
      { date: '2024-03-11', description: 'Investment SIP', amount: -10000, type: 'debit' }
    ],
    metadata: {
      accountType: 'Savings Account',
      branchCode: 'HDFC0001',
      ifscCode: 'HDFC0000123',
      accountHolder: 'John Doe'
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    return accountNumber.replace(/(.{4})(.*)(.{4})/, '$1****$3');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const isDataVisible = (dataType: string) => {
    if (!currentConsent) return false;
    const fieldMap: { [key: string]: string } = {
      'balance': 'Balance',
      'transactions': 'Transactions',
      'metadata': 'Account Metadata'
    };
    return currentConsent.dataFields.includes(fieldMap[dataType]);
  };

  const isActive = currentConsent?.status === 'active';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 min-h-screen">
      <div className="relative flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Mobile Consent Selector - Dropdown */}
        <div className="lg:hidden ">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-3xl shadow-xl border border-white/40 dark:border-white/10 hover:shadow-blue-500/20 transition-all duration-300 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Select Consent</h2>
            </div>
            
            <div className="">
              <button
                onClick={() => setIsConsentDropdownOpen(!isConsentDropdownOpen)}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                    <Building size={16} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {currentConsent?.fiuName || 'Select Consent'}
                    </div>
                    {currentConsent && (
                      <div className="flex items-center gap-2 mt-1">
                        <StatusChip status={currentConsent.status} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-400 transition-transform ${isConsentDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {isConsentDropdownOpen && (
                <div className="top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {consents.map((consent) => (
                    <button
                      key={consent.id}
                      onClick={() => {
                        setSelectedConsent(consent.id);
                        setIsConsentDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedConsent === consent.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center shadow-sm">
                          <Building size={12} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate flex-1">
                          {consent.fiuName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <StatusChip status={consent.status} size="sm" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-20">
                          {consent.id}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Consent Selector */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white/30 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Consent</h2>
            </div>
            <div className="space-y-3">
              {consents.map((consent) => (
                <button
                  key={consent.id}
                  onClick={() => setSelectedConsent(consent.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedConsent === consent.id
                      ? 'border-blue-200/30 dark:border-blue-400 bg-white/50 dark:bg-gray-700/30 shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/30 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md dark:hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Building size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{consent.fiuName}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <StatusChip status={consent.status} size="sm" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {consent.id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{consent.purpose}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data View */}
        <div className="lg:col-span-2 z-20">
          <div className="bg-white/30 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200/50 dark:border-gray-700/50  dark:from-gray-800/50 dark:to-gray-700/50 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <Database size={18} sm:size={20} className="text-green-600 dark:text-green-400" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Access Based on Consent
                  </h2>
                </div>
                {currentConsent && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                      <Shield size={14} sm:size={16} />
                      <span className="font-mono truncate">{currentConsent.id}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                      <Calendar size={14} sm:size={16} />
                      <span className="whitespace-nowrap">Expires: {new Date(currentConsent.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {!currentConsent ? (
                <div className="text-center py-12 sm:py-20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                    <Database size={32} sm:size={40} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">No consent selected</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">Select a consent to view the accessible data</p>
                </div>
              ) : !isActive ? (
                <div className="text-center py-12 sm:py-20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                    <Eye size={32} sm:size={40} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Consent not active</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">This consent is {currentConsent.status} and cannot access data</p>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8">
                  
                  {/* Account Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <CreditCard size={18} sm:size={20} className="text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-600/50">
                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account Number</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-2 font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 break-all">
                            {maskAccountNumber(mockFinancialData.accountNumber)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account Holder</label>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                            {isDataVisible('metadata') ? mockFinancialData.metadata.accountHolder : '••••••'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balance */}
                  <div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <DollarSign size={18} sm:size={20} className="text-green-600 dark:text-green-400" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Account Balance</h3>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg sm:rounded-xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-600/50">
                      {isDataVisible('balance') ? (
                        <div className="text-center">
                          <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {formatCurrency(mockFinancialData.balance)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3 font-medium">Current Balance</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-2xl sm:text-4xl font-bold text-gray-400 dark:text-gray-500">₹••,•••</p>
                          <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
                            <Shield size={16} className="text-red-500" />
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                              Balance data not permitted by consent
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transactions */}
                  <div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <Activity size={18} sm:size={20} className="text-blue-600 dark:text-blue-400" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-600/50">
                      {isDataVisible('transactions') ? (
                        <div className="overflow-x-auto">
                          {/* Mobile Card View */}
                          <div className="block sm:hidden">
                            <div className="divide-y divide-gray-200/50 dark:divide-gray-600/50">
                              {mockFinancialData.transactions.map((transaction, index) => (
                                <div key={index} className="p-4 hover:bg-white/50 dark:hover:bg-gray-700/30 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {transaction.description}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(transaction.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className={`text-sm font-semibold ml-3 ${
                                      transaction.type === 'credit' 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Desktop Table View */}
                          <div className="hidden sm:block">
                            <table className="min-w-full">
                              <thead className="bg-white/50 dark:bg-gray-800/50">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-600/50">
                                {mockFinancialData.transactions.map((transaction, index) => (
                                  <tr key={index} className="hover:bg-white/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                      {transaction.description}
                                    </td>
                                    <td className={`px-6 py-4 text-sm text-right font-semibold ${
                                      transaction.type === 'credit' 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 sm:py-16">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                            <Shield size={24} sm:size={32} className="text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-red-600 dark:text-red-400 font-semibold text-base sm:text-lg mb-2">
                            Transaction data not permitted by consent
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            This FIU cannot access your transaction history
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  {isDataVisible('metadata') && (
                    <div>
                      <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <Database size={18} sm:size={20} className="text-purple-600 dark:text-purple-400" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Account Metadata</h3>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-600/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account Type</label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                              {mockFinancialData.metadata.accountType}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">IFSC Code</label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-2 font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 break-all">
                              {mockFinancialData.metadata.ifscCode}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Branch Code</label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-2 font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 break-all">
                              {mockFinancialData.metadata.branchCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAccessViewer;