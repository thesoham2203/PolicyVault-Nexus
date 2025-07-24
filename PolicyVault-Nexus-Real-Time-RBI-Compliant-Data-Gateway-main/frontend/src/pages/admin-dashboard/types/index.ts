export interface Consent {
  id: string;
  fiuName: string;
  dataFields: string[];
  purpose: string;
  expiryDate: string;
  createdDate: string;
  status: 'active' | 'expired' | 'revoked';
}
// export interface Consentss {
//   id: string;
//   fiu_id: string;
//   datafields: string[];
//   purpose: string;
//   expiry_of_approval: string;
//   actual_expiry: string; 
//   createdDate: string;
//   user_identifier: string;
//   status: 'APPROVED' | 'EXPIRED' | 'REVOKED';
//   c_id: string;
//   status_admin: 'APPROVED' | 'EXPIRED' | 'REVOKED';
//   admin_id: string;
// }

// types/index.ts
export interface Consentss {
  id: string;
  c_id: string;
  fiu_id: string;
  purpose: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  status_admin: 'APPROVED' | 'REVOKED' | 'EXPIRED' | 'PENDING';
  created_at: string;
  datafields: string[];
  user_identifier: string;
  admin_id: string;
  expiry_of_approval: string;
  actual_expiry?: string;
}

export interface AccountData {
  account_number: string;
  balance?: number;
  credit_score?: number;
  account_details?: string;
  loan_details?: string;
  repayment_history?: string;
  transaction_history?: string;
  salary_inflow?: number;
  insurance_info?: string;
  nominee_details?: string;
  aadhaar_number?: string;
  pan_number?: string;
  dob?: string;
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