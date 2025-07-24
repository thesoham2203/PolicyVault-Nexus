import { Consent, AuditLogEntry, ConsentRequest } from '../types';

export const mockConsents: Consent[] = [
  {
    id: 'CNS-001',
    fiuName: 'LendingKart',
    dataFields: ['Balance', 'Transactions'],
    purpose: 'Loan Underwriting',
    expiryDate: '2024-06-15',
    createdDate: '2024-01-15',
    status: 'active'
  },
  {
    id: 'CNS-002',
    fiuName: 'PayPal Credit',
    dataFields: ['Balance', 'Account Metadata'],
    purpose: 'Credit Assessment',
    expiryDate: '2024-03-10',
    createdDate: '2024-01-10',
    status: 'expired'
  },
  {
    id: 'CNS-003',
    fiuName: 'Razorpay Capital',
    dataFields: ['Transactions'],
    purpose: 'Business Analytics',
    expiryDate: '2024-08-20',
    createdDate: '2024-02-20',
    status: 'revoked'
  },
  {
    id: 'CNS-004',
    fiuName: 'CRED Finance',
    dataFields: ['Balance', 'Transactions', 'Account Metadata'],
    purpose: 'Investment Advisory',
    expiryDate: '2024-09-30',
    createdDate: '2024-03-01',
    status: 'active'
  }
];

export const mockConsentRequests: ConsentRequest[] = [
  {
    id: 'REQ-001',
    fiuName: 'MoneyTap',
    dataFields: ['Balance', 'Transactions'],
    purpose: 'Personal Loan Assessment',
    expiryDate: '2024-12-31',
    requestedDate: '2024-03-16',
    status: 'pending'
  },
  {
    id: 'REQ-002',
    fiuName: 'Capital Float',
    dataFields: ['Balance', 'Account Metadata'],
    purpose: 'Business Credit Line',
    expiryDate: '2024-11-30',
    requestedDate: '2024-03-15',
    status: 'pending'
  },
  {
    id: 'REQ-003',
    fiuName: 'InCred Finance',
    dataFields: ['Transactions'],
    purpose: 'Expense Analytics',
    expiryDate: '2024-10-15',
    requestedDate: '2024-03-14',
    status: 'pending'
  },
  {
    id: 'REQ-004',
    fiuName: 'Payme India',
    dataFields: ['Balance', 'Transactions', 'Account Metadata'],
    purpose: 'Wealth Management',
    expiryDate: '2025-03-16',
    requestedDate: '2024-03-13',
    status: 'pending'
  }
];

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2024-03-15T10:30:00Z',
    fiuName: 'LendingKart',
    consentId: 'CNS-001',
    action: 'accessed',
    details: 'Account balance data accessed'
  },
  {
    id: 'AUD-002',
    timestamp: '2024-03-14T14:22:00Z',
    fiuName: 'CRED Finance',
    consentId: 'CNS-004',
    action: 'approved',
    details: 'Consent request approved for investment advisory'
  },
  {
    id: 'AUD-003',
    timestamp: '2024-03-13T09:15:00Z',
    fiuName: 'Razorpay Capital',
    consentId: 'CNS-003',
    action: 'revoked',
    details: 'User revoked consent manually'
  },
  {
    id: 'AUD-004',
    timestamp: '2024-03-10T16:45:00Z',
    fiuName: 'PayPal Credit',
    consentId: 'CNS-002',
    action: 'expired',
    details: 'Consent expired automatically'
  }
];

export const availableFIUs = [
  'LendingKart',
  'PayPal Credit', 
  'Razorpay Capital',
  'CRED Finance',
  'Payme India',
  'MoneyTap',
  'Capital Float',
  'InCred Finance'
];

export const purposeOptions = [
  'Loan Underwriting',
  'Credit Assessment',
  'Investment Advisory',
  'Business Analytics',
  'Financial Planning',
  'Risk Assessment',
  'Insurance Underwriting',
  'Wealth Management'
];