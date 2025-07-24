import { ConsentRequest, AuditLog, DashboardStats } from '../types';

export const mockConsents: ConsentRequest[] = [
  {
    id: 'CNS-2024-001',
    customerId: 'CUST-789123',
    purpose: 'Lending',
    dataFields: ['balance', 'account_number', 'transactions'],
    expiryDate: '2024-06-15',
    status: 'ACTIVE',
    createdAt: '2024-01-15',
    accessType: 'downloadable'
  },
  {
    id: 'CNS-2024-002',
    customerId: 'CUST-456789',
    purpose: 'Insurance',
    dataFields: ['balance', 'credit_score'],
    expiryDate: '2024-05-20',
    status: 'PENDING',
    createdAt: '2024-01-20',
    accessType: 'view-only'
  },
  {
    id: 'CNS-2024-003',
    customerId: 'CUST-123456',
    purpose: 'Analytics',
    dataFields: ['transactions', 'spending_patterns'],
    expiryDate: '2024-03-10',
    status: 'EXPIRED',
    createdAt: '2024-01-10',
    accessType: 'downloadable'
  },
  {
    id: 'CNS-2024-004',
    customerId: 'CUST-987654',
    purpose: 'Lending',
    dataFields: ['balance', 'account_number'],
    expiryDate: '2024-04-25',
    status: 'REVOKED',
    createdAt: '2024-01-25',
    accessType: 'view-only'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2024-01-28T14:30:00Z',
    action: 'FETCH',
    consentId: 'CNS-2024-001',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: 'Retrieved account balance and transactions'
  },
  {
    id: 'AUD-002',
    timestamp: '2024-01-28T10:15:00Z',
    action: 'CREATE',
    consentId: 'CNS-2024-004',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: 'New consent request created'
  },
  {
    id: 'AUD-003',
    timestamp: '2024-01-27T16:45:00Z',
    action: 'REVOKE',
    consentId: 'CNS-2024-004',
    status: 'SUCCESS',
    ipAddress: '192.168.1.100',
    details: 'Consent revoked by user request'
  },
  {
    id: 'AUD-004',
    timestamp: '2024-01-27T09:20:00Z',
    action: 'FETCH',
    consentId: 'CNS-2024-002',
    status: 'ERROR',
    ipAddress: '192.168.1.100',
    details: 'Consent not yet approved'
  }
];

export const mockStats: DashboardStats = {
  totalRequests: 24,
  activeConsents: 8,
  revokedConsents: 6,
  expiredConsents: 10
};

export const dataFieldOptions = [
  { value: 'balance', label: 'Account Balance' },
  { value: 'account_number', label: 'Account Number' },
  { value: 'transactions', label: 'Transaction History' },
  { value: 'credit_score', label: 'Credit Score' },
  { value: 'spending_patterns', label: 'Spending Patterns' },
  { value: 'income_data', label: 'Income Data' },
  { value: 'loan_history', label: 'Loan History' },
  { value: 'investment_portfolio', label: 'Investment Portfolio' }
];

export const mockConsentData = {
  'CNS-2024-001': {
    balance: '₹1,25,000',
    account_number: '****-****-3456',
    transactions: [
      { date: '2024-01-27', description: 'Salary Credit', amount: '₹75,000', type: 'credit' },
      { date: '2024-01-26', description: 'Grocery Store', amount: '₹2,500', type: 'debit' },
      { date: '2024-01-25', description: 'Online Transfer', amount: '₹10,000', type: 'debit' }
    ]
  }
};