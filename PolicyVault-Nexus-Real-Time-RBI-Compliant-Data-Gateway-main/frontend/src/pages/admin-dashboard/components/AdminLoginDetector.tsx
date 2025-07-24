import React, { useState } from 'react';
import { Shield, Users, AlertTriangle, Mail, Key, Eye, EyeOff, Clock, MapPin, Smartphone } from 'lucide-react';

const CanaraBank = () => {
  const [email, setEmail] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  // Mock data for admins
  const [admins] = useState([
    { id: 1, name: 'Varad Gorwadkar', email: 'vrgorwadkar@canarabank.co.in', role: 'Branch Admin', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Sayali Kharote', email: 'svkharote@canarabank.co.in', role: 'Branch Admin', status: 'Active', lastLogin: '1 day ago' },
     ]);

  // Mock data for suspicious activities
  const [suspiciousActivities] = useState([
    { 
      id: 1, 
      admin: 'Pratiksha Khandbahale', 
      email: 'pvkhandbahale@kkwagh.edu.in', 
      activity: 'Multiple failed login attempts', 
      location: 'Mumbai, Maharashtra', 
      device: 'Windows Chrome', 
      time: '15 minutes ago',
      riskLevel: 'High',
      status: 'Blocked'
    },
    { 
      id: 2, 
      admin: 'Siya Chavan', 
      email: 'smchavan@kkwagh.edu.in', 
      activity: 'Login from unusual location', 
      location: 'Delhi, NCR', 
      device: 'Mobile Safari', 
      time: '1 hour ago',
      riskLevel: 'Medium',
      status: 'Monitoring'
    },
  ]);

//   const generateToken = () => {
//     if (!email || !email.includes('@kkwagh.edu.in')) {
//       alert('Please enter a valid CanaraBank email address');
//       return;
//     }
    
//     const token = 'CB-' + Math.random().toString(36).substring(2, 15).toUpperCase() + '-' + Date.now().toString().slice(-6);
//     setGeneratedToken(token);
//   };

const generateToken = async () => {
  if (!email || !email.includes('@kkwagh.edu.in')) {
    alert('Please enter a valid KKWagh email address');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8000/api/generate-invite-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      setGeneratedToken(data.token);
      alert(`Invite token sent to ${email}!`);
    } else {
      alert('Failed to send invite token');
    }
  } catch (error) {
    alert('Error sending invite token');
  }
};

  const toggleAdminStatus = (adminId, currentStatus) => {
    // Mock function to toggle admin status
    console.log(`Toggling admin ${adminId} from ${currentStatus}`);
  };

  const handleSuspiciousActivity = (activityId, action) => {
    // Mock function to handle suspicious activities
    console.log(`${action} activity ${activityId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold">CanaraBank</h1>
                <p className="text-orange-100 text-sm">Administrator Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
              <Users className="h-5 w-5" />
              <span className="font-medium">Admin Panel</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Invite Token Generation */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Generate Admin Invite Token</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@canarabank.co.in"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateToken}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-medium shadow-lg"
                >
                  Generate Token
                </button>
              </div>
            </div>
            
            {generatedToken && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-green-800 mb-2">Generated Token:</label>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                        {showToken ? generatedToken : '•'.repeat(generatedToken.length)}
                      </code>
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Admin List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Active Administrators</h2>
              </div>
            </div>
            <div className="h-96 overflow-y-auto">
              {admins.map((admin) => (
                <div key={admin.id} className="p-4 border-b border-gray-100 hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${admin.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{admin.role}</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {admin.lastLogin}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAdminStatus(admin.id, admin.status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        admin.status === 'Active' 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {admin.status === 'Active' ? 'Block' : 'Unblock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suspicious Activity Detection */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Security Anomaly Detector</h2>
              </div>
            </div>
            <div className="h-96 overflow-y-auto">
              {suspiciousActivities.map((activity) => (
                <div key={activity.id} className="p-4 border-b border-gray-100 hover:bg-red-50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.riskLevel === 'High' ? 'bg-red-500' : 
                          activity.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="font-semibold text-gray-900">{activity.admin}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                          activity.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {activity.riskLevel} Risk
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{activity.activity}</p>
                      <p className="text-xs mt-1">{activity.email}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {activity.location}
                      </span>
                      <span className="flex items-center">
                        <Smartphone className="h-3 w-3 mr-1" />
                        {activity.device}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activity.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                        activity.status === 'Monitoring' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.status}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSuspiciousActivity(activity.id, 'block')}
                          className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors"
                        >
                          Block
                        </button>
                        <button
                          onClick={() => handleSuspiciousActivity(activity.id, 'unblock')}
                          className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium transition-colors"
                        >
                          Unblock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanaraBank;