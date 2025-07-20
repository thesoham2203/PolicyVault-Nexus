import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import axios, { AxiosError } from 'axios';

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

    const registrationResponse = await axios.post(
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

    if (registrationResponse.status === 201) {
      navigate('/login-org');
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password*</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A]"
                  />
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