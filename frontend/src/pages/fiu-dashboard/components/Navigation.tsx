import React from 'react';
import {
  Home,
  FileText,
  Database,
  Activity,
  Plus,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import useSignOut from './useSignOut';


interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  collapsed = false,
  setCollapsed,
}) => {
  const signOut = useSignOut();
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'request', label: 'Request Consent', icon: Plus },
    { id: 'consents', label: 'Consents', icon: FileText },
    { id: 'fetch', label: 'Fetch Data', icon: Database },
    { id: 'audit', label: 'Audit Logs', icon: Activity },
  ];

  return (
    <nav className="relative bg-white border-r border-slate-200 h-full flex flex-col justify-between py-4">
      {/* Top Section */}
      <div>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 mb-6`}>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <h1 className="text-base font-semibold text-slate-900">PolicyGateway</h1>
                <p className="text-xs text-slate-500">FIU Dashboard</p>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`absolute top-4 -right-3 z-10 w-4 h-10 bg-white border-r border-slate-300  flex items-center justify-center 
              rounded-r-full transition-all duration-300 hover:bg-slate-100`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <ul className="space-y-1 px-2">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onTabChange(id)}
                  className={`group w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'
                    } px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                      ? 'bg-blue-100 text-blue-700 shadow-inner'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  title={collapsed ? label : undefined}
                >
                  <Icon
                    className={`${collapsed ? 'w-8 h-8' : 'w-5 h-5'
                      } transition-all duration-300 ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                  />
                  <span
                    className={`ml-3 transition-all duration-300 ease-in-out ${collapsed ? 'opacity-0 translate-x-[-9px] hidden' : 'opacity-100 translate-x-0'
                      }`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      

      {/* Footer / Status */}
      <div className="px-3 mt-4">
        <button
                  onClick={signOut}
                  className={`group w-full flex items-center ${collapsed ? 'justify-center' : 'justify-center'} px-3 py-2 rounded-lg text-sm font-medium transition text-slate-600 hover:bg-slate-100 hover:text-slate-900 mt-2`}
                >
              <LogOut className={`${collapsed ? 'w-8 h-8' : 'w-5 h-5'} transition-all duration-300 text-slate-400 group-hover:text-slate-700`} />
              {!collapsed && <span className="ml-3">Sign Out</span>}
            </button>
        <div
          className={`bg-slate-50 rounded-xl p-2 flex items-center justify-center transition-all ${collapsed ? 'justify-center' : 'justify-start px-3'
            }`}
        >
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
              {!collapsed && (
                <div className="text-xs text-slate-600 font-medium">All systems operational</div>
              )}
            </div>
          </div>
      </div>
    </nav>
  );
};

export default Navigation;
