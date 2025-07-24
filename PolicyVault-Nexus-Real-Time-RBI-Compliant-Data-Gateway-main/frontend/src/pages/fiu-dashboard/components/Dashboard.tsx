// import React from 'react';
// import { TrendingUp, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
// import { mockStats } from '../utils/mockData';

// interface DashboardProps {
//   onRequestConsent: () => void;
// }

// const Dashboard: React.FC<DashboardProps> = ({ onRequestConsent }) => {
//   const stats = [
//     {
//       label: 'Total Requests',
//       value: mockStats.totalRequests,
//       icon: TrendingUp,
//       color: 'bg-blue-500',
//       textColor: 'text-blue-600'
//     },
//     {
//       label: 'Active Consents',
//       value: mockStats.activeConsents,
//       icon: CheckCircle,
//       color: 'bg-green-500',
//       textColor: 'text-green-600'
//     },
//     {
//       label: 'Revoked',
//       value: mockStats.revokedConsents,
//       icon: XCircle,
//       color: 'bg-red-500',
//       textColor: 'text-red-600'
//     },
//     {
//       label: 'Expired',
//       value: mockStats.expiredConsents,
//       icon: AlertTriangle,
//       color: 'bg-yellow-500',
//       textColor: 'text-yellow-600'
//     }
//   ];

//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard Overview</h2>
//           <p className="text-slate-600 mt-1 text-sm sm:text-base">Monitor your consent requests and data access</p>
//         </div>
//         <button
//           onClick={onRequestConsent}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
//         >
//           <Plus className="w-4 h-4" />
//           <span className="text-sm sm:text-base">Request New Consent</span>
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{stat.label}</p>
//                   <p className={`text-xl sm:text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
//                 </div>
//                 <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
//                   <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//         {/* Consent Status Distribution */}
//         <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
//           <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Consent Status Distribution</h3>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
//                 <span className="text-sm text-slate-600">Active</span>
//               </div>
//               <span className="text-sm font-medium text-slate-800">{mockStats.activeConsents}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
//                 <span className="text-sm text-slate-600">Expired</span>
//               </div>
//               <span className="text-sm font-medium text-slate-800">{mockStats.expiredConsents}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
//                 <span className="text-sm text-slate-600">Revoked</span>
//               </div>
//               <span className="text-sm font-medium text-slate-800">{mockStats.revokedConsents}</span>
//             </div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
//           <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
//           <div className="space-y-3">
//             <button
//               onClick={onRequestConsent}
//               className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               <div className="flex items-center space-x-3">
//                 <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
//                 <div className="min-w-0">
//                   <p className="font-medium text-slate-800 text-sm sm:text-base">Request New Consent</p>
//                   <p className="text-xs sm:text-sm text-slate-600">Create a new data access request</p>
//                 </div>
//               </div>
//             </button>
//             <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
//               <div className="flex items-center space-x-3">
//                 <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
//                 <div className="min-w-0">
//                   <p className="font-medium text-slate-800 text-sm sm:text-base">View Active Consents</p>
//                   <p className="text-xs sm:text-sm text-slate-600">Manage your current data access</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, XCircle, AlertTriangle, Plus, Clock, Ban } from 'lucide-react';

interface DashboardProps {
  onRequestConsent: () => void;
}

interface ConsentStats {
  totalRequests: number;
  activeConsents: number;
  revokedConsents: number;
  expiredConsents: number;
  pendingConsents: number;
  rejectedConsents: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onRequestConsent }) => {
  const [stats, setStats] = useState<ConsentStats>({
    totalRequests: 0,
    activeConsents: 0,
    revokedConsents: 0,
    expiredConsents: 0,
    pendingConsents: 0,
    rejectedConsents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsentStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('org_auth_token');
        
        const response = await fetch('http://localhost:8000/consent/stats', {
          headers: {
            'Authorization': `${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch consent stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching consent stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsentStats();
  }, []);

  const statCards = [
    {
      label: 'Total Requests',
      value: stats.totalRequests,
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Active Consents',
      value: stats.activeConsents,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      label: 'Revoked',
      value: stats.revokedConsents,
      icon: XCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      label: 'Expired',
      value: stats.expiredConsents,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      label: 'Pending',
      value: stats.pendingConsents,
      icon: Clock,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      label: 'Rejected',
      value: stats.rejectedConsents,
      icon: Ban,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Monitor your consent requests and data access</p>
        </div>
        <button
          onClick={onRequestConsent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm sm:text-base">Request New Consent</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Consent Status Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Consent Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-slate-600">Active</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{stats.activeConsents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-slate-600">Pending</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{stats.pendingConsents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-slate-600">Rejected</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{stats.rejectedConsents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-slate-600">Expired</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{stats.expiredConsents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-slate-600">Revoked</span>
              </div>
              <span className="text-sm font-medium text-slate-800">{stats.revokedConsents}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={onRequestConsent}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm sm:text-base">Request New Consent</p>
                  <p className="text-xs sm:text-sm text-slate-600">Create a new data access request</p>
                </div>
              </div>
            </button>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm sm:text-base">View Active Consents</p>
                  <p className="text-xs sm:text-sm text-slate-600">Manage your current data access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;