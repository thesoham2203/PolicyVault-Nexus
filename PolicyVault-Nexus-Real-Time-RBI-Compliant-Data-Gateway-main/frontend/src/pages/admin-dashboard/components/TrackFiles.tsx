// import { useState } from 'react';
// import { FileText, TrendingUp, X, Clock, MapPin, Monitor } from 'lucide-react';

// export default function TrackFiles() {
//   // Sample data - replace with your actual data
//   const [fileData] = useState([
//     { file_id: 'DOC-2024-001', org_name: 'Acme Corporation', access_count: 156 },
//     { file_id: 'DOC-2024-002', org_name: 'TechStart Inc', access_count: 89 },
//     { file_id: 'DOC-2024-003', org_name: 'Global Industries', access_count: 234 },
//     { file_id: 'DOC-2024-004', org_name: 'Innovate Labs', access_count: 45 },
//     { file_id: 'DOC-2024-005', org_name: 'Acme Corporation', access_count: 178 },
//     { file_id: 'DOC-2024-006', org_name: 'NextGen Solutions', access_count: 92 },
//     { file_id: 'DOC-2024-007', org_name: 'Digital Dynamics', access_count: 67 },
//     { file_id: 'DOC-2024-008', org_name: 'TechStart Inc', access_count: 203 },
//     { file_id: 'DOC-2024-009', org_name: 'Cloud Systems', access_count: 121 },
//     { file_id: 'DOC-2024-010', org_name: 'Global Industries', access_count: 156 },
//     { file_id: 'DOC-2024-011', org_name: 'Future Tech', access_count: 88 },
//     { file_id: 'DOC-2024-012', org_name: 'Innovate Labs', access_count: 145 },
//   ]);

//   // Sample access logs - replace with your actual data
//   const [accessLogs] = useState({
//     'DOC-2024-001': [
//       {
//         id: '1',
//         file_id: 'DOC-2024-001',
//         org_id: 'org-001',
//         ip_address: '192.168.1.100',
//         device_info: { browser: 'Chrome', os: 'Windows 10', device: 'Desktop' },
//         location: { city: 'New York', country: 'USA' },
//         created_at: '2024-10-15T10:30:00Z'
//       },
//       {
//         id: '2',
//         file_id: 'DOC-2024-001',
//         org_id: 'org-001',
//         ip_address: '192.168.1.105',
//         device_info: { browser: 'Safari', os: 'macOS', device: 'MacBook Pro' },
//         location: { city: 'San Francisco', country: 'USA' },
//         created_at: '2024-10-14T14:20:00Z'
//       },
//       {
//         id: '3',
//         file_id: 'DOC-2024-001',
//         org_id: 'org-001',
//         ip_address: '10.0.0.50',
//         device_info: { browser: 'Firefox', os: 'Ubuntu', device: 'Desktop' },
//         location: { city: 'London', country: 'UK' },
//         created_at: '2024-10-13T09:15:00Z'
//       }
//     ],
//     'DOC-2024-002': [
//       {
//         id: '4',
//         file_id: 'DOC-2024-002',
//         org_id: 'org-002',
//         ip_address: '172.16.0.10',
//         device_info: { browser: 'Edge', os: 'Windows 11', device: 'Desktop' },
//         location: { city: 'Boston', country: 'USA' },
//         created_at: '2024-10-15T11:45:00Z'
//       }
//     ]
//   });

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);

//   const filteredData = fileData.filter(
//     item =>
//       item.file_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.org_name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const totalAccess = fileData.reduce((sum, item) => sum + item.access_count, 0);
//   const totalFiles = fileData.length;
//   const avgAccess = Math.round(totalAccess / totalFiles);

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const handleFileClick = (file) => {
//     setSelectedFile(file);
//   };

//   const handleClose = () => {
//     setSelectedFile(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 animate-fade-in">
//           <h1 className="text-3xl sm:text-4xl font-bold text-primary-900 mb-2">
//             File Access Dashboard
//           </h1>
//           <p className="text-primary-600">Monitor and track file access across organizations</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
//           <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-medium">Total Files</p>
//                 <p className="text-3xl font-bold text-yellow-500 mt-1">{totalFiles}</p>
//               </div>
//               <div className="bg-yellow-500 p-3 rounded-lg">
//                 <FileText className="w-6 h-6 text-white" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-medium">Total Access</p>
//                 <p className="text-3xl font-bold text-green-500 mt-1">{totalAccess}</p>
//               </div>
//               <div className="bg-green-500 p-3 rounded-lg">
//                 <TrendingUp className="w-6 h-6 text-white" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow duration-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-medium">Avg Access</p>
//                 <p className="text-3xl font-bold text-orange-500 mt-1">{avgAccess}</p>
//               </div>
//               <div className="bg-orange-500 p-3 rounded-lg">
//                 <div className="w-6 h-6 flex items-center justify-center text-white font-bold text-xl">
//                   ~
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-4">
//           {/* Main Content Area */}
//           <div className={`transition-all duration-300 ${selectedFile ? 'w-1/2' : 'w-full'}`}>
//             {/* Search Bar */}
//             <div className="mb-6 animate-slide-up">
//               <div className="relative">
//                 <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search by file ID or organization name..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-200 bg-white shadow-soft"
//                 />
//               </div>
//             </div>

//             {/* File Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
//               {filteredData.map((item, index) => (
//                 <div
//                   key={item.file_id}
//                   onClick={() => handleFileClick(item)}
//                   className="bg-primary-100 rounded-xl p-5 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 border border-primary-200 cursor-pointer"
//                   style={{ animationDelay: `${index * 50}ms` }}
//                 >
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="bg-primary-200 p-2 rounded-lg">
//                       <FileText className="w-5 h-5 text-primary-700" />
//                     </div>
//                     <div className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
//                       {item.access_count}
//                     </div>
//                   </div>
                  
//                   <h3 className="text-sm font-bold text-primary-900 mb-2 truncate" title={item.file_id}>
//                     {item.file_id}
//                   </h3>
                  
//                   <p className="text-sm text-primary-700 truncate" title={item.org_name}>
//                     {item.org_name}
//                   </p>
                  
//                   <div className="mt-4 pt-3 border-t border-primary-200">
//                     <div className="flex items-center justify-between text-xs">
//                       <span className="text-primary-600">Access Count</span>
//                       <span className="text-primary-800 font-semibold">{item.access_count} times</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* No Results */}
//             {filteredData.length === 0 && (
//               <div className="text-center py-12">
//                 <p className="text-primary-600 text-lg">No files found matching your search.</p>
//               </div>
//             )}
//           </div>

//           {/* Access Logs Panel */}
//           {selectedFile && (
//             <div className="w-1/2 animate-slide-up">
//               <div className="bg-white rounded-xl shadow-soft-lg p-6 sticky top-8">
//                 <div className="flex items-center justify-between mb-6">
//                   <div>
//                     <h2 className="text-xl font-bold text-primary-900">Access Logs</h2>
//                     <p className="text-sm text-primary-600 mt-1">{selectedFile.file_id}</p>
//                   </div>
//                   <button
//                     onClick={handleClose}
//                     className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
//                   >
//                     <X className="w-5 h-5 text-primary-600" />
//                   </button>
//                 </div>

//                 <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
//                   {accessLogs[selectedFile.file_id]?.map((log) => (
//                     <div
//                       key={log.id}
//                       className="bg-primary-50 rounded-lg p-4 border border-primary-100 hover:bg-primary-100 transition-colors"
//                     >
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex items-center gap-2">
//                           <Clock className="w-4 h-4 text-primary-600" />
//                           <span className="text-xs text-primary-700 font-medium">
//                             {formatDate(log.created_at)}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="space-y-2">
//                         <div className="flex items-center gap-2">
//                           <Monitor className="w-4 h-4 text-primary-500" />
//                           <div className="text-xs">
//                             <span className="text-primary-900 font-medium">
//                               {log.device_info.browser}
//                             </span>
//                             <span className="text-primary-600"> • {log.device_info.os}</span>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <MapPin className="w-4 h-4 text-primary-500" />
//                           <span className="text-xs text-primary-700">
//                             {log.location.city}, {log.location.country}
//                           </span>
//                         </div>

//                         <div className="flex items-center gap-2 pt-2 border-t border-primary-200">
//                           <span className="text-xs text-primary-600">IP:</span>
//                           <span className="text-xs text-primary-900 font-mono">
//                             {log.ip_address}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   )) || (
//                     <div className="text-center py-8">
//                       <p className="text-primary-600">No access logs available for this file.</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { FileText, TrendingUp, X, Clock, MapPin, Monitor, Loader2 } from 'lucide-react';

export default function TrackFiles() {
  const [fileData, setFileData] = useState([]);
  const [accessLogs, setAccessLogs] = useState({});
  const [totalAccess, setTotalAccess] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [avgAccess, setAvgAccess] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/track-files/dashboard');
      
      if (!response.ok) {
        // Try to get error details from response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Server error: ${response.status}`);
        } else {
          throw new Error(`Server error: ${response.status} - The API endpoint may not be configured correctly`);
        }
      }
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API returned non-JSON response. Please check your backend configuration.');
      }
      
      const data = await response.json();
      
      setFileData(data.file_data || []);
      setAccessLogs(data.access_logs || {});
      setTotalAccess(data.total_access || 0);
      setTotalFiles(data.total_files || 0);
      setAvgAccess(data.avg_access || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = fileData.filter(
    item =>
      item.c_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.org_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleClose = () => {
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-blue-600 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">
            File Access Dashboard
          </h1>
          <p className="text-blue-600">Monitor and track file access across organizations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Files</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{totalFiles}</p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Access</p>
                <p className="text-3xl font-bold text-green-500 mt-1">{totalAccess}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Avg Access</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">{avgAccess}</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <div className="w-6 h-6 flex items-center justify-center text-white font-bold text-xl">
                  ~
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Main Content Area */}
          <div className={`transition-all duration-300 ${selectedFile ? 'w-1/2' : 'w-full'}`}>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by file ID or organization name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 bg-white shadow-md"
                />
              </div>
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredData.map((item, index) => (
                <div
                  key={item.file_id}
                  onClick={() => handleFileClick(item)}
                  className="bg-blue-50 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-blue-200 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {item.access_count}
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-bold text-blue-900 mb-2 truncate" title={item.c_id}>
                    {item.c_id}
                  </h3>
                  
                  <p className="text-sm text-blue-700 truncate" title={item.org_name}>
                    {item.org_name}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600">Access Count</span>
                      <span className="text-blue-800 font-semibold">{item.access_count} times</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-blue-600 text-lg">No files found matching your search.</p>
              </div>
            )}
          </div>

          {/* Access Logs Panel */}
          {selectedFile && (
            <div className="w-1/2">
              <div className="bg-white rounded-xl shadow-xl p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">Access Logs</h2>
                    <p className="text-sm text-blue-600 mt-1">{selectedFile.c_id}</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-blue-600" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                  {accessLogs[selectedFile.file_id]?.map((log) => (
                    <div
                      key={log.id}
                      className="bg-blue-50 rounded-lg p-4 border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {log.device_info && (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-blue-500" />
                                <div className="text-xs">
                                <div className="text-blue-900 font-medium">
                                    • Mac Address: <span className="text-blue-600">{log.device_info.mac || 'Unknown'}</span>
                                </div>
                                <div className="text-blue-900"> 
                                     • Arch: <span className="text-blue-600">{log.device_info.arch || 'Unknown'}</span>
                                </div>
                                <div className="text-blue-900"> 
                                     • OS_Type: <span className="text-blue-600">{log.device_info.os_type || 'Unknown'}</span>
                                </div>
                                </div>
                            </div>

                            <div className="text-xs pl-6">
                                <div className="text-blue-900">
                                • Release: <span className="text-blue-600">{log.device_info.release || 'Unknown'}</span>
                                </div>
                                <div className="text-blue-900"> 
                                     • Platform: <span className="text-blue-600">{log.device_info.platform || 'Unknown'}</span>
                                </div>
                                <div className="text-blue-900"> 
                                     • Node Version: <span className="text-blue-600">{log.device_info.node_version || 'Unknown'}</span>
                                </div>
                            </div>
                            </div>

                        )}

                        {log.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-700">
                              {log.location.ip || 'Localhost'}
                            </span>
                          </div>
                        )}

                        {log.ip_address && (
                          <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                            <span className="text-xs text-blue-600">IP:</span>
                            <span className="text-xs text-blue-900 font-mono">
                              {log.ip_address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-blue-600">No access logs available for this file.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}