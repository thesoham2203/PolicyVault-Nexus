// import React, { useState, useEffect } from 'react';
// import { Calendar, Filter, CheckCircle, XCircle, ChevronDown, Eye } from 'lucide-react';
// // import React, { useRef, useState, useEffect } from 'react';

// // Mock AuditLog type for demonstration
// interface AuditLog {
//   id: string;
//   timestamp: string;
//   action: string;
//   consentId: string;
//   status: string;
//   ipAddress: string;
//   details: string;
// }

// interface AuditLogProps {
//   logs: AuditLog[];
// }

// const AuditLogComponent: React.FC<AuditLogProps> = ({ logs }) => {
//   const [actionFilter, setActionFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [dateFilter, setDateFilter] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
//   const [logs, setLogs] = useState<AuditLog[]>([]);
//   const [loading, setLoading] = useState(true);
//   const filteredLogs = logs.filter(log => {
//     const matchesAction = actionFilter === '' || log.action === actionFilter;
//     const matchesStatus = statusFilter === '' || log.status === statusFilter;
//     const matchesDate = dateFilter === '' || log.timestamp.includes(dateFilter);
    
//     return matchesAction && matchesStatus && matchesDate;
//   });

//   const getActionColor = (action: string) => {
//     switch (action) {
//       case 'FETCH':
//         return 'bg-blue-100 text-blue-800';
//       case 'CREATE':
//         return 'bg-green-100 text-green-800';
//       case 'REVOKE':
//         return 'bg-red-100 text-red-800';
//       case 'VIEW':
//         return 'bg-purple-100 text-purple-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   useEffect(() => {
//   const loadLogs = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchAuditLogs({
//         action: actionFilter,
//         status: statusFilter,
//         date: dateFilter
//       });
//       setLogs(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   loadLogs();
// }, [actionFilter, statusFilter, dateFilter]);

//   const fetchAuditLogs = async (filters = {}) => {
//       const params = new URLSearchParams();
//       if (filters.action) params.append('action', filters.action);
//       if (filters.status) params.append('status', filters.status);
//       if (filters.date) params.append('date', filters.date);
      
//       const response = await fetch(`/api/audit-logs?${params.toString()}`);
//       if (!response.ok) throw new Error('Failed to fetch audit logs');
//       return await response.json();
// };

//   const getStatusIcon = (status: string) => {
//     return status === 'SUCCESS' ? (
//       <CheckCircle className="w-4 h-4 text-green-600" />
//     ) : (
//       <XCircle className="w-4 h-4 text-red-600" />
//     );
//   };

//   const formatTimestamp = (timestamp: string) => {
//     return new Date(timestamp).toLocaleString();
//   };

//   const toggleRowExpansion = (id: string) => {
//     const newExpandedRows = new Set(expandedRows);
//     if (newExpandedRows.has(id)) {
//       newExpandedRows.delete(id);
//     } else {
//       newExpandedRows.add(id);
//     }
//     setExpandedRows(newExpandedRows);
//   };

//   // Mock data for demonstration
//   const mockLogs: AuditLog[] = [
//     {
//       id: '1',
//       timestamp: '2024-01-15T10:30:00Z',
//       action: 'FETCH',
//       consentId: 'CONS-001',
//       status: 'SUCCESS',
//       ipAddress: '192.168.1.100',
//       details: 'User data fetched for analytics processing'
//     },
//     {
//       id: '2',
//       timestamp: '2024-01-15T09:15:00Z',
//       action: 'CREATE',
//       consentId: 'CONS-002',
//       status: 'SUCCESS',
//       ipAddress: '192.168.1.101',
//       details: 'New consent record created for marketing purposes'
//     },
//     {
//       id: '3',
//       timestamp: '2024-01-15T08:45:00Z',
//       action: 'REVOKE',
//       consentId: 'CONS-003',
//       status: 'ERROR',
//       ipAddress: '192.168.1.102',
//       details: 'Failed to revoke consent - invalid consent ID'
//     }
//   ];

//   const displayLogs = logs.length > 0 ? filteredLogs : mockLogs.filter(log => {
//     const matchesAction = actionFilter === '' || log.action === actionFilter;
//     const matchesStatus = statusFilter === '' || log.status === statusFilter;
//     const matchesDate = dateFilter === '' || log.timestamp.includes(dateFilter);
    
//     return matchesAction && matchesStatus && matchesDate;
//   });

//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       <div className="text-center sm:text-left">
//         <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Audit Logs</h2>
//         <p className="text-slate-600 mt-1 text-sm sm:text-base">Track all actions and data access requests</p>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         {/* Filter Section */}
//         <div className="p-4 sm:p-6 border-b border-slate-200">
//           <div className="flex items-center justify-between mb-4 sm:hidden">
//             <h3 className="font-medium text-slate-700">Filters</h3>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
//             >
//               <Filter className="w-4 h-4" />
//               <span className="text-sm">Filter</span>
//               <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//             </button>
//           </div>
          
//           <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
//               <select
//                 value={actionFilter}
//                 onChange={(e) => setActionFilter(e.target.value)}
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Actions</option>
//                 <option value="FETCH">Fetch</option>
//                 <option value="CREATE">Create</option>
//                 <option value="REVOKE">Revoke</option>
//                 <option value="VIEW">View</option>
//               </select>
              
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="">All Statuses</option>
//                 <option value="SUCCESS">Success</option>
//                 <option value="ERROR">Error</option>
//               </select>
              
//               <input
//                 type="date"
//                 value={dateFilter}
//                 onChange={(e) => setDateFilter(e.target.value)}
//                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Desktop Table View */}
//         <div className="hidden lg:block overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-slate-200 bg-slate-50">
//                 <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Timestamp</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Action</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Consent ID</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Status</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">IP Address</th>
//                 <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Details</th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayLogs.map((log) => (
//                 <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
//                   <td className="py-3 px-4 text-sm text-slate-600">
//                     {formatTimestamp(log.timestamp)}
//                   </td>
//                   <td className="py-3 px-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
//                       {log.action}
//                     </span>
//                   </td>
//                   <td className="py-3 px-4 font-medium text-slate-800 text-sm">{log.consentId}</td>
//                   <td className="py-3 px-4">
//                     <div className="flex items-center space-x-2">
//                       {getStatusIcon(log.status)}
//                       <span className="text-sm font-medium text-slate-700">{log.status}</span>
//                     </div>
//                   </td>
//                   <td className="py-3 px-4 text-sm text-slate-600 font-mono">{log.ipAddress}</td>
//                   <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">{log.details}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile Card View */}
//         <div className="lg:hidden">
//           {displayLogs.map((log) => (
//             <div key={log.id} className="border-b border-slate-100 last:border-b-0">
//               <div className="p-4 hover:bg-slate-50">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center space-x-3">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
//                       {log.action}
//                     </span>
//                     <div className="flex items-center space-x-1">
//                       {getStatusIcon(log.status)}
//                       <span className="text-sm font-medium text-slate-700">{log.status}</span>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => toggleRowExpansion(log.id)}
//                     className="p-1 hover:bg-slate-200 rounded-full"
//                   >
//                     <Eye className="w-4 h-4 text-slate-600" />
//                   </button>
//                 </div>
                
//                 <div className="space-y-2">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="text-sm font-medium text-slate-800">{log.consentId}</p>
//                       <p className="text-xs text-slate-600">{formatTimestamp(log.timestamp)}</p>
//                     </div>
//                   </div>
                  
//                   {expandedRows.has(log.id) && (
//                     <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
//                       <div>
//                         <p className="text-xs text-slate-500 uppercase tracking-wide">IP Address</p>
//                         <p className="text-sm text-slate-700 font-mono">{log.ipAddress}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-slate-500 uppercase tracking-wide">Details</p>
//                         <p className="text-sm text-slate-700">{log.details}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Empty State */}
//         {displayLogs.length === 0 && (
//           <div className="text-center py-12 px-4">
//             <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//             <p className="text-slate-500">No audit logs found matching your criteria.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuditLogComponent;

import React, { useState, useEffect } from 'react';
import { Calendar, Filter, CheckCircle, XCircle, ChevronDown, Eye, Loader } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  consent_id: string;
  c_id?: string;
  status: string;
  ip_address?: string;
  details: string;
}

const AuditLogComponent = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    // const fetchAuditLogs = async () => {
    //   try {
    //     setLoading(true);
    //     setError(null);
        
    //     const params = new URLSearchParams();
    //     if (actionFilter) params.append('action', actionFilter);
    //     if (statusFilter) params.append('status', statusFilter);
    //     if (dateFilter) {
    //       params.append('start_date', dateFilter);
    //       params.append('end_date', dateFilter);
    //     }
        
    //     const response = await fetch(`http://localhost:8000/audit_log/audit-logs`);
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch audit logs');
    //     }
        
    //     const data = await response.json();
    //     setLogs(data);
    //   } catch (err) {
    //     setError(err instanceof Error ? err.message : 'Unknown error occurred');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchAuditLogs = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    if (actionFilter) params.append('action', actionFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (dateFilter) {
      params.append('date', dateFilter); // Changed from start_date/end_date to match backend
    }
    
    // Include the query parameters in the URL
    const response = await fetch(`http://localhost:8000/audit_log/audit-logs/?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }
    
    const data = await response.json();
    setLogs(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error occurred');
  } finally {
    setLoading(false);
  }
};

    fetchAuditLogs();
  }, [actionFilter, statusFilter, dateFilter]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'FETCH':
        return 'bg-blue-100 text-blue-800';
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'SUCCESS' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>Error loading audit logs: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Audit Logs</h2>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">Track all actions and data access requests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter Section */}
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <h3 className="font-medium text-slate-700">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Actions</option>
                <option value="FETCH">Fetch</option>
                <option value="CREATE">Create</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESSFUL">Success</option>
                <option value="ERROR">Error</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Action</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Consent ID</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 text-sm">
                    {log.c_id || log.consent_id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className="text-sm font-medium text-slate-700">
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                    {log.ip_address || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {logs.map((log) => (
            <div key={log.id} className="border-b border-slate-100 last:border-b-0">
              <div className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(log.status)}
                      <span className="text-sm font-medium text-slate-700">{log.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRowExpansion(log.id)}
                    className="p-1 hover:bg-slate-200 rounded-full"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{log.c_id || log.consent_id}</p>
                      <p className="text-xs text-slate-600">{formatTimestamp(log.timestamp)}</p>
                    </div>
                  </div>
                  
                  {expandedRows.has(log.id) && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">IP Address</p>
                        <p className="text-sm text-slate-700 font-mono">{log.ip_address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Details</p>
                        <p className="text-sm text-slate-700">{log.details}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {logs.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogComponent;