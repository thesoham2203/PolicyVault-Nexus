export interface Consent {
  id: string;
  fiuName: string;
  dataFields: string[];
  purpose: string;
  expiryDate: string;
  createdDate: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface ConsentRequest {
  id: string;
  fiuName: string;
  dataFields: string[];
  purpose: string;
  expiryDate: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  fiuName: string;
  consentId: string;
  action: 'created' | 'accessed' | 'revoked' | 'expired' | 'approved' | 'rejected';
  details?: string;
}

export interface CreateConsentData {
  dataFields: string[];
  fiuName: string;
  purpose: string;
  expiryDate: string;
}