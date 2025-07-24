import React, { useState, useEffect } from 'react';
import { Download, Shield, Eye, Database, CheckCircle, ArrowRight, Sparkles, Lock } from 'lucide-react';

export default function VaultViewLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [downloadCount, setDownloadCount] = useState(2847);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setDownloadCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const features = [
    { icon: Eye, title: "Instant Visualization", desc: "View .vault files with lightning-fast rendering" },
    { icon: Shield, title: "Secure Access", desc: "Bank-grade security for your sensitive data" },
    { icon: Database, title: "Smart Analytics", desc: "Advanced insights from PolicyVault Nexus data" },
    { icon: Lock, title: "Encrypted Storage", desc: "Your data remains protected at all times" }
  ];

  const handleDownload = () => {
  const link = document.createElement('a');
  link.href = 'F:/Suraksha_Electron_App/new/dist/PolicyVault 1.0.0.exe';
  link.download = 'VaultView.exe';
  link.click();
};

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black text-white overflow-hidden relative"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating cursor effect */}
      <div 
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transition: 'all 0.1s ease-out'
        }}
      >
        <div className="w-full h-full bg-white rounded-full opacity-75 animate-ping"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              VaultView
            </span>
          </div>
          <div className="text-sm text-gray-300">
            Powered by <span className="text-blue-400 font-semibold">PolicyVault Nexus</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Hero Section */}
          <div className="mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Revolutionary Data Sharing</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
                Unlock Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                .vault Data
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of secure data visualization with VaultView. 
              Seamlessly access and analyze your PolicyVault Nexus files with unprecedented clarity and speed.
            </p>

            {/* Download Button */}
            <div className="mb-16">
              <button  onClick={handleDownload} className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <Download className="w-6 h-6 group-hover:animate-bounce" />
                <span>Download VaultView.exe</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity -z-10"></div>
              </button>
              
              <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free Download</span>
                </div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Windows Compatible</span>
                </div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span>{downloadCount.toLocaleString()} downloads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-cyan-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Trusted By Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Trusted & Sponsored By
            </h2>
            <div className="flex items-center justify-center space-x-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-black text-white">CB</span>
                </div>
                <p className="text-xl font-semibold text-orange-400">Canara Bank</p>
                <p className="text-sm text-gray-400">Official Sponsor</p>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Database className="w-10 h-10 text-white" />
                </div>
                <p className="text-xl font-semibold text-blue-400">PolicyVault Nexus</p>
                <p className="text-sm text-gray-400">Core Technology</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 VaultView. Empowered by PolicyVault Nexus. Sponsored by Canara Bank.
          </p>
        </div>
      </footer>
    </div>
  );
}