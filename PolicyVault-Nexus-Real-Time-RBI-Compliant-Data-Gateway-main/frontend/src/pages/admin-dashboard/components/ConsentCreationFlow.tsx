import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Calendar, Building, Shield } from 'lucide-react';
import { CreateConsentData } from '../types';
import { availableFIUs, purposeOptions } from '../data/mockData';

interface ConsentCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConsentData) => void;
}

const ConsentCreationFlow: React.FC<ConsentCreationFlowProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateConsentData>({
    dataFields: [],
    fiuName: '',
    purpose: '',
    expiryDate: ''
  });

  const dataFieldOptions = [
    { id: 'balance', label: 'Account Balance', description: 'Current balance information' },
    { id: 'transactions', label: 'Transaction History', description: 'Past transaction records' },
    { id: 'metadata', label: 'Account Metadata', description: 'Account details and information' }
  ];

  const handleDataFieldChange = (fieldId: string) => {
    const currentFields = formData.dataFields;
    if (currentFields.includes(fieldId)) {
      setFormData({
        ...formData,
        dataFields: currentFields.filter(f => f !== fieldId)
      });
    } else {
      setFormData({
        ...formData,
        dataFields: [...currentFields, fieldId]
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      dataFields: [],
      fiuName: '',
      purpose: '',
      expiryDate: ''
    });
    setCurrentStep(1);
  };

  const canProceedStep1 = formData.dataFields.length > 0;
  const canProceedStep2 = formData.fiuName && formData.purpose && formData.expiryDate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Consent</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Select Data</span>
            <span>Parameters</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Step 1: Select Data Fields */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Data to Share</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which financial data you want to share with the FIU.
                </p>
              </div>

              <div className="space-y-3">
                {dataFieldOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.dataFields.includes(option.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.dataFields.includes(option.id)}
                      onChange={() => handleDataFieldChange(option.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Set Parameters */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Consent Parameters</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure who can access your data and for what purpose.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building size={16} className="inline mr-2" />
                  Financial Information User (FIU)
                </label>
                <select
                  value={formData.fiuName}
                  onChange={(e) => setFormData({ ...formData, fiuName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select FIU...</option>
                  {availableFIUs.map((fiu) => (
                    <option key={fiu} value={fiu}>{fiu}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Data Access
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select purpose...</option>
                  {purposeOptions.map((purpose) => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Consent Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Approve */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Review & Approve</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please review your consent details carefully before approving.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data Fields</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.dataFields.map((field) => (
                      <span
                        key={field}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md capitalize"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">FIU</label>
                  <p className="text-sm text-gray-900 mt-1">{formData.fiuName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Purpose</label>
                  <p className="text-sm text-gray-900 mt-1">{formData.purpose}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Expires On</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(formData.expiryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <Shield size={16} className="inline mr-2" />
                  You can revoke this consent anytime from your dashboard.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onClose : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={16} />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Check size={16} />
              Review & Approve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentCreationFlow;