// import React, { useState, useRef, ChangeEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ReCAPTCHA from 'react-google-recaptcha';
// import axios, { AxiosError } from 'axios';

// const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// interface FormData {
//   registration_number: string;
//   org_name: string;
//   logo: File | null;
//   website_url: string;
//   contact_email: string;
//   contact_number: string;
//   location: string;
//   description: string;
//   industry_type: string[];
//   other_industry: string;
//   password: string;
//   confirm_password: string;
// }

// interface FormErrors {
//   registration_number?: string;
//   org_name?: string;
//   contact_email?: string;
//   contact_number?: string;
//   location?: string;
//   industry_type?: string;
//   password?: string;
//   confirm_password?: string;
// }

// // interface ApiErrorResponse {
// //   message?: string;
// // }
// const industryOptions = [
//   'Banking',
//   'Insurance',
//   'Healthcare',
//   'Education',
//   'Retail',
//   'Technology',
//   'Government',
//   'Other'
// ] as const;

// const OrganizationRegister = () => {
//   const [step, setStep] = useState<number>(1);
//   const [formData, setFormData] = useState<FormData>({
//     registration_number: '',
//     org_name: '',
//     logo: null,
//     website_url: '',
//     contact_email: '',
//     contact_number: '',
//     location: '',
//     description: '',
//     industry_type: [],
//     other_industry: '',
//     password: '',
//     confirm_password: ''
//   });
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [submitError, setSubmitError] = useState<string>('');
//   const [apiKey, setApiKey] = useState<string>('');
//   const [showApiKey, setShowApiKey] = useState<boolean>(false);
//   const apiKeyRef = useRef<HTMLInputElement>(null);
//   const recaptchaRef = useRef<ReCAPTCHA>(null);
//   const navigate = useNavigate();

//   // const validateStep = (currentStep: number): boolean => {
//   //   const newErrors: FormErrors = {};
    
//   //   if (currentStep === 1) {
//   //     if (!formData.registration_number.match(/^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$/)) {
//   //       newErrors.registration_number = 'Must be valid OUI format (e.g., AC:DE:48)';
//   //     }
//   //     if (!formData.org_name.trim()) {
//   //       newErrors.org_name = 'Organization name is required';
//   //     }
//   //   }

//   //   if (currentStep === 2) {
//   //     if (!formData.contact_email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
//   //       newErrors.contact_email = 'Invalid email format';
//   //     }
//   //     if (!formData.contact_number.match(/^\d{10}$/)) {
//   //       newErrors.contact_number = 'Must be 10 digits';
//   //     }
//   //     if (!formData.location.trim()) {
//   //       newErrors.location = 'Location is required';
//   //     }
//   //   }

//   //   if (currentStep === 3) {
//   //     if (formData.industry_type.length === 0) {
//   //       newErrors.industry_type = 'Select at least one industry';
//   //     }
//   //   }

//   //   if (currentStep === 4) {
//   //     if (formData.password.length < 8) {
//   //       newErrors.password = 'Password must be at least 8 characters';
//   //     }
//   //     if (formData.password !== formData.confirm_password) {
//   //       newErrors.confirm_password = 'Passwords do not match';
//   //     }
//   //   }

//   //   setErrors(newErrors);
//   //   return Object.keys(newErrors).length === 0;
//   // };

//   const validateStep = (currentStep: number): boolean => {
//   const newErrors: FormErrors = {};
  
//   if (currentStep === 1) {
//     if (!formData.registration_number.match(/^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$/)) {
//       newErrors.registration_number = 'Must be valid OUI format (e.g., AC:DE:48)';
//     }
//     if (!formData.org_name.trim()) {
//       newErrors.org_name = 'Organization name is required';
//     }
//   }

//   if (currentStep === 2) {
//     if (!formData.contact_email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
//       newErrors.contact_email = 'Invalid email format';
//     }
//     if (!formData.contact_number.match(/^\d{10}$/)) {
//       newErrors.contact_number = 'Must be 10 digits';
//     }
//     if (!formData.location.trim()) {
//       newErrors.location = 'Location is required';
//     }
//   }

//   if (currentStep === 3) {
//     const validIndustries = ['Banking', 'Insurance', 'Healthcare', 'Education', 
//                            'Retail', 'Technology', 'Government', 'Other'];
//     if (formData.industry_type.length === 0) {
//       newErrors.industry_type = 'Select at least one industry';
//     } else if (formData.industry_type.some(ind => !validIndustries.includes(ind))) {
//       newErrors.industry_type = 'Invalid industry selected';
//     }
//   }

//   if (currentStep === 4) {
//     if (formData.password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters';
//     }
//     if (formData.password !== formData.confirm_password) {
//       newErrors.confirm_password = 'Passwords do not match';
//     }
//   }

//   setErrors(newErrors);
//   return Object.keys(newErrors).length === 0;
// };
//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value, files } = e.target as HTMLInputElement;

//     if (name === 'logo' && files && files.length > 0) {
//     setFormData(prev => ({
//       ...prev,
//       [name]: files[0]  // Store the File object directly
//     }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//     // setFormData(prev => ({
//     //   ...prev,
//     //   [name]: files ? files[0] : value
//     // }));
//   };

//   const handleIndustryChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { value, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       industry_type: checked
//         ? [...prev.industry_type, value]
//         : prev.industry_type.filter(item => item !== value)
//     }));
//   };

//   const nextStep = () => {
//     if (validateStep(step)) {
//       setStep(step + 1);
//     }
//   };

//   const prevStep = () => {
//     setStep(step - 1);
//   };

//   const copyApiKey = () => {
//     if (apiKeyRef.current) {
//       apiKeyRef.current.select();
//       document.execCommand('copy');
//       // Optionally show a tooltip or notification that the key was copied
//     }
//   };


//   // const handleSubmit = async () => {
//   //   if (!validateStep(4)) return;

//   //   setIsLoading(true);
//   //   setSubmitError('');

//   //   try {
//   //     let logoUrl = '';
//   //     if (formData.logo) {
//   //       const formDataWithLogo = new FormData();
//   //       formDataWithLogo.append('file', formData.logo);
        
//   //       const uploadResponse = await axios.post(
//   //       `${API_BASE_URL}/storage/upload-logo`,  // Changed from /storage/upload-logo
//   //       formDataWithLogo,
//   //       {
//   //         headers: {
//   //           'Content-Type': 'multipart/form-data',
//   //         }
//   //       }
//   //     );
//   //       logoUrl = uploadResponse.data.url;
//   //     }

//   //     const registrationResponse = await axios.post(
//   //       `${API_BASE_URL}/auth/register-org`,
//   //       {
//   //         ...formData,
//   //         logo_url: logoUrl,
//   //         industry_type: formData.industry_type
//   //       }
//   //     );

//   //     if (registrationResponse.status === 201) {
//   //       navigate('/registration-success');
//   //     }
//   //   } catch (error) {
//   //     const axiosError = error as AxiosError<ApiErrorResponse>;
//   //     setSubmitError(
//   //       axiosError.response?.data?.message?.toString() || 
//   //       'Registration failed. Please try again.'
//   //     );
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // ... (keep all your existing imports and initial code)

// const handleSubmit = async () => {
//   if (!validateStep(4)) return;

//   setIsLoading(true);
//   setSubmitError('');

//   try {
//     // Prepare the data in the format backend expects
//     const registrationData = {
//       registration_number: formData.registration_number.toUpperCase(),
//       org_name: formData.org_name,
//       contact_email: formData.contact_email,
//       contact_number: formData.contact_number,
//       location: formData.location,
//       industry_type: formData.industry_type,
//       other_industry: formData.industry_type.includes('Other') ? formData.other_industry : undefined,
//       password: formData.password,
//       confirm_password: formData.confirm_password,
//       website_url: formData.website_url || undefined,
//       description: formData.description || undefined,
//       logo_url: formData.logo || undefined
//     };

//     // First upload logo if exists
//     let logoUrl = undefined;
//     if (formData.logo) {
//       const logoFormData = new FormData();
//       logoFormData.append('file', formData.logo);
      
//       const uploadResponse = await axios.post(
//         `${API_BASE_URL}/register_org/storage/upload-logo`,
//         logoFormData,
//         {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         }
//       );
      
//       if (uploadResponse.data?.url) {
//         logoUrl = uploadResponse.data.url;
//       }
//     }

//     // Add logo URL to registration data if uploaded
//     if (logoUrl) {
//       registrationData.logo_url = logoUrl;
//     }

//     // Send registration data
//     const response = await axios.post(
//       `${API_BASE_URL}/register_org/register`,
//       registrationData,
//       {
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );

//     if (response.status === 201) {
//       setApiKey(response.data.api_key);
//       setShowApiKey(true);
//     }
//   } catch (error) {
//     const axiosError = error as AxiosError<{ message?: string }>;
//     setSubmitError(
//       axiosError.response?.data?.message || 
//       axiosError.message ||
//       'Registration failed. Please check your inputs and try again.'
//     );
//   } finally {
//     setIsLoading(false);
//   }
// };

// // ... (keep the rest of your component code)

// //   const handleSubmit = async () => {
// //   if (!validateStep(4)) return;

// //   setIsLoading(true);
// //   setSubmitError('');

// //   try {
// //     let logoUrl = '';
// //     if (formData.logo) {
// //       try {

// //         const formDataToSend = new FormData();
// //         formDataToSend.append('registration_number', formData.registration_number);
// //         formDataToSend.append('org_name', formData.org_name);


// //         const formDataWithLogo = new FormData();
// //         formDataWithLogo.append('file', formData.logo);
        
// //         const uploadResponse = await axios.post(
// //           `${API_BASE_URL}/register_org/storage/upload-logo`,
// //           formDataWithLogo,
// //           {
// //             headers: {
// //               'Content-Type': 'multipart/form-data',
// //             },
// //             timeout: 30000
// //           }
// //         );
        
// //         if (!uploadResponse.data?.url) {
// //           throw new Error('No URL returned from upload');
// //         }
// //         logoUrl = uploadResponse.data.url;
// //       } catch (uploadError) {
// //         console.error('Upload failed:', uploadError);
// //         throw new Error('Failed to upload logo. Please try again.');
// //       }
// //     }

// //     const registrationResponse = await axios.post(
// //       `${API_BASE_URL}/register_org/register`,
// //       {
// //         ...formData,
// //         logo_url: logoUrl,
// //         industry_type: formData.industry_type
// //       },
// //       {
// //         timeout: 10000
// //       }
// //     );

// //     if (registrationResponse.status === 201) {
// //       if (registrationResponse.data.api_key) {
// //           setApiKey(registrationResponse.data.api_key);
// //           setShowApiKey(true);
// //         } else {
// //           navigate('/login-org');
// //         }
// //     }
// //   } catch (error) {
// //     const axiosError = error as AxiosError<ApiErrorResponse>;
// //     setSubmitError(
// //       axiosError.response?.data?.message || 
// //       axiosError.message ||
// //       'Registration failed. Please try again.'
// //     );
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       {(submitError || Object.keys(errors).length > 0) && (
//         <div className="w-full max-w-5xl mb-4">
//           {submitError && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//               {submitError}
//             </div>
//           )}
//           {Object.keys(errors).length > 0 && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//               Please fix the errors in the form before proceeding.
//             </div>
//           )}
//         </div>
//       )}
//       <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
//       <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />
      
//       <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
//         {/* Left Side */}
//         <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
//           <div className="w-full h-full flex flex-col justify-between p-8">
//             <span className="flex items-center space-x-2 relative">
//               <div className="relative">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="32"
//                   height="32"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   className="lucide lucide-shield h-8 w-8 text-indigo-600 z-10 relative"
//                 >
//                   <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
//                 </svg>
//                 <div className="absolute inset-0 h-8 w-8 bg-indigo-600/30 rounded-full blur-sm z-0" />
//               </div>
//               <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
//                 PolicyVault
//               </h1>
//             </span>

//             <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
//               <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
//                 PolicyVault <span className="italic font-semibold text-white">NEXUS</span>
//               </h1>
//               <p className="text-md font-light text-white">
//                 Register your organization to join our secure data sharing network.
//               </p>
//               <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
//                 Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Registration Form */}
//         <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
//           <div className="w-full max-w-md space-y-4 p-8">
//             <h2 className="text-4xl font-bold text-[#1E3A8A]">Register Organization</h2>
//             <div className="flex mb-4">
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i} className="flex items-center">
//                   <div 
//                     className={`w-8 h-8 rounded-full flex items-center justify-center 
//                       ${step >= i ? 'bg-[#1E3A8A] text-white' : 'bg-gray-300 text-gray-600'}`}
//                   >
//                     {i}
//                   </div>
//                   {i < 4 && (
//                     <div className={`w-8 h-1 ${step > i ? 'bg-[#1E3A8A]' : 'bg-gray-300'}`} />
//                   )}
//                 </div>
//               ))}
//             </div>

//             {submitError && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
//                 {submitError}
//               </div>
//             )}

//             {/* Step 1: Organization Details */}
//             {step === 1 && (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">OUI Registration Number*</label>
//                   <input
//                     type="text"
//                     name="registration_number"
//                     placeholder="XX:XX:XX (e.g., AC:DE:48)"
//                     value={formData.registration_number}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                   {errors.registration_number && (
//                     <p className="mt-1 text-sm text-red-600">{errors.registration_number}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Organization Name*</label>
//                   <input
//                     type="text"
//                     name="org_name"
//                     value={formData.org_name}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                   {errors.org_name && (
//                     <p className="mt-1 text-sm text-red-600">{errors.org_name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Logo*</label>
//                   {/* <input
//                     type="file"
//                     name="logo"
//                     accept="image/*"
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm"
//                   /> */}
//                   <input
//                   type="file"
//                   name="logo"
//                   accept="image/*"
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border rounded-md shadow-sm"
//                   key={formData.logo?.name || 'file-input'} // Add key to reset input
//                 />
//                 {formData.logo && (
//                   <p className="mt-1 text-sm text-gray-500">
//                     Selected: {formData.logo.name} ({(formData.logo.size / 1024).toFixed(2)} KB)
//                   </p>
//                 )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Website URL</label>
//                   <input
//                     type="url"
//                     name="website_url"
//                     value={formData.website_url}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                 </div>

//                 <button
//                   onClick={nextStep}
//                   className="w-full bg-[#1E3A8A] text-white py-2 rounded-md hover:bg-[#1E40AF]"
//                 >
//                   Continue
//                 </button>
//               </div>
//             )}

//             {/* Step 2: Contact Information */}
//             {step === 2 && (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Contact Email*</label>
//                   <input
//                     type="email"
//                     name="contact_email"
//                     value={formData.contact_email}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                   {errors.contact_email && (
//                     <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Contact Number*</label>
//                   <input
//                     type="tel"
//                     name="contact_number"
//                     value={formData.contact_number}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                   {errors.contact_number && (
//                     <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Location*</label>
//                   <input
//                     type="text"
//                     name="location"
//                     value={formData.location}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                   {errors.location && (
//                     <p className="mt-1 text-sm text-red-600">{errors.location}</p>
//                   )}
//                 </div>

//                 <div className="flex justify-between">
//                   <button
//                     onClick={prevStep}
//                     className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
//                   >
//                     Back
//                   </button>
//                   <button
//                     onClick={nextStep}
//                     className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF]"
//                   >
//                     Continue
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Industry & Description */}
//             {step === 3 && (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Description</label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     rows={3}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Industry Type*</label>
//                   <div className="mt-2 space-y-2">
//                     {industryOptions.map((option) => (
//                       <div key={option} className="flex items-center">
//                         <input
//                           type="checkbox"
//                           id={option}
//                           name="industry_type"
//                           value={option}
//                           checked={formData.industry_type.includes(option)}
//                           onChange={handleIndustryChange}
//                           className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
//                         />
//                         <label htmlFor={option} className="ml-2 block text-sm text-gray-700">
//                           {option}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                   {errors.industry_type && (
//                     <p className="mt-1 text-sm text-red-600">{errors.industry_type}</p>
//                   )}
//                 </div>

//                 {formData.industry_type.includes('Other') && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Specify Other Industry</label>
//                     <input
//                       type="text"
//                       name="other_industry"
//                       value={formData.other_industry}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                     />
//                   </div>
//                 )}

//                 <div className="flex justify-between">
//                   <button
//                     onClick={prevStep}
//                     className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
//                   >
//                     Back
//                   </button>
//                   <button
//                     onClick={nextStep}
//                     className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF]"
//                   >
//                     Continue
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 4: Password */}
//             {step === 4 && (
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Password*</label>
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                   {errors.password && (
//                     <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Confirm Password*</label>
//                   <input
//                     type="password"
//                     name="confirm_password"
//                     value={formData.confirm_password}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//                   />
//                   {errors.confirm_password && (
//                     <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
//                   )}
//                 </div>

//                 {showApiKey && 
//                   <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="font-medium text-blue-800">Your API Key</h3>
//                       <button
//                         onClick={copyApiKey}
//                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
//                       >
//                         Copy
//                       </button>
//                     </div>
//                     <input
//                       ref={apiKeyRef}
//                       type="text"
//                       value={apiKey}
//                       readOnly
//                       className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-sm font-mono mb-2"
//                     />
//                     <p className="text-xs text-blue-600">
//                       Please copy and securely store this API key. You won't be able to see it again.
//                     </p>
//                     <button
//                       onClick={() => navigate('/login-org')}
//                       className="w-full mt-3 bg-[#1E3A8A] text-white py-2 rounded-md hover:bg-[#1E40AF]"
//                     >
//                       Proceed to Login
//                     </button>
//                   </div>
//                 }

//                 {!showApiKey && <div className="flex justify-between">
//                   <button
//                     onClick={prevStep}
//                     className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
//                   >
//                     Back
//                   </button>
//                   <button
//                     onClick={handleSubmit}
//                     disabled={isLoading}
//                     className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] disabled:opacity-50"
//                   >
//                     {isLoading ? 'Submitting...' : 'Complete Registration'}
//                   </button>
//                 </div>}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={RECAPTCHA_SITE_KEY} />
//     </div>

//     //  <div className="min-h-screen flex flex-col items-center justify-start pt-4">
//     //   {/* Error message at top of screen with full width */}
//     //   {(submitError || Object.keys(errors).length > 0) && (
//     //     <div className="w-full max-w-5xl mb-4">
//     //       {submitError && (
//     //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//     //           {submitError}
//     //         </div>
//     //       )}
//     //       {Object.keys(errors).length > 0 && (
//     //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//     //           Please fix the errors in the form before proceeding.
//     //         </div>
//     //       )}
//     //     </div>
//     //   )}

//     //   <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
//     //     {/* Left Side */}
//     //     <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
//     //       <div className="w-full h-full flex flex-col justify-between p-8">
//     //         <span className="flex items-center space-x-2 relative">
//     //           <div className="relative">
//     //             <svg
//     //               xmlns="http://www.w3.org/2000/svg"
//     //               width="32"
//     //               height="32"
//     //               viewBox="0 0 24 24"
//     //               fill="none"
//     //               stroke="currentColor"
//     //               strokeWidth="2"
//     //               strokeLinecap="round"
//     //               strokeLinejoin="round"
//     //               className="lucide lucide-shield h-8 w-8 text-indigo-600 z-10 relative"
//     //             >
//     //               <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
//     //             </svg>
//     //             <div className="absolute inset-0 h-8 w-8 bg-indigo-600/30 rounded-full blur-sm z-0" />
//     //           </div>
//     //           <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
//     //             PolicyVault
//     //           </h1>
//     //         </span>

//     //         <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
//     //           <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
//     //             PolicyVault <span className="italic font-semibold text-white">NEXUS</span>
//     //           </h1>
//     //           <p className="text-md font-light text-white">
//     //             Register your organization to join our secure data sharing network.
//     //           </p>
//     //           <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
//     //             Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
//     //           </div>
//     //         </div>
//     //       </div>
//     //     </div>

//     //     {/* Right Side - Registration Form */}
//     //     <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
//     //       <div className="w-full max-w-md space-y-4 p-8">
//     //         <h2 className="text-4xl font-bold text-[#1E3A8A]">Register Organization</h2>
//     //         <div className="flex mb-4">
//     //           {[1, 2, 3, 4].map((i) => (
//     //             <div key={i} className="flex items-center">
//     //               <div 
//     //                 className={`w-8 h-8 rounded-full flex items-center justify-center 
//     //                   ${step >= i ? 'bg-[#1E3A8A] text-white' : 'bg-gray-300 text-gray-600'}`}
//     //               >
//     //                 {i}
//     //               </div>
//     //               {i < 4 && (
//     //                 <div className={`w-8 h-1 ${step > i ? 'bg-[#1E3A8A]' : 'bg-gray-300'}`} />
//     //               )}
//     //             </div>
//     //           ))}
//     //         </div>

//     //         {/* Step 1: Organization Details */}
//     //         {step === 1 && (
//     //           <div className="space-y-4">
//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">OUI Registration Number*</label>
//     //               <input
//     //                 type="text"
//     //                 name="registration_number"
//     //                 placeholder="XX:XX:XX (e.g., AC:DE:48)"
//     //                 value={formData.registration_number}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //               {errors.registration_number && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.registration_number}</p>
//     //               )}
//     //             </div>

//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Organization Name*</label>
//     //               <input
//     //                 type="text"
//     //                 name="org_name"
//     //                 value={formData.org_name}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //               {errors.org_name && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.org_name}</p>
//     //               )}
//     //             </div>

//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Logo*</label>
//     //               <input
//     //                 type="file"
//     //                 name="logo"
//     //                 accept="image/*"
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm"
//     //                 key={formData.logo?.name || 'file-input'}
//     //               />
//     //               {formData.logo && (
//     //                 <p className="mt-1 text-sm text-gray-500">
//     //                   Selected: {formData.logo.name} ({(formData.logo.size / 1024).toFixed(2)} KB)
//     //                 </p>
//     //               )}
//     //             </div>

//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Website URL</label>
//     //               <input
//     //                 type="url"
//     //                 name="website_url"
//     //                 value={formData.website_url}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //             </div>

//     //             <button
//     //               onClick={nextStep}
//     //               className="w-full bg-[#1E3A8A] text-white py-2 rounded-md hover:bg-[#1E40AF]"
//     //             >
//     //               Continue
//     //             </button>
//     //           </div>
//     //         )}

//     //         {/* Step 2: Contact Information */}
//     //         {step === 2 && (
//     //           <div className="space-y-4">
//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Contact Email*</label>
//     //               <input
//     //                 type="email"
//     //                 name="contact_email"
//     //                 value={formData.contact_email}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //               {errors.contact_email && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
//     //               )}
//     //             </div>

//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Contact Number*</label>
//     //               <input
//     //                 type="tel"
//     //                 name="contact_number"
//     //                 value={formData.contact_number}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //               {errors.contact_number && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
//     //               )}
//     //             </div>

//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Location*</label>
//     //               <input
//     //                 type="text"
//     //                 name="location"
//     //                 value={formData.location}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //               {errors.location && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.location}</p>
//     //               )}
//     //             </div>

//     //             <div className="flex justify-between">
//     //               <button
//     //                 onClick={prevStep}
//     //                 className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
//     //               >
//     //                 Back
//     //               </button>
//     //               <button
//     //                 onClick={nextStep}
//     //                 className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF]"
//     //               >
//     //                 Continue
//     //               </button>
//     //             </div>
//     //           </div>
//     //         )}

//     //         {/* Step 3: Industry & Description */}
//     //         {step === 3 && (
//     //           <div className="space-y-4">
//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Description</label>
//     //               <textarea
//     //                 name="description"
//     //                 value={formData.description}
//     //                 onChange={handleChange}
//     //                 rows={3}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //             </div>

//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Industry Type*</label>
//     //               <div className="mt-2 space-y-2">
//     //                 {industryOptions.map((option) => (
//     //                   <div key={option} className="flex items-center">
//     //                     <input
//     //                       type="checkbox"
//     //                       id={option}
//     //                       name="industry_type"
//     //                       value={option}
//     //                       checked={formData.industry_type.includes(option)}
//     //                       onChange={handleIndustryChange}
//     //                       className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
//     //                     />
//     //                     <label htmlFor={option} className="ml-2 block text-sm text-gray-700">
//     //                       {option}
//     //                     </label>
//     //                   </div>
//     //                 ))}
//     //               </div>
//     //               {errors.industry_type && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.industry_type}</p>
//     //               )}
//     //             </div>

//     //             {formData.industry_type.includes('Other') && (
//     //               <div>
//     //                 <label className="block text-sm font-medium text-gray-700">Specify Other Industry</label>
//     //                 <input
//     //                   type="text"
//     //                   name="other_industry"
//     //                   value={formData.other_industry}
//     //                   onChange={handleChange}
//     //                   className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //                 />
//     //               </div>
//     //             )}

//     //             <div className="flex justify-between">
//     //               <button
//     //                 onClick={prevStep}
//     //                 className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
//     //               >
//     //                 Back
//     //               </button>
//     //               <button
//     //                 onClick={nextStep}
//     //                 className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF]"
//     //               >
//     //                 Continue
//     //               </button>
//     //             </div>
//     //           </div>
//     //         )}

//     //         {/* Step 4: Password */}
//     //         {step === 4 && (
//     //           <div className="space-y-4">
//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Password*</label>
//     //               <input
//     //                 type="password"
//     //                 name="password"
//     //                 value={formData.password}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //               {errors.password && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//     //               )}
//     //             </div>

//     //             <div>
//     //               <label className="block text-sm font-medium text-gray-700">Confirm Password*</label>
//     //               <input
//     //                 type="password"
//     //                 name="confirm_password"
//     //                 value={formData.confirm_password}
//     //                 onChange={handleChange}
//     //                 className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
//     //               />
//     //               {errors.confirm_password && (
//     //                 <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
//     //               )}
//     //             </div>

//     //             {/* API Key Display (shown after successful registration) */}
//     //             {showApiKey && (
//     //               <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
//     //                 <div className="flex items-center justify-between mb-2">
//     //                   <h3 className="font-medium text-blue-800">Your API Key</h3>
//     //                   <button
//     //                     onClick={copyApiKey}
//     //                     className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
//     //                   >
//     //                     Copy
//     //                   </button>
//     //                 </div>
//     //                 <input
//     //                   ref={apiKeyRef}
//     //                   type="text"
//     //                   value={apiKey}
//     //                   readOnly
//     //                   className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-sm font-mono mb-2"
//     //                 />
//     //                 <p className="text-xs text-blue-600">
//     //                   Please copy and securely store this API key. You won't be able to see it again.
//     //                 </p>
//     //                 <button
//     //                   onClick={() => navigate('/login-org')}
//     //                   className="w-full mt-3 bg-[#1E3A8A] text-white py-2 rounded-md hover:bg-[#1E40AF]"
//     //                 >
//     //                   Proceed to Login
//     //                 </button>
//     //               </div>
//     //             )}

//     //             {!showApiKey && (
//     //               <div className="flex justify-between">
//     //                 <button
//     //                   onClick={prevStep}
//     //                   className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
//     //                 >
//     //                   Back
//     //                 </button>
//     //                 <button
//     //                   onClick={handleSubmit}
//     //                   disabled={isLoading}
//     //                   className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] disabled:opacity-50"
//     //                 >
//     //                   {isLoading ? 'Submitting...' : 'Complete Registration'}
//     //                 </button>
//     //               </div>
//     //             )}
//     //           </div>
//     //         )}
//     //       </div>
//     //     </div>
//     //   </div>
//     //   <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={RECAPTCHA_SITE_KEY} />
//     // </div>
//   );
// };

// export default OrganizationRegister;

import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FormData {
  registration_number: string;
  org_name: string;
  logo: File | null;
  website_url: string;
  contact_email: string;
  contact_number: string;
  location: string;
  description: string;
  industry_type: string[];
  other_industry: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  registration_number?: string;
  org_name?: string;
  contact_email?: string;
  contact_number?: string;
  location?: string;
  industry_type?: string;
  password?: string;
  confirm_password?: string;
}

interface ApiErrorResponse {
  message?: string;
}

// interface OrganizationResponse {
//   id: string;
//   org_name: string;
//   registration_number: string;
//   logo_url: string | null;
//   website_url: string | null;
//   contact_email: string;
//   contact_number: string;
//   location: string;
//   description: string | null;
//   industry_type: string[];
//   other_industry: string | null;
//   status: string;
//   created_at: string;
//   password_hash: string;
//   api_key: string; // Now at root level
// }


const industryOptions = [
  'Banking',
  'Insurance',
  'Healthcare',
  'Education',
  'Retail',
  'Technology',
  'Government',
  'Other'
] as const;

const OrganizationRegister = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    registration_number: '',
    org_name: '',
    logo: null,
    website_url: '',
    contact_email: '',
    contact_number: '',
    location: '',
    description: '',
    industry_type: [],
    other_industry: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (currentStep === 1) {
      if (!formData.registration_number.match(/^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$/)) {
        newErrors.registration_number = 'Must be valid OUI format (e.g., AC:DE:48)';
      }
      if (!formData.org_name.trim()) {
        newErrors.org_name = 'Organization name is required';
      }
    }

    if (currentStep === 2) {
      if (!formData.contact_email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
        newErrors.contact_email = 'Invalid email format';
      }
      if (!formData.contact_number.match(/^\d{10}$/)) {
        newErrors.contact_number = 'Must be 10 digits';
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
    }

    if (currentStep === 3) {
      if (formData.industry_type.length === 0) {
        newErrors.industry_type = 'Select at least one industry';
      }
    }

    if (currentStep === 4) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'logo' && files && files.length > 0) {
    setFormData(prev => ({
      ...prev,
      [name]: files[0]  // Store the File object directly
    }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // setFormData(prev => ({
    //   ...prev,
    //   [name]: files ? files[0] : value
    // }));
  };

  const handleIndustryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      industry_type: checked
        ? [...prev.industry_type, value]
        : prev.industry_type.filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // const handleSubmit = async () => {
  //   if (!validateStep(4)) return;

  //   setIsLoading(true);
  //   setSubmitError('');

  //   try {
  //     let logoUrl = '';
  //     if (formData.logo) {
  //       const formDataWithLogo = new FormData();
  //       formDataWithLogo.append('file', formData.logo);
        
  //       const uploadResponse = await axios.post(
  //       `${API_BASE_URL}/storage/upload-logo`,  // Changed from /storage/upload-logo
  //       formDataWithLogo,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         }
  //       }
  //     );
  //       logoUrl = uploadResponse.data.url;
  //     }

  //     const registrationResponse = await axios.post(
  //       `${API_BASE_URL}/auth/register-org`,
  //       {
  //         ...formData,
  //         logo_url: logoUrl,
  //         industry_type: formData.industry_type
  //       }
  //     );

  //     if (registrationResponse.status === 201) {
  //       navigate('/registration-success');
  //     }
  //   } catch (error) {
  //     const axiosError = error as AxiosError<ApiErrorResponse>;
  //     setSubmitError(
  //       axiosError.response?.data?.message?.toString() || 
  //       'Registration failed. Please try again.'
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  interface ApiKeyResponse {
    api_key: string;
    verification_token: string;
    id: string;
    organization : {
      id: string;
      org_name: string;
      registration_number: string;
      logo_url: string | null;
      website_url: string | null;
      contact_email: string;
      contact_number: string;
      location: string;
      description: string | null;
      industry_type: string[];
      other_industry: string | null;
      status: string;
      created_at: string; // or Date if you parse it
      password_hash: string;
      api_key: string;
    };
  }
  const handleSubmit = async () => {
  if (!validateStep(4)) return;

  setIsLoading(true);
  setSubmitError('');

  try {
    let logoUrl = '';
    if (formData.logo) {
      try {
        const formDataWithLogo = new FormData();
        formDataWithLogo.append('file', formData.logo);
        
        const uploadResponse = await axios.post(
          `${API_BASE_URL}/register_org/storage/upload-logo`,
          formDataWithLogo,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000
          }
        );
        
        if (!uploadResponse.data?.url) {
          throw new Error('No URL returned from upload');
        }
        logoUrl = uploadResponse.data.url;
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        throw new Error('Failed to upload logo. Please try again.');
      }
    }

    const registrationResponse = await axios.post<ApiKeyResponse>(
      `${API_BASE_URL}/register_org/register`,
      {
        ...formData,
        logo_url: logoUrl,
        industry_type: formData.industry_type
      },
      {
        timeout: 10000
      }
    );
    console.log('Full response:', registrationResponse.data);
    console.log('email :', formData.contact_email);
    console.log('org_name :', formData.org_name);
    // console.log('org_id :', registrationResponse.data.organization?.id);

    if (registrationResponse.status === 201) {
      const orgId = registrationResponse.data.id || registrationResponse.data.organization?.id;
      
      if (!orgId) {
        throw new Error('Organization ID not received from server');
      }

      console.log('email:', formData.contact_email);
      console.log('org_name:', formData.org_name);
      console.log('org_id:', orgId);
      
      // navigate('/login-org');
      // await axios.post('/send-verification-email', {
      //   email: formData.contact_email,
      //   organizationName: formData.org_name,
      //   verificationLink: `${window.location.origin}/verify-org?token=${registrationResponse.data.verification_token}`
      // });
      const emailResponse = await axios.post(
        `${API_BASE_URL}/register_org/send-verification-email`,
        {
          email: formData.contact_email,
          org_name: formData.org_name,
          org_id: orgId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (emailResponse.status !== 200) {
        throw new Error('Failed to send verification email');
      }
      setApiKey(registrationResponse.data.api_key);
      setShowApiKey(true);
      setIsLoading(false);
      return;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    setSubmitError(
      axiosError.response?.data?.message || 
      axiosError.message ||
      'Registration failed. Please try again.'
    );
  } finally {
    setIsLoading(false);
  }
};

const copyApiKey = async () => {
  try {
    await navigator.clipboard.writeText(apiKey);
    setShowToast(true);
    // Hide the toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  } catch (err) {
    console.error('Failed to copy API key: ', err);
    setSubmitError('Failed to copy API key. Please copy it manually.');
  }
};

const downloadApiKey = () => {
    const blob = new Blob([apiKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Canara-Bank-Api-Key.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


const ApiKeyDisplay = () => (
  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 relative">
    {/* Toast notification */}
    {showToast && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-md text-sm animate-fade-in-out">
        Copied to clipboard!
      </div>
    )}
    
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-medium text-gray-700">Your API Key</h3>
      <div className="flex gap-4">
      <button
        onClick={copyApiKey}
        className="text-sm text-[#1E3A8A] hover:text-[#1E40AF] flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
        Copy
      </button>

      <button
            onClick={downloadApiKey}
            className="text-sm text-[#1E3A8A] hover:text-[#1E40AF] flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
          </div>

    </div>
    <div className="p-2 bg-white rounded border border-gray-300 font-mono text-sm break-all">
      {apiKey}
    </div>
    <p className="mt-2 text-xs text-gray-500">
      Please copy and securely store this API key. You won't be able to see it again.
    </p>
    <button
      onClick={() => {
        const confirmed = window.confirm(
          "Before proceeding, please verify your email by clicking the link we sent you.\n"
        );
        if (confirmed) {
          navigate('/login-org');
        }
      }}
      className="w-full mt-4 bg-[#1E3A8A] text-white py-2 rounded-md hover:bg-[#1E40AF]"
    >
      Continue to Login
    </button>
  </div>
);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />
      
      <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
        {/* Left Side */}
        <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
          <div className="w-full h-full flex flex-col justify-between p-8">
            <span className="flex items-center space-x-2 relative">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield h-8 w-8 text-indigo-600 z-10 relative"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
                <div className="absolute inset-0 h-8 w-8 bg-indigo-600/30 rounded-full blur-sm z-0" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                PolicyVault
              </h1>
            </span>

            <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
                PolicyVault <span className="italic font-semibold text-white">NEXUS</span>
              </h1>
              <p className="text-md font-light text-white">
                Register your organization to join our secure data sharing network.
              </p>
              <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
                Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
          <div className="w-full max-w-md space-y-4 p-8">
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Register Organization</h2>
            <div className="flex mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${step >= i ? 'bg-[#1E3A8A] text-white' : 'bg-gray-300 text-gray-600'}`}
                  >
                    {i}
                  </div>
                  {i < 4 && (
                    <div className={`w-8 h-1 ${step > i ? 'bg-[#1E3A8A]' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>

            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {submitError}
              </div>
            )}

            {/* Step 1: Organization Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">OUI Registration Number*</label>
                  <input
                    type="text"
                    name="registration_number"
                    placeholder="XX:XX:XX (e.g., AC:DE:48)"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                  {errors.registration_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.registration_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization Name*</label>
                  <input
                    type="text"
                    name="org_name"
                    value={formData.org_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                  {errors.org_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.org_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo*</label>
                  {/* <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm"
                  /> */}
                  <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md shadow-sm"
                  key={formData.logo?.name || 'file-input'} // Add key to reset input
                />
                {formData.logo && (
                  <p className="mt-1 text-sm text-gray-500">
                    Selected: {formData.logo.name} ({(formData.logo.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Website URL</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                </div>

                <button
                  onClick={nextStep}
                  className="w-full bg-[#1E3A8A] text-white py-2 rounded-md hover:bg-[#1E40AF]"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email*</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                  {errors.contact_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number*</label>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                  {errors.contact_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Industry & Description */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry Type*</label>
                  <div className="mt-2 space-y-2">
                    {industryOptions.map((option) => (
                      <div key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          id={option}
                          name="industry_type"
                          value={option}
                          checked={formData.industry_type.includes(option)}
                          onChange={handleIndustryChange}
                          className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
                        />
                        <label htmlFor={option} className="ml-2 block text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.industry_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.industry_type}</p>
                  )}
                </div>

                {formData.industry_type.includes('Other') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specify Other Industry</label>
                    <input
                      type="text"
                      name="other_industry"
                      value={formData.other_industry}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                    />
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Password */}
            {step === 4 && (
              <div className="space-y-4">
                {showApiKey ? (<ApiKeyDisplay />) : 
                (<>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password*</label>
                    <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center pt-0"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password*</label>
                  <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center pt-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] rounded-md hover:bg-gray-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : 'Complete Registration'}
                  </button>
                </div>
                </>)}
              </div>
            )}
          </div>
        </div>
      </div>
      <ReCAPTCHA ref={recaptchaRef} size="invisible" sitekey={RECAPTCHA_SITE_KEY} />
    </div>
  );
};

export default OrganizationRegister;


