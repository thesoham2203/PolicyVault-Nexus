// import React, { useState } from 'react';
// import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
// import { dataFieldOptions } from '../utils/mockData';

// interface RequestConsentProps {
//   onBack: () => void;
//   onSubmit: (data: any) => void;
// }

// const RequestConsent: React.FC<RequestConsentProps> = ({ onBack, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     customerId: '',
//     purpose: '',
//     customPurpose: '',
//     dataFields: [] as string[],
//     expiryDate: '',
//     accessType: 'downloadable'
//   });
//   const [currentStep, setCurrentStep] = useState(1);
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const [selectedPurpose, setSelectedPurpose] = useState("");
//   const [customPurpose, setCustomPurpose] = useState("");

//   const [inputValue, setInputValue] = useState("");
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [filteredOptions, setFilteredOptions] = useState([]);

//   const [customerIdError, setCustomerIdError] = useState("");

//   // Validation function
//   const validateCustomerId = (value) => {
//     const regex = /^CNRB(100|101)\d*$/;
//     if (!regex.test(value)) {
//       setCustomerIdError("ID must start with CNRB100 or CNRB101 followed by digits");
//     } else {
//       setCustomerIdError("");
//     }
//   };

//   const purposes = [
//     { value: "loan_eligibility_check", label: "Loan Eligibility Check" },
//     { value: "credit_risk_assessment", label: "Credit Risk Assessment" },
//     { value: "income_verification", label: "Income Verification" },
//     { value: "repayment_history_analysis", label: "Repayment History Analysis" },
//     { value: "fraud_detection", label: "Fraud Detection" },
//     { value: "preapproved_offers", label: "Pre-approved Offers" },
//     { value: "insurance_underwriting", label: "Insurance Underwriting" },
//     { value: "risk_profiling", label: "Risk Profiling" },
//     { value: "claims_verification", label: "Claims Verification" },
//     { value: "premium_calculation", label: "Premium Calculation" },
//     { value: "investment_advisory", label: "Investment Advisory" },
//     { value: "wealth_profiling", label: "Wealth Profiling" },
//     { value: "portfolio_management", label: "Portfolio Management" },
//     { value: "tax_planning", label: "Tax Planning" },
//     { value: "aml_monitoring", label: "AML Monitoring" },
//     { value: "regulatory_compliance", label: "Regulatory Compliance" },
//     { value: "audit_trail_generation", label: "Audit Trail Generation" },
//     { value: "kyc_verification", label: "KYC Verification" },
//     { value: "gst_reconciliation", label: "GST Reconciliation" },
//     { value: "suspicious_activity_check", label: "Suspicious Activity Check" },
//     { value: "expense_categorization", label: "Expense Categorization" },
//     { value: "financial_goal_setting", label: "Financial Goal Setting" },
//     { value: "net_worth_analysis", label: "Net Worth Analysis" },
//     { value: "alternate_credit_scoring", label: "Alternate Credit Scoring" },
//     { value: "gig_worker_scoring", label: "Gig Worker Scoring" },
//     { value: "health_risk_analysis", label: "Health Risk Analysis" },
//     { value: "insurance_linking", label: "Insurance Linking" },
//     { value: "bnpl_eligibility", label: "BNPL Eligibility" },
//     { value: "instant_credit_check", label: "Instant Credit Check" },
//     { value: "emi_conversion_check", label: "EMI Conversion Check" },
//     { value: "business_loan_profiling", label: "Business Loan Profiling" },
//     { value: "invoice_discounting", label: "Invoice Discounting" },
//     { value: "working_capital_check", label: "Working Capital Check" },
//     { value: "seasonality_forecasting", label: "Seasonality Forecasting" },
//     { value: "transaction_analytics", label: "Transaction Analytics" },
//     { value: "market_intelligence", label: "Market Intelligence" },
//     { value: "customer_segmentation", label: "Customer Segmentation" },
//     { value: "spending_pattern_study", label: "Spending Pattern Study" },
//     { value: "product_recommendation", label: "Product Recommendation" },
//     { value: "churn_prediction", label: "Churn Prediction" },
//     { value: "other", label: "Other" }
//   ];

//   const predefinedOptions = [
//   "account balance",
//   "credit score",
//   "account details",
//   "loan details",
//   "repayment history",
//   "kyc data",
//   "transaction history",
//   "salary inflow",
//   "insurance info",
//   "nominee details",
// ];

//   const handleFieldChange = (field: string, checked: boolean) => {
//     setFormData(prev => ({
//       ...prev,
//       dataFields: checked 
//         ? [...prev.dataFields, field]
//         : prev.dataFields.filter(f => f !== field)
//     }));
//   };

//   const handleSubmit = () => {
//     const newConsent = {
//       id: `CNS-2024-${String(Date.now()).slice(-3)}`,
//       customerId: formData.customerId,
//       purpose: formData.purpose,
//       dataFields: formData.dataFields,
//       expiryDate: formData.expiryDate,
//       status: 'PENDING',
//       createdAt: new Date().toISOString().split('T')[0],
//       accessType: formData.accessType
//     };
    
//     onSubmit(newConsent);
//     setIsSubmitted(true);
//   };

//   const canProceed = () => {
//     switch (currentStep) {
//       case 1:
//         return formData.customerId.trim() !== '' && formData.purpose !== '';
//       case 2:
//         return formData.dataFields.length > 0;
//       default:
//         return true;
//     }
//   };

//   if (isSubmitted) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 sm:px-6">
//         <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 text-center">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircle className="w-8 h-8 text-green-600" />
//           </div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Consent Request Submitted!</h2>
//           <p className="text-slate-600 mb-6 text-sm sm:text-base">
//             Your consent request has been sent to the user for approval. You'll receive a notification once they respond.
//           </p>
//           <button
//             onClick={onBack}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//    const handleInputChange = (e) => {
//     const value = e.target.value;
//     setInputValue(value);

//     // Filter options dynamically
//     if (value.trim() === "") {
//       setFilteredOptions([]);
//       return;
//     }

//     const filtered = predefinedOptions.filter(
//       (option) =>
//         option.toLowerCase().includes(value.toLowerCase()) &&
//         !selectedTags.includes(option)
//     );
//     setFilteredOptions(filtered);
//   };

//   const addTag = (tag) => {
//   if (tag && !selectedTags.includes(tag)) {
//     const updatedTags = [...selectedTags, tag];
//     setSelectedTags(updatedTags);
//     setFormData((prev) => ({ ...prev, dataFields: updatedTags }));
//   }
//   setInputValue("");
//   setFilteredOptions([]);
// };


//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && inputValue.trim() !== "") {
//       e.preventDefault();
//       addTag(inputValue.trim());
//     }
//   };

//   const removeTag = (tag) => {
//   const updatedTags = selectedTags.filter((t) => t !== tag);
//   setSelectedTags(updatedTags);
//   setFormData((prev) => ({ ...prev, dataFields: updatedTags }));
// };


//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
//         <button
//           onClick={onBack}
//           className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors self-start"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           <span className="text-sm sm:text-base">Back to Dashboard</span>
//         </button>
//         <div className="hidden sm:block h-6 w-px bg-slate-300"></div>
//         <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Request New Consent</h2>
//       </div>

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//         <div className="flex items-start space-x-2">
//           <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//           <p className="text-sm text-blue-800">
//             This form simulates how an FIU would request consent in production.
//           </p>
//         </div>
//       </div>

//       {/* Main Form Container */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         {/* Progress Steps */}
//         <div className="grid grid-cols-3 border-b border-slate-200">
//           {[1, 2, 3].map((step) => (
//             <div
//               key={step}
//               className={`p-3 sm:p-4 text-center ${
//                 step === currentStep ? 'bg-blue-50 text-blue-600' : 
//                 step < currentStep ? 'bg-green-50 text-green-600' : 'text-slate-400'
//               }`}
//             >
//               <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs sm:text-sm ${
//                 step === currentStep ? 'bg-blue-600 text-white' :
//                 step < currentStep ? 'bg-green-600 text-white' : 'bg-slate-200'
//               }`}>
//                 {step < currentStep ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step}
//               </div>
//               <p className="text-xs sm:text-sm font-medium">
//                 {step === 1 ? 'Basic Info' : step === 2 ? 'Data Fields' : 'Review'}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Form Content */}
//         <div className="p-4 sm:p-6">
//           {/* Step 1: Basic Info */}
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   User Identifier
//                 </label>
//                 {/* <input
//                   type="text"
//                   value={formData.customerId}
//                   onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
//                   className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//                   placeholder="Enter customer identifier"
//                 /> */}
//                 <input
//                 type="text"
//                 value={formData.customerId}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setFormData((prev) => ({ ...prev, customerId: value }));
//                   validateCustomerId(value);
//                 }}
//                 className={`w-full p-3 border ${
//                   customerIdError ? "border-red-500" : "border-slate-300"
//                 } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
//                 placeholder="Enter customer identifier"
//               />

//               {customerIdError && (
//                 <p className="text-sm text-red-600 mt-1">{customerIdError}</p>
//               )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Purpose of Data Access
//                 </label>
//                 {/* <select
//                   value={formData.purpose}
//                   onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
//                   className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//                 >
//                   <option value="">Select purpose</option>
//                   <option value="loan_eligibility_check">Loan Eligibility Check</option>
//                   <option value="credit_risk_assessment">Credit Risk Assessment</option>
//                   <option value="income_verification">Income Verification</option>
//                   <option value="repayment_history_analysis">Repayment History Analysis</option>
//                   <option value="fraud_detection">Fraud Detection</option>
//                   <option value="preapproved_offers">Pre-approved Offers</option>
//                   <option value="insurance_underwriting">Insurance Underwriting</option>
//                   <option value="risk_profiling">Risk Profiling</option>
//                   <option value="claims_verification">Claims Verification</option>
//                   <option value="premium_calculation">Premium Calculation</option>
//                   <option value="investment_advisory">Investment Advisory</option>
//                   <option value="wealth_profiling">Wealth Profiling</option>
//                   <option value="portfolio_management">Portfolio Management</option>
//                   <option value="tax_planning">Tax Planning</option>
//                   <option value="aml_monitoring">AML Monitoring</option>
//                   <option value="regulatory_compliance">Regulatory Compliance</option>
//                   <option value="audit_trail_generation">Audit Trail Generation</option>
//                   <option value="kyc_verification">KYC Verification</option>
//                   <option value="gst_reconciliation">GST Reconciliation</option>
//                   <option value="suspicious_activity_check">Suspicious Activity Check</option>
//                   <option value="expense_categorization">Expense Categorization</option>
//                   <option value="financial_goal_setting">Financial Goal Setting</option>
//                   <option value="net_worth_analysis">Net Worth Analysis</option>
//                   <option value="alternate_credit_scoring">Alternate Credit Scoring</option>
//                   <option value="gig_worker_scoring">Gig Worker Scoring</option>
//                   <option value="health_risk_analysis">Health Risk Analysis</option>
//                   <option value="insurance_linking">Insurance Linking</option>
//                   <option value="bnpl_eligibility">BNPL Eligibility</option>
//                   <option value="instant_credit_check">Instant Credit Check</option>
//                   <option value="emi_conversion_check">EMI Conversion Check</option>
//                   <option value="business_loan_profiling">Business Loan Profiling</option>
//                   <option value="invoice_discounting">Invoice Discounting</option>
//                   <option value="working_capital_check">Working Capital Check</option>
//                   <option value="seasonality_forecasting">Seasonality Forecasting</option>
//                   <option value="transaction_analytics">Transaction Analytics</option>
//                   <option value="market_intelligence">Market Intelligence</option>
//                   <option value="customer_segmentation">Customer Segmentation</option>
//                   <option value="spending_pattern_study">Spending Pattern Study</option>
//                   <option value="product_recommendation">Product Recommendation</option>
//                   <option value="churn_prediction">Churn Prediction</option>
//                   <option value="other">Other</option>
//                 </select> */}
//                 <select
//                   id="purpose"
//                   name="purpose"
//                   //value={selectedPurpose}
//                   // onChange={(e) => setSelectedPurpose(e.target.value)}
//                   // className="p-2 border rounded-md"
//                   value={formData.purpose}
//                   onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
//                   className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
               
//                 >
//                   <option value="">-- Select Purpose --</option>
//                   {purposes.map((purpose) => (
//                     <option key={purpose.value} value={purpose.value}>
//                       {purpose.label}
//                     </option>
//                   ))}
//                 </select>
//                 {formData.purpose === "other" && (
//                 <input
//                   type="text"
//                   placeholder="Enter your custom purpose"
//                   // value={customPurpose}
//                   // onChange={(e) => setFormData(prev => ({ ...prev, customPurpose: e.target.value }))}//setCustomPurpose(e.target.value)}
//                   value={formData.customPurpose}
//                   onChange={(e) => setFormData(prev => ({ ...prev, customPurpose: e.target.value }))}

//                   className="mt-2 border rounded-md w-full"
//                 />
//               )}
//               </div>
//             </div>
//           )}

//           {/* Step 2: Data Fields */}
//           {currentStep === 2 && (
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Select Data Fields</h3>
//               {/* <div className="grid grid-cols-1 gap-3 sm:gap-4">
//                 {dataFieldOptions.map((option) => (
//                   <label key={option.value} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
//                     <input
//                       type="checkbox"
//                       checked={formData.dataFields.includes(option.value)}
//                       onChange={(e) => handleFieldChange(option.value, e.target.checked)}
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
//                     />
//                     <span className="text-sm text-slate-700">{option.label}</span>
//                   </label>
//                 ))}
//               </div> */}
//               <div className="w-full max-w-xl">
//               {/* Selected Tags */}
//               <div className="flex flex-wrap gap-2 mb-3">
//                 {selectedTags.map((tag) => (
//                   <div
//                     key={tag}
//                     className="flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
//                   >
//                     {tag}
//                     <button
//                       onClick={() => removeTag(tag)}
//                       className="ml-2 text-blue-600 hover:text-blue-800"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>

//       {/* Input and Suggestions */}
//       <div className="relative">
//         <input
//           type="text"
//           value={inputValue}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           placeholder="Type to add field..."
//           className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {/* Suggestions Dropdown */}
//         {filteredOptions.length > 0 && (
//           <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md max-h-40 overflow-auto">
//             {filteredOptions.map((option) => (
//               <li
//                 key={option}
//                 onClick={() => addTag(option)}
//                 className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
//               >
//                 {option}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//             </div>
//           )}

//           {/* Step 3: Settings */}
//           {/* {currentStep === 3 && (
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Consent Expiry Date
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.expiryDate}
//                   onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
//                   className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Access Type
//                 </label>
//                 <div className="space-y-3">
//                   <label className="flex items-start space-x-3 cursor-pointer">
//                     <input
//                       type="radio"
//                       name="accessType"
//                       value="downloadable"
//                       checked={formData.accessType === 'downloadable'}
//                       onChange={(e) => setFormData(prev => ({ ...prev, accessType: e.target.value }))}
//                       className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
//                     />
//                     <div>
//                       <span className="text-sm text-slate-700 font-medium">Downloadable</span>
//                       <p className="text-xs text-slate-500 mt-1">Can export data</p>
//                     </div>
//                   </label>
//                   <label className="flex items-start space-x-3 cursor-pointer">
//                     <input
//                       type="radio"
//                       name="accessType"
//                       value="view-only"
//                       checked={formData.accessType === 'view-only'}
//                       onChange={(e) => setFormData(prev => ({ ...prev, accessType: e.target.value }))}
//                       className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
//                     />
//                     <div>
//                       <span className="text-sm text-slate-700 font-medium">View Only</span>
//                       <p className="text-xs text-slate-500 mt-1">Display only</p>
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           )} */}

//           {/* Step 4: Review */}
//           {currentStep === 3 && (
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Review & Submit</h3>
//               <div className="bg-slate-50 p-4 rounded-lg space-y-3">
//                 <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">Customer ID:</span>
//                   <span className="text-sm font-medium break-all">{formData.customerId}</span>
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">Purpose:</span>
//                   <span className="text-sm font-medium">{formData.purpose}</span>
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">Data Fields:</span>
//                   <span className="text-sm font-medium">{formData.dataFields.length} selected</span>
//                 </div>
//                 {/* <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">Expiry Date:</span>
//                   <span className="text-sm font-medium">{formData.expiryDate}</span>
//                 </div> */}
//                 {/* <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">Access Type:</span>
//                   <span className="text-sm font-medium capitalize">{formData.accessType.replace('-', ' ')}</span>
//                 </div> */}
//               </div>
              
//               {/* Selected Data Fields Details */}
//               {formData.dataFields.length > 0 && (
//                 <div className="mt-4">
//                   <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Data Fields:</h4>
//                   <div className="bg-slate-50 p-3 rounded-lg">
//                     <div className="flex flex-wrap gap-2">
//                       {formData.dataFields.map((field, index) => (
//                         <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
//                           {dataFieldOptions.find(opt => opt.value === field)?.label || field}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Navigation Footer */}
//         <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3 sm:space-y-0">
//           <button
//             onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
//             disabled={currentStep === 1}
//             className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed order-2 sm:order-1"
//           >
//             Previous
//           </button>
//           {currentStep < 3 ? (
//             <button
//               onClick={() => setCurrentStep(currentStep + 1)}
//               disabled={!canProceed()}
//               className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto order-1 sm:order-2"
//             >
//               Submit Request
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RequestConsent;

import React, { useState } from 'react';
import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface RequestConsentProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

interface ConsentResponse {
  id: string;
  user_identifier: string;
  fiu_id: string;
  customer_id: string;
  purpose: string;
  datafields: string[];
  status: string;
  consent_signature: string;
  created_at: string;
}

const RequestConsent: React.FC<RequestConsentProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    purpose: '',
    customPurpose: '',
    dataFields: [] as string[],
    expiryDate: '',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [customerIdError, setCustomerIdError] = useState("");

  // Validation function
  const validateCustomerId = (value) => {
    const regex = /^CNRB(100|101)\d*$/;
    if (!regex.test(value)) {
      setCustomerIdError("ID must start with CNRB100 or CNRB101 followed by digits");
    } else {
      setCustomerIdError("");
    }
  };

  const purposes = [
    { value: "loan_eligibility_check", label: "Loan Eligibility Check" },
    { value: "credit_risk_assessment", label: "Credit Risk Assessment" },
    { value: "income_verification", label: "Income Verification" },
    { value: "repayment_history_analysis", label: "Repayment History Analysis" },
    { value: "fraud_detection", label: "Fraud Detection" },
    { value: "preapproved_offers", label: "Pre-approved Offers" },
    { value: "insurance_underwriting", label: "Insurance Underwriting" },
    { value: "risk_profiling", label: "Risk Profiling" },
    { value: "claims_verification", label: "Claims Verification" },
    { value: "premium_calculation", label: "Premium Calculation" },
    { value: "investment_advisory", label: "Investment Advisory" },
    { value: "wealth_profiling", label: "Wealth Profiling" },
    { value: "portfolio_management", label: "Portfolio Management" },
    { value: "tax_planning", label: "Tax Planning" },
    { value: "aml_monitoring", label: "AML Monitoring" },
    { value: "regulatory_compliance", label: "Regulatory Compliance" },
    { value: "audit_trail_generation", label: "Audit Trail Generation" },
    { value: "kyc_verification", label: "KYC Verification" },
    { value: "gst_reconciliation", label: "GST Reconciliation" },
    { value: "suspicious_activity_check", label: "Suspicious Activity Check" },
    { value: "expense_categorization", label: "Expense Categorization" },
    { value: "financial_goal_setting", label: "Financial Goal Setting" },
    { value: "net_worth_analysis", label: "Net Worth Analysis" },
    { value: "alternate_credit_scoring", label: "Alternate Credit Scoring" },
    { value: "gig_worker_scoring", label: "Gig Worker Scoring" },
    { value: "health_risk_analysis", label: "Health Risk Analysis" },
    { value: "insurance_linking", label: "Insurance Linking" },
    { value: "bnpl_eligibility", label: "BNPL Eligibility" },
    { value: "instant_credit_check", label: "Instant Credit Check" },
    { value: "emi_conversion_check", label: "EMI Conversion Check" },
    { value: "business_loan_profiling", label: "Business Loan Profiling" },
    { value: "invoice_discounting", label: "Invoice Discounting" },
    { value: "working_capital_check", label: "Working Capital Check" },
    { value: "seasonality_forecasting", label: "Seasonality Forecasting" },
    { value: "transaction_analytics", label: "Transaction Analytics" },
    { value: "market_intelligence", label: "Market Intelligence" },
    { value: "customer_segmentation", label: "Customer Segmentation" },
    { value: "spending_pattern_study", label: "Spending Pattern Study" },
    { value: "product_recommendation", label: "Product Recommendation" },
    { value: "churn_prediction", label: "Churn Prediction" },
    { value: "other", label: "Other" }
  ];

  const predefinedOptions = [
    "account balance",
    "credit score",
    "account details",
    "loan details",
    "repayment history",
    "transaction history",
    "salary inflow",
    "insurance info",
    "nominee details",
    "aadhar number",
    "pan number",
    "DOB"
  ];

  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);

  const handleFieldChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dataFields: checked 
        ? [...prev.dataFields, field]
        : prev.dataFields.filter(f => f !== field)
    }));
  };

  const handleSubmit = async () => {
    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    const token = localStorage.getItem('org_auth_token');
    console.log("request: "+token)

    const consentDetails = {
    policy: "1. Purpose & Scope\n\
This agreement outlines how [Your Organization Name] requests access to your financial data stored in PolicyVault for the sole purposes of:\n\
\n\
- Enhancing personalized financial service offerings.\n\
- Conducting risk assessments and performing due diligence.\n\
- Enabling secure and compliant data analytics in line with applicable regulatory requirements, including RBI guidelines.\n\
\n\
Your data will be strictly used for these stated objectives and processed only by authorized personnel.\n\
\n\
2. Data Handling & Security Measures\n\
Confidentiality: Your data is stored and transmitted using industry-standard encryption and robust security protocols to prevent unauthorized access.\n\
\n\
Access Restrictions: Only designated employees and automated systems with verified credentials may access your information.\n\
\n\
Audit Trails: Comprehensive logs are maintained for every data access and transaction, supporting both operational transparency and compliance reviews.\n\
\n\
3. User Rights & Consent Revocation\n\
Informed Consent: By signing below, you acknowledge that you understand the purposes for which your data is requested and agree to permit [Your Organization Name] to access and process this information.\n\
\n\
Revocation of Consent: At any time, you may withdraw your consent by contacting our Data Protection Officer at [contact email/phone]. Once revoked, no new requests will access your data, and all future processing will cease immediately.\n\
\n\
Review & Audit: You retain the right to request a summary of all data accesses pertaining to your account or to seek clarification on any aspect of this consent.\n\
\n\
4. Legal & Regulatory Compliance\n\
Your data usage under this policy is subject to applicable laws, including RBI directives and data protection regulations. [Your Organization Name] commits to adhering to these legal requirements and ensuring that your rights are protected throughout the data handling process.\n\
\n\
5. Modifications to this Agreement\n\
[Your Organization Name] reserves the right to update this consent policy to reflect changes in legal standards, data processing practices, or technical safeguards. In the event of significant changes, you will be duly notified. Continued use or access of your data after such modifications will imply your acceptance of the revised terms.",
    timestamp: new Date().toISOString(),
    userId: formData.customerId,
    purpose: formData.purpose === "other" ? formData.customPurpose : formData.purpose
  };

    try {
      const response = await axios.post('http://localhost:8000/consent/request-consent', {
        user_identifier: formData.customerId,
        purpose: formData.purpose === "other" ? formData.customPurpose : formData.purpose,
        datafields: formData.dataFields,
        consent_details: consentDetails, 
        consent_signature: "GDPR Compliance Signature"
      },{
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }});

      const newConsent = {
        id: response.data.id || `CNS-2024-${String(Date.now()).slice(-3)}`,
        customerId: formData.customerId,
        purpose: formData.purpose === "other" ? formData.customPurpose : formData.purpose,
        dataFields: formData.dataFields,
        status_admin: 'PENDING',
        status: 'PENDING',
        c_id: response.data.c_id,
        createdAt: new Date().toISOString().split('T')[0],
        
      };
      
      onSubmit(newConsent);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting consent request:", error);
      alert("Failed to submit consent request");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.customerId.trim() !== '' && formData.purpose !== '' && !customerIdError;
      case 2:
        return formData.dataFields.length > 0;
      default:
        return true;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Filter options dynamically
    if (value.trim() === "") {
      setFilteredOptions([]);
      return;
    }

    const filtered = predefinedOptions.filter(
      (option) =>
        option.toLowerCase().includes(value.toLowerCase()) &&
        !selectedTags.includes(option)
    );
    setFilteredOptions(filtered);
  };

  const addTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      setFormData((prev) => ({ ...prev, dataFields: updatedTags }));
    }
    setInputValue("");
    setFilteredOptions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const removeTag = (tag) => {
    const updatedTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(updatedTags);
    setFormData((prev) => ({ ...prev, dataFields: updatedTags }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Consent Request Submitted!</h2>
          <p className="text-slate-600 mb-6 text-sm sm:text-base">
            Your consent request has been sent to the user for approval. You'll receive a notification once they respond.
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Back to Dashboard</span>
        </button>
        <div className="hidden sm:block h-6 w-px bg-slate-300"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Request New Consent</h2>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            This form simulates how an FIU would request consent in production.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Steps */}
        <div className="grid grid-cols-3 border-b border-slate-200">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`p-3 sm:p-4 text-center ${
                step === currentStep ? 'bg-blue-50 text-blue-600' : 
                step < currentStep ? 'bg-green-50 text-green-600' : 'text-slate-400'
              }`}
            >
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs sm:text-sm ${
                step === currentStep ? 'bg-blue-600 text-white' :
                step < currentStep ? 'bg-green-600 text-white' : 'bg-slate-200'
              }`}>
                {step < currentStep ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step}
              </div>
              <p className="text-xs sm:text-sm font-medium">
                {step === 1 ? 'Basic Info' : step === 2 ? 'Data Fields' : 'Review'}
              </p>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  User Identifier
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, customerId: value }));
                    validateCustomerId(value);
                  }}
                  className={`w-full p-3 border ${
                    customerIdError ? "border-red-500" : "border-slate-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                  placeholder="Enter customer identifier"
                />
                {customerIdError && (
                  <p className="text-sm text-red-600 mt-1">{customerIdError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Purpose of Data Access
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">-- Select Purpose --</option>
                  {purposes.map((purpose) => (
                    <option key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </option>
                  ))}
                </select>
                {formData.purpose === "other" && (
                  <input
                    type="text"
                    placeholder="Enter your custom purpose"
                    value={formData.customPurpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPurpose: e.target.value }))}
                    className="mt-2 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Data Fields */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Select Data Fields</h3>
              <div className="w-full max-w-xl">
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Input and Suggestions */}
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type to add field..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />

                  {/* Suggestions Dropdown */}
                  {filteredOptions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-md max-h-40 overflow-auto">
                      {filteredOptions.map((option) => (
                        <li
                          key={option}
                          onClick={() => addTag(option)}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Review & Submit</h3>
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                  <span className="text-sm text-slate-600">Customer ID:</span>
                  <span className="text-sm font-medium break-all">{formData.customerId}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                  <span className="text-sm text-slate-600">Purpose:</span>
                  <span className="text-sm font-medium">
                    {formData.purpose === "other" ? formData.customPurpose : purposes.find(p => p.value === formData.purpose)?.label}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                  <span className="text-sm text-slate-600">Data Fields:</span>
                  <span className="text-sm font-medium">{formData.dataFields.length} selected</span>
                </div>
              </div>
              
              {/* Selected Data Fields Details */}
              {formData.dataFields.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Data Fields:</h4>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {formData.dataFields.map((field, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3 sm:space-y-0">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            Previous
          </button>
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setShowTermsPopup(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto order-1 sm:order-2"
            >
              Submit Request
            </button>
          )}
        </div>
      </div>

      {/* Terms and Conditions Popup */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center max-h-[90vh] overflow-y-auto">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full">
            <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
            <div className="text-justify text-sm leading-relaxed space-y-4 font-sans text-gray-800">
              <p><strong>1. Purpose & Scope</strong><br />
              This agreement outlines how [Your Organization Name] requests access to your financial data stored in PolicyVault for the sole purposes of:<br />
              • Enhancing personalized financial service offerings.<br />
              • Conducting risk assessments and performing due diligence.<br />
              • Enabling secure and compliant data analytics in line with applicable regulatory requirements, including RBI guidelines.<br />
              Your data will be strictly used for these stated objectives and processed only by authorized personnel.</p>

              <p><strong>2. Data Handling & Security Measures</strong><br />
              <strong>Confidentiality:</strong> Your data is stored and transmitted using industry-standard encryption and robust security protocols to prevent unauthorized access.<br />
              <strong>Access Restrictions:</strong> Only designated employees and automated systems with verified credentials may access your information.<br />
              <strong>Audit Trails:</strong> Comprehensive logs are maintained for every data access and transaction, supporting both operational transparency and compliance reviews.</p>

              <p><strong>3. User Rights & Consent Revocation</strong><br />
              <strong>Informed Consent:</strong> By signing below, you acknowledge that you understand the purposes for which your data is requested and agree to permit [Your Organization Name] to access and process this information.<br />
              <strong>Revocation of Consent:</strong> At any time, you may withdraw your consent by contacting our Data Protection Officer at [contact email/phone]. Once revoked, no new requests will access your data, and all future processing will cease immediately.<br />
              <strong>Review & Audit:</strong> You retain the right to request a summary of all data accesses pertaining to your account or to seek clarification on any aspect of this consent.</p>

              <p><strong>4. Legal & Regulatory Compliance</strong><br />
              Your data usage under this policy is subject to applicable laws, including RBI directives and data protection regulations. [Your Organization Name] commits to adhering to these legal requirements and ensuring that your rights are protected throughout the data handling process.</p>

              <p><strong>5. Modifications to this Agreement</strong><br />
              PolicyVault Nexus reserves the right to update this consent policy to reflect changes in legal standards, data processing practices, or technical safeguards. In the event of significant changes, you will be duly notified. Continued use or access of your data after such modifications will imply your acceptance of the revised terms.</p>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="acceptTerms">I accept the terms and conditions</label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTermsPopup(false)}
                className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestConsent;

// RequestConsent.tsx
// import React, { useState } from 'react';
// import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
// import axios from 'axios';

// interface RequestConsentProps {
//   onBack: () => void;
//   onSubmit: (data: ConsentResponse) => void;
// }

// interface ConsentResponse {
//   id: string;
//   user_identifier: string;
//   fiu_id: string;
//   customer_id: string;
//   purpose: string;
//   datafields: string[];
//   status: string;
//   consent_signature: string;
//   created_at: string;
// }

// const RequestConsent: React.FC<RequestConsentProps> = ({ onBack, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     userIdentifier: '',
//     purpose: '',
//     customPurpose: '',
//     dataFields: [] as string[],
//     consentSignature: ''
//   });

//   const [currentStep, setCurrentStep] = useState(1);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [showTermsPopup, setShowTermsPopup] = useState(false);
//   const [acceptTerms, setAcceptTerms] = useState(false);

//   const purposes = [
//     { value: "loan_eligibility_check", label: "Loan Eligibility Check" },
//     { value: "credit_risk_assessment", label: "Credit Risk Assessment" },
//     { value: "income_verification", label: "Income Verification" },
//     { value: "repayment_history_analysis", label: "Repayment History Analysis" },
//     { value: "fraud_detection", label: "Fraud Detection" },
//     { value: "preapproved_offers", label: "Pre-approved Offers" },
//     { value: "insurance_underwriting", label: "Insurance Underwriting" },
//     { value: "risk_profiling", label: "Risk Profiling" },
//     { value: "claims_verification", label: "Claims Verification" },
//     { value: "premium_calculation", label: "Premium Calculation" },
//     { value: "investment_advisory", label: "Investment Advisory" },
//     { value: "wealth_profiling", label: "Wealth Profiling" },
//     { value: "portfolio_management", label: "Portfolio Management" },
//     { value: "tax_planning", label: "Tax Planning" },
//     { value: "aml_monitoring", label: "AML Monitoring" },
//     { value: "regulatory_compliance", label: "Regulatory Compliance" },
//     { value: "audit_trail_generation", label: "Audit Trail Generation" },
//     { value: "kyc_verification", label: "KYC Verification" },
//     { value: "gst_reconciliation", label: "GST Reconciliation" },
//     { value: "suspicious_activity_check", label: "Suspicious Activity Check" },
//     { value: "expense_categorization", label: "Expense Categorization" },
//     { value: "financial_goal_setting", label: "Financial Goal Setting" },
//     { value: "net_worth_analysis", label: "Net Worth Analysis" },
//     { value: "alternate_credit_scoring", label: "Alternate Credit Scoring" },
//     { value: "gig_worker_scoring", label: "Gig Worker Scoring" },
//     { value: "health_risk_analysis", label: "Health Risk Analysis" },
//     { value: "insurance_linking", label: "Insurance Linking" },
//     { value: "bnpl_eligibility", label: "BNPL Eligibility" },
//     { value: "instant_credit_check", label: "Instant Credit Check" },
//     { value: "emi_conversion_check", label: "EMI Conversion Check" },
//     { value: "business_loan_profiling", label: "Business Loan Profiling" },
//     { value: "invoice_discounting", label: "Invoice Discounting" },
//     { value: "working_capital_check", label: "Working Capital Check" },
//     { value: "seasonality_forecasting", label: "Seasonality Forecasting" },
//     { value: "transaction_analytics", label: "Transaction Analytics" },
//     { value: "market_intelligence", label: "Market Intelligence" },
//     { value: "customer_segmentation", label: "Customer Segmentation" },
//     { value: "spending_pattern_study", label: "Spending Pattern Study" },
//     { value: "product_recommendation", label: "Product Recommendation" },
//     { value: "churn_prediction", label: "Churn Prediction" },
//     { value: "other", label: "Other" }
//   ];

//   const predefinedOptions = [
//     "account balance",
//     "credit score",
//     "account details",
//     "loan details",
//     "repayment history",
//     "kyc data",
//     "transaction history",
//     "salary inflow",
//     "insurance info",
//     "nominee details",
//   ];

//   const handleFieldChange = (field: string, checked: boolean) => {
//     setFormData(prev => ({
//       ...prev,
//       dataFields: checked
//         ? [...prev.dataFields, field]
//         : prev.dataFields.filter(f => f !== field)
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!acceptTerms) {
//       alert("Please accept the terms and conditions");
//       return;
//     }

//     try {
//       const response = await axios.post('http://localhost:8000/consent/request-consent', {
//         user_identifier: formData.userIdentifier,
//         purpose: formData.purpose,
//         datafields: formData.dataFields,
//         consent_signature: "GDPR Compliance Signature" // Replace with actual signature logic
//       });

//       onSubmit(response.data);
//       setIsSubmitted(true);
//     } catch (error) {
//       console.error("Error submitting consent request:", error);
//       alert("Failed to submit consent request");
//     }
//   };

//   const canProceed = () => {
//     switch (currentStep) {
//       case 1:
//         return formData.userIdentifier.trim() !== '' && formData.purpose !== '';
//       case 2:
//         return formData.dataFields.length > 0;
//       default:
//         return true;
//     }
//   };

//   if (isSubmitted) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 sm:px-6">
//         <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 text-center">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircle className="w-8 h-8 text-green-600" />
//           </div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Consent Request Submitted!</h2>
//           <p className="text-slate-600 mb-6 text-sm sm:text-base">
//             Your consent request has been sent to the user for approval. You'll receive a notification once they respond.
//           </p>
//           <button
//             onClick={onBack}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
//         <button
//           onClick={onBack}
//           className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors self-start"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           <span className="text-sm sm:text-base">Back to Dashboard</span>
//         </button>
//         <div className="hidden sm:block h-6 w-px bg-slate-300"></div>
//         <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Request New Consent</h2>
//       </div>

//       {/* Info Banner */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//         <div className="flex items-start space-x-2">
//           <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//           <p className="text-sm text-blue-800">
//             This form simulates how an FIU would request consent in production.
//           </p>
//         </div>
//       </div>

//       {/* Main Form Container */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//         {/* Progress Steps */}
//         <div className="grid grid-cols-3 border-b border-slate-200">
//           {[1, 2, 3].map((step) => (
//             <div
//               key={step}
//               className={`p-3 sm:p-4 text-center ${
//                 step === currentStep ? 'bg-blue-50 text-blue-600' :
//                 step < currentStep ? 'bg-green-50 text-green-600' : 'text-slate-400'
//               }`}
//             >
//               <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-xs sm:text-sm ${
//                 step === currentStep ? 'bg-blue-600 text-white' :
//                 step < currentStep ? 'bg-green-600 text-white' : 'bg-slate-200'
//               }`}>
//                 {step < currentStep ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : step}
//               </div>
//               <p className="text-xs sm:text-sm font-medium">
//                 {step === 1 ? 'Basic Info' : step === 2 ? 'Data Fields' : 'Review'}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Form Content */}
//         <div className="p-4 sm:p-6">
//           {/* Step 1: Basic Info */}
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   User Identifier
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.userIdentifier}
//                   onChange={(e) => setFormData(prev => ({ ...prev, userIdentifier: e.target.value }))}
//                   className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//                   placeholder="Enter user identifier"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Purpose of Data Access
//                 </label>
//                 <select
//                   id="purpose"
//                   name="purpose"
//                   value={formData.purpose}
//                   onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
//                   className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
//                 >
//                   <option value="">-- Select Purpose --</option>
//                   {purposes.map((purpose) => (
//                     <option key={purpose.value} value={purpose.value}>
//                       {purpose.label}
//                     </option>
//                   ))}
//                 </select>
//                 {formData.purpose === "other" && (
//                   <input
//                     type="text"
//                     placeholder="Enter your custom purpose"
//                     value={formData.customPurpose}
//                     onChange={(e) => setFormData(prev => ({ ...prev, customPurpose: e.target.value }))}
//                     className="mt-2 border rounded-md w-full"
//                   />
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Step 2: Data Fields */}
//           {currentStep === 2 && (
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Select Data Fields</h3>
//               <div className="w-full max-w-xl">
//                 <div className="flex flex-wrap gap-2 mb-3">
//                   {formData.dataFields.map((tag) => (
//                     <div
//                       key={tag}
//                       className="flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
//                     >
//                       {tag}
//                       <button
//                         onClick={() => handleFieldChange(tag, false)}
//                         className="ml-2 text-blue-600 hover:text-blue-800"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="relative">
//                   <select
//                     onChange={(e) => handleFieldChange(e.target.value, true)}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Select a data field</option>
//                     {predefinedOptions.map((option) => (
//                       <option key={option} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Review */}
//           {currentStep === 3 && (
//             <div>
//               <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Review & Submit</h3>
//               <div className="bg-slate-50 p-4 rounded-lg space-y-3">
//                 <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">User Identifier:</span>
//                   <span className="text-sm font-medium break-all">{formData.userIdentifier}</span>
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">Purpose:</span>
//                   <span className="text-sm font-medium">{formData.purpose}</span>
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
//                   <span className="text-sm text-slate-600">Data Fields:</span>
//                   <span className="text-sm font-medium">{formData.dataFields.length} selected</span>
//                 </div>
//               </div>

//               {formData.dataFields.length > 0 && (
//                 <div className="mt-4">
//                   <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Data Fields:</h4>
//                   <div className="bg-slate-50 p-3 rounded-lg">
//                     <div className="flex flex-wrap gap-2">
//                       {formData.dataFields.map((field, index) => (
//                         <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
//                           {field}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Navigation Footer */}
//         <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3 sm:space-y-0">
//           <button
//             onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
//             disabled={currentStep === 1}
//             className="px-4 py-2 text-slate-600 hover:text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed order-2 sm:order-1"
//           >
//             Previous
//           </button>
//           {currentStep < 3 ? (
//             <button
//               onClick={() => setCurrentStep(currentStep + 1)}
//               disabled={!canProceed()}
//               className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               onClick={() => setShowTermsPopup(true)}
//               className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto order-1 sm:order-2"
//             >
//               Submit Request
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Terms and Conditions Popup */}
//       {showTermsPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg max-w-md w-full">
//             <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
//             <p className="mb-4">
//               By submitting this request, you agree to the terms and conditions of data processing.
//             </p>
//             <div className="flex items-center mb-4">
//               <input
//                 type="checkbox"
//                 id="acceptTerms"
//                 checked={acceptTerms}
//                 onChange={(e) => setAcceptTerms(e.target.checked)}
//                 className="mr-2"
//               />
//               <label htmlFor="acceptTerms">I accept the terms and conditions</label>
//             </div>
//             <div className="flex justify-end">
//               <button
//                 onClick={() => setShowTermsPopup(false)}
//                 className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//               >
//                 Accept
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RequestConsent;
