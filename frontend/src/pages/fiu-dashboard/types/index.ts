export interface ConsentRequest {
  id: string;
  customerId: string;
  purpose: 'Lending' | 'Insurance' | 'Analytics';
  dataFields: string[];
  expiryDate: string;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  accessType: 'downloadable' | 'view-only';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'FETCH' | 'REVOKE' | 'CREATE' | 'VIEW';
  consentId: string;
  status: 'SUCCESS' | 'ERROR';
  ipAddress: string;
  details?: string;
}

export interface DashboardStats {
  totalRequests: number;
  activeConsents: number;
  revokedConsents: number;
  expiredConsents: number;
}