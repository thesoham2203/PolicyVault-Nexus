import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building2, ArrowRight, CheckCircle, Lock, Eye } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-indigo-600" />
                <div className="absolute inset-0 h-8 w-8 bg-indigo-600/20 rounded-full blur-sm"></div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                PolicyVault
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Financial Data Platform
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Take Control of Your
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Financial Data
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              PolicyVault enables secure, consent-based financial data sharing between users and financial institutions with complete transparency and control.
            </p>
          </div>

          {/* Dashboard Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
            {/* User Dashboard Card */}
            <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 via-blue-500/10 to-blue-600/10 -z-10 blur-xl group-hover:blur-2xl transition-all duration-300"></div>

              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users size={32} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">User Dashboard</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage your financial data consent, review requests, track access, and maintain complete control over who can access your information.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Approve or reject consent requests</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Eye size={16} className="text-blue-500 flex-shrink-0" />
                  <span>View detailed audit logs</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Lock size={16} className="text-purple-500 flex-shrink-0" />
                  <span>View detailed logs</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/login-user')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform group-hover:scale-105 flex items-center justify-center gap-2"
              >
                Access User Dashboard
                <ArrowRight size={20} />
              </button>
            </div>

            {/* FIU Dashboard Card */}
            <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/10 via-indigo-500/10 to-indigo-600/10 -z-10 blur-xl group-hover:blur-2xl transition-all duration-300"></div>

              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 size={32} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">FIU Dashboard</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Financial Information User interface for institutions to request consent, access approved data, and manage customer relationships.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Request user consent</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Eye size={16} className="text-blue-500 flex-shrink-0" />
                  <span>Access approved financial data</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Lock size={16} className="text-purple-500 flex-shrink-0" />
                  <span>Manage consent lifecycle</span>
                </div>
              </div>

              <button
                // onClick={() => navigate('/fiu-dashboard')}
                onClick={() => navigate('/register-user')}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform group-hover:scale-105 flex items-center justify-center gap-2"
              >
                Access FIU Dashboard
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            Why Choose PolicyVault?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Consent-Based Access',
                description: 'Users maintain complete control over who accesses their financial data and for what purpose.',
                color: 'from-green-500 to-emerald-600'
              },
              {
                icon: Eye,
                title: 'Complete Transparency',
                description: 'Detailed audit logs show exactly when, how, and why financial data is accessed.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Lock,
                title: 'Instant Revocation',
                description: 'Users can revoke data access permissions instantly with a single click.',
                color: 'from-purple-500 to-purple-600'
              },
            ].map((feature, index) => (
              <div key={index} className="group bg-white/60 backdrop-blur-sm p-8 border border-white/50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-indigo-400" />
            <span className="text-xl font-bold">PolicyVault</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering users with control over their financial data through consent-based access management.
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 PolicyVault. All rights reserved. | Powered by Open Data Standards
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
