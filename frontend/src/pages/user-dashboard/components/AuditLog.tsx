import React, { useState } from 'react';
import { Search, Filter, Calendar, CheckCircle, AlertTriangle, XCircle, Clock, Download, Activity, BarChart3, TrendingUp, ChevronDown, Menu } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  fiuName: string;
  consentId: string;
  action: string;
  details: string;
}

interface AuditLogProps {
  auditLog: AuditLogEntry[];
}

const AuditLog: React.FC<AuditLogProps> = ({ auditLog = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sample data for demonstration
  const sampleData: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2025-06-25T10:30:00Z',
      fiuName: 'Bank ABC',
      consentId: 'CNS-001-2025',
      action: 'created',
      details: 'Consent created for account access'
    },
    {
      id: '2',
      timestamp: '2025-06-25T09:15:00Z',
      fiuName: 'Credit Union XYZ',
      consentId: 'CNS-002-2025',
      action: 'accessed',
      details: 'Financial data accessed by authorized FIP'
    },
    {
      id: '3',
      timestamp: '2025-06-24T16:45:00Z',
      fiuName: 'Investment Corp',
      consentId: 'CNS-003-2025',
      action: 'approved',
      details: 'Consent approved by customer'
    },
    {
      id: '4',
      timestamp: '2025-06-24T14:20:00Z',
      fiuName: 'Loan Services Ltd',
      consentId: 'CNS-004-2025',
      action: 'revoked',
      details: 'Consent revoked by customer request'
    },
    {
      id: '5',
      timestamp: '2025-06-23T11:30:00Z',
      fiuName: 'Digital Bank',
      consentId: 'CNS-005-2025',
      action: 'expired',
      details: 'Consent expired after 90 days'
    }
  ];

  const data = auditLog.length > 0 ? auditLog : sampleData;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
      case 'accessed':
        return <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />;
      case 'approved':
        return <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />;
      case 'revoked':
        return <XCircle size={16} className="text-red-600 dark:text-red-400" />;
      case 'rejected':
        return <XCircle size={16} className="text-orange-600 dark:text-orange-400" />;
      case 'expired':
        return <Clock size={16} className="text-gray-600 dark:text-gray-400" />;
      default:
        return <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border-green-200/50 dark:border-green-700/50';
      case 'accessed':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-200 border-blue-200/50 dark:border-blue-700/50';
      case 'approved':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200/50 dark:border-emerald-700/50';
      case 'revoked':
        return 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-800 dark:text-red-200 border-red-200/50 dark:border-red-700/50';
      case 'rejected':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-800 dark:text-orange-200 border-orange-200/50 dark:border-orange-700/50';
      case 'expired':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-gray-600/50';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-200 border-yellow-200/50 dark:border-yellow-700/50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const filteredLog = data.filter(entry => {
    const matchesSearch = entry.fiuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.consentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Filters</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-gray-600 dark:text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Filters */}
        <div className={`bg-white/50 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8 ${!showFilters ? 'hidden sm:block' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
              />
            </div>

            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="accessed">Accessed</option>
                <option value="approved">Approved</option>
                <option value="revoked">Revoked</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors text-sm sm:text-base"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white/30 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 ">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity Timeline ({filteredLog.length} entries)
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    FIU Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Consent ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/30 dark:bg-gray-800/50 divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredLog.map((entry) => {
                  const { date, time } = formatTimestamp(entry.timestamp);
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">{date}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.fiuName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                          {entry.consentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getActionIcon(entry.action)}
                          <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full capitalize border shadow-sm ${getActionColor(entry.action)}`}>
                            {entry.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{entry.details}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={18} className="text-purple-600 dark:text-purple-400" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Activity Timeline ({filteredLog.length})
            </h2>
          </div>
          
          {filteredLog.map((entry) => {
            const { date, time } = formatTimestamp(entry.timestamp);
            return (
              <div key={entry.id} className="bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getActionIcon(entry.action)}
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize border shadow-sm ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{date}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{time}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">FIU Name</span>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.fiuName}</div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Consent ID</span>
                    <div className="text-xs text-gray-900 dark:text-gray-100 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg inline-block mt-1">
                      {entry.consentId}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Details</span>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{entry.details}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLog.length === 0 && (
          <div className="bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <Filter size={32} className="sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">No matching entries</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-base sm:text-lg px-4">
              Try adjusting your search or filter criteria to see more results.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActionFilter('all');
                setDateFilter('all');
                setShowFilters(false);
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm sm:text-base"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Stats */}
        {filteredLog.length > 0 && (
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {['created', 'accessed', 'approved', 'revoked', 'rejected', 'expired'].map((action) => {
              const count = filteredLog.filter(entry => entry.action === action).length;
              return (
                <div key={action} className="group bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      {getActionIcon(action)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize font-medium truncate">{action}</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;