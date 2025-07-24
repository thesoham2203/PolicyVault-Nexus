import React, { useState } from 'react';
import { Search, Download, AlertTriangle, CheckCircle, Calendar, Eye } from 'lucide-react';
import { ConsentRequest } from '../types';
import { mockConsentData } from '../utils/mockData';

interface FetchDataProps {
  consents: ConsentRequest[];
}

const FetchData: React.FC<FetchDataProps> = ({ consents }) => {
  const [selectedConsentId, setSelectedConsentId] = useState('');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const activeConsents = consents.filter(c => c.status === 'ACTIVE');
  const selectedConsent = consents.find(c => c.id === selectedConsentId);

  const handleFetchData = async () => {
    if (!selectedConsentId) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = mockConsentData[selectedConsentId as keyof typeof mockConsentData];
    setFetchedData(data);
    setLoading(false);
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const canExport = selectedConsent?.accessType === 'downloadable';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Fetch Data Console</h2>
        <p className="text-slate-600 mt-1">Retrieve consented data from active consent requests</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Consent ID
            </label>
            <select
              value={selectedConsentId}
              onChange={(e) => {
                setSelectedConsentId(e.target.value);
                setFetchedData(null);
              }}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a consent request...</option>
              {activeConsents.map((consent) => (
                <option key={consent.id} value={consent.id}>
                  {consent.id} - {consent.customerId} ({consent.purpose})
                </option>
              ))}
            </select>
          </div>

          {selectedConsent && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Consent Details</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {selectedConsent.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Customer ID:</span>
                  <div className="font-medium">{selectedConsent.customerId}</div>
                </div>
                <div>
                  <span className="text-slate-600">Purpose:</span>
                  <div className="font-medium">{selectedConsent.purpose}</div>
                </div>
                <div>
                  <span className="text-slate-600">Access Type:</span>
                  <div className="font-medium capitalize">{selectedConsent.accessType}</div>
                </div>
                <div>
                  <span className="text-slate-600">Expiry Date:</span>
                  <div className="font-medium">{selectedConsent.expiryDate}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-600 text-sm">Allowed Data Fields:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedConsent.dataFields.map((field) => (
                    <span key={field} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {field.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {isExpiringSoon(selectedConsent.expiryDate) && (
                <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">This consent expires soon!</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleFetchData}
            disabled={!selectedConsentId || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching Data...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Fetch Consented Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {fetchedData && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Retrieved Data</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Data fetch successful</span>
              </div>
              {canExport && (
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1">
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              )}
              {!canExport && (
                <div className="flex items-center space-x-1 text-slate-600">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View Only</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {fetchedData.balance && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Account Balance</h4>
                <p className="text-2xl font-bold text-green-600">{fetchedData.balance}</p>
              </div>
            )}

            {fetchedData.account_number && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">Account Number</h4>
                <p className="font-mono text-slate-600">{fetchedData.account_number}</p>
              </div>
            )}

            {fetchedData.transactions && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  {fetchedData.transactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <p className="font-medium text-slate-800">{transaction.description}</p>
                        <p className="text-sm text-slate-500">{transaction.date}</p>
                      </div>
                      <span className={`font-bold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This data fetch is based on user-approved consent. 
              All data access is logged and auditable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchData;