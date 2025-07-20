
import React from 'react';
import {
  Shield,
  User,
  ChevronDown,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  ScrollText,
  KeySquare,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  collapsed,
  setCollapsed,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    

    <aside
      className={`
        fixed top-0 left-0 h-full w-64 z-50
        transform transition-transform duration-500 ease-in-out
        bg-[#bbd3fc] 
        dark:bg-gradient-to-br from-slate-900 dark:via-gray-900 dark:to-black
        backdrop-blur-md text-gray-700 dark:text-white flex flex-col justify-between
        shadow-6xl border-r border-gray-300 dark:border-slate-700/50
        ${collapsed ? '-translate-x-full' : 'translate-x-0'}
      `}
    >
      {/* Toggle Button (inside sidebar for desktop) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 right-4 text-gray-500 hover:text-white"
      >
        <ChevronRight/>
      </button>

      <div className="space-y-6 p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-500" />
          <h1 className="text-gray-600 dark:text-gray-300 font-bold ">
            POLICYVAULT
          </h1>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { key: 'pending-requests', label: 'Pending Requests', icon: <Clock/> },
            { key: 'my-consents', label: 'Consents', icon: <ShieldCheck/> },
            { key: 'audit', label: 'Audit Log', icon: <ScrollText/> },
            { key: 'data-access', label: 'Data Access', icon: <KeySquare/> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={`flex px-3 py-2 text-left rounded transition-all ${currentView === item.key
                  ? 'bg-indigo-500 text-white dark:text-gray-300'
                  : 'hover:bg-white/10 hover:text-gray-700 text-gray-600 dark:text-gray-300'
                }`}
            >
              <div className='mr-2'>{item.icon}</div>{item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-white/10 rounded"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="flex items-center gap-2  text-sm text-white hover:bg-white/10 p-2 rounded">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow">
            <User size={16} className="text-white" />
          </div>
          <span className='text-gray-700 dark:text-gray-200'>John Doe</span>
          <div className='text-black dark:text-white'>
          <ChevronDown size={16} />
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;