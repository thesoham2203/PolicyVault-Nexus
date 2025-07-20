import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusChipProps {
  status: 'active' | 'expired' | 'revoked';
  size?: 'sm' | 'md';
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Active',
          className: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 border-green-200/50 dark:border-green-700/50'
        };
      case 'expired':
        return {
          icon: Clock,
          label: 'Expired',
          className: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200/50 dark:border-gray-600/50'
        };
      case 'revoked':
        return {
          icon: XCircle,
          label: 'Revoked',
          className: 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-800 dark:text-red-200 border-red-200/50 dark:border-red-700/50'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium shadow-sm ${config.className} ${sizeClasses} dark:bg-gray-300` }>
      <Icon size={size === 'sm' ? 12 : 14} />
      {config.label}
    </span>
  );
};

export default StatusChip;