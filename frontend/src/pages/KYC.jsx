import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Camera,
  X,
  Loader2,
  FileCheck,
  Image as ImageIcon,
  Percent
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchProfile } from '../store/authSlice';

const KYC = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState({
    idFrontImage: 0,
    idBackImage: 0,
    selfieImage: 0,
    proofOfAddressImage: 0,
  });
  const [uploadingFiles, setUploadingFiles] = useState({
    idFrontImage: false,
    idBackImage: false,
    selfieImage: false,
    proofOfAddressImage: false,
  });
  const [fileSizes, setFileSizes] = useState({
    idFrontImage: null,
    idBackImage: null,
    selfieImage: null,
    proofOfAddressImage: null,
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phoneNumber: '',
    idType: 'passport',
    idNumber: '',
    idFrontImage: null,
    idBackImage: null,
    selfieImage: null,
    proofOfAddressImage: null,
  });

  const [previewUrls, setPreviewUrls] = useState({
    idFrontImage: null,
    idBackImage: null,
    selfieImage: null,
    proofOfAddressImage: null,
  });

  // Load data from user profile or existing KYC data
  useEffect(() => {
    if (user) {
      // Check if user has submitted KYC before and it was rejected
      if (user.kycStatus === 'rejected') {
        setHasSubmittedBefore(true);
      } else if (user.kycStatus === 'pending' || user.kycStatus === 'verified') {
        setHasSubmittedBefore(true);
      }

      const profileData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        phoneNumber: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
      };

      const kycData = user.kycData ? {
        ...user.kycData,
        dateOfBirth: user.kycData.dateOfBirth ? new Date(user.kycData.dateOfBirth).toISOString().split('T')[0] : '',
      } : {};

      // Merge: KYC data takes precedence over profile data
      setFormData(prev => ({
        ...prev,
        ...profileData,
        ...kycData,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation functions
  const isStep1Valid = () => {
    return formData.firstName.trim() &&
           formData.lastName.trim() &&
           formData.gender &&
           formData.dateOfBirth &&
           formData.nationality.trim() &&
           formData.phoneNumber.trim();
  };

  const isStep2Valid = () => {
    return formData.address.trim() &&
           formData.city.trim() &&
           formData.country.trim() &&
           formData.postalCode.trim();
  };

  const isStep3Valid = () => {
    return formData.phoneNumber.trim() &&
           formData.idType &&
           formData.idNumber.trim();
  };

  const isStep4Valid = () => {
    // Passport only needs one document (idFrontImage)
    if (formData.idType === 'passport') {
      return formData.idFrontImage &&
             formData.selfieImage &&
             formData.proofOfAddressImage;
    }
    // Other IDs need both front and back
    return formData.idFrontImage &&
           formData.idBackImage &&
           formData.selfieImage &&
           formData.proofOfAddressImage;
  };

  // Helper function to get ID type label
  const getIDTypeLabel = (type) => {
    switch (type) {
      case 'passport': return 'Passport';
      case 'drivers_license': return "Driver's License";
      case 'national_id': return 'National ID Card';
      case 'residence_permit': return 'Residence Permit';
      default: return '';
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return isStep3Valid();
      case 4: return isStep4Valid();
      default: return false;
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Set file size
      setFileSizes(prev => ({ ...prev, [fieldName]: file.size }));
      
      // Start upload simulation
      setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
      setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random increment between 5-20%
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
        }
        setUploadProgress(prev => ({ ...prev, [fieldName]: Math.min(progress, 100) }));
      }, 200);
      
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [fieldName]: url }));
    }
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    if (previewUrls[fieldName]) {
      URL.revokeObjectURL(previewUrls[fieldName]);
      setPreviewUrls(prev => ({ ...prev, [fieldName]: null }));
    }
    // Clear upload progress
    setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
    setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    setFileSizes(prev => ({ ...prev, [fieldName]: null }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key.includes('Image') && formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      await axios.post('/api/user/kyc/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitSuccess(true);
      setHasSubmittedBefore(true);
      dispatch(fetchProfile());
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit KYC. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const getStatusBadge = () => {
    switch (user?.kycStatus) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Pending Review</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            <X className="h-5 w-5" />
            <span className="font-medium">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-lg">
            <FileText className="h-5 w-5" />
            <span className="font-medium">Not Submitted</span>
          </div>
        );
    }
  };

  // Show loading state while auth is initializing
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-12"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            KYC Submitted Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your documents have been submitted for review. We'll notify you once the verification is complete.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Back to KYC Page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">KYC Verification</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your identity verification to unlock full platform features
        </p>
      </div>

      {/* Status Card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Verification Status</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.kycStatus === 'verified' 
                ? 'Your identity has been verified. You have full access to all features.'
                : user?.kycStatus === 'pending'
                ? 'Your documents are under review. This usually takes 1-2 business days.'
                : user?.kycStatus === 'rejected'
                ? `Your KYC was rejected. Reason: ${user?.kycData?.rejectionReason || 'Please contact support'}`
                : 'Complete the KYC process to unlock withdrawals and higher limits.'}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Show message if already submitted and pending/verified (not rejected) */}
      {hasSubmittedBefore && user?.kycStatus !== 'rejected' && user?.kycStatus !== 'verified' && (
        <div className="card text-center py-12">
          <AlertCircle className="h-16 w-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            KYC Under Review
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your KYC submission is currently being reviewed by our team. You cannot submit a new application until the current one has been processed.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            If you believe this is an error or need urgent assistance, please contact our support team.
          </p>
        </div>
      )}

      {/* Show verified user information */}
      {user?.kycStatus === 'verified' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Verified Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.kycData?.firstName} {user?.kycData?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
              <p className="text-gray-900 dark:text-white font-medium capitalize">
                {user?.kycData?.gender?.replace(/_/g, ' ') || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.kycData?.dateOfBirth ? new Date(user.kycData.dateOfBirth).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nationality</p>
              <p className="text-gray-900 dark:text-white font-medium">{user?.kycData?.nationality || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
              <p className="text-gray-900 dark:text-white font-medium">{user?.kycData?.phoneNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID Type</p>
              <p className="text-gray-900 dark:text-white font-medium capitalize">
                {user?.kycData?.idType?.replace(/_/g, ' ') || 'N/A'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.kycData?.address ? 
                  `${user.kycData.address}, ${user.kycData.city}, ${user.kycData.country} ${user.kycData.postalCode || ''}` : 
                  'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {(!hasSubmittedBefore || user?.kycStatus === 'rejected') && (
        <>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-24 h-1 mx-2 ${
                      currentStep > step 
                        ? 'bg-purple-600' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Personal Info</span>
              <span>Address</span>
              <span>Contact</span>
              <span>Documents</span>
            </div>
          </div>

          {/* Form Steps */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {submitError}
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nationality *
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="Enter your nationality"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address & Country */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address & Country Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                        <option value="NL">Netherlands</option>
                        <option value="SE">Sweden</option>
                        <option value="NO">Norway</option>
                        <option value="DK">Denmark</option>
                        <option value="FI">Finland</option>
                        <option value="PL">Poland</option>
                        <option value="BR">Brazil</option>
                        <option value="MX">Mexico</option>
                        <option value="AR">Argentina</option>
                        <option value="CL">Chile</option>
                        <option value="CO">Colombia</option>
                        <option value="PE">Peru</option>
                        <option value="IN">India</option>
                        <option value="CN">China</option>
                        <option value="JP">Japan</option>
                        <option value="KR">South Korea</option>
                        <option value="SG">Singapore</option>
                        <option value="MY">Malaysia</option>
                        <option value="TH">Thailand</option>
                        <option value="ID">Indonesia</option>
                        <option value="PH">Philippines</option>
                        <option value="VN">Vietnam</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="ZA">South Africa</option>
                        <option value="NG">Nigeria</option>
                        <option value="KE">Kenya</option>
                        <option value="EG">Egypt</option>
                        <option value="NZ">New Zealand</option>
                        <option value="RU">Russia</option>
                        <option value="UA">Ukraine</option>
                        <option value="TR">Turkey</option>
                        <option value="IL">Israel</option>
                        <option value="CH">Switzerland</option>
                        <option value="AT">Austria</option>
                        <option value="BE">Belgium</option>
                        <option value="IE">Ireland</option>
                        <option value="PT">Portugal</option>
                        <option value="GR">Greece</option>
                        <option value="CZ">Czech Republic</option>
                        <option value="HU">Hungary</option>
                        <option value="RO">Romania</option>
                        <option value="BG">Bulgaria</option>
                        <option value="HR">Croatia</option>
                        <option value="SI">Slovenia</option>
                        <option value="SK">Slovakia</option>
                        <option value="LT">Lithuania</option>
                        <option value="LV">Latvia</option>
                        <option value="EE">Estonia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ID Type *
                      </label>
                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        required
                      >
                        <option value="">Select ID Type</option>
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="national_id">National ID Card</option>
                        <option value="residence_permit">Residence Permit</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="Enter your street address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="State or Province"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="input-field w-full"
                        placeholder="Postal Code"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact & ID Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact & ID Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      placeholder={`Enter your ${getIDTypeLabel(formData.idType)} number`}
                      required
                    />
                  </div>
                  {formData.idType && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        Document Requirements for {getIDTypeLabel(formData.idType)}
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        {formData.idType === 'passport' && (
                          <>
                            <li>✓ Passport bio page (photo and personal details)</li>
                            <li>✓ Clear, color image</li>
                            <li>✓ All four corners visible</li>
                            <li>✓ No glare or reflections</li>
                          </>
                        )}
                        {formData.idType === 'drivers_license' && (
                          <>
                            <li>✓ Front side of driver's license</li>
                            <li>✓ Back side of driver's license</li>
                            <li>✓ Both sides must be uploaded</li>
                            <li>✓ Must be current and valid</li>
                          </>
                        )}
                        {formData.idType === 'national_id' && (
                          <>
                            <li>✓ Front side of national ID card</li>
                            <li>✓ Back side of national ID card</li>
                            <li>✓ Government-issued ID only</li>
                            <li>✓ Must be current and valid</li>
                          </>
                        )}
                        {formData.idType === 'residence_permit' && (
                          <>
                            <li>✓ Front side of residence permit</li>
                            <li>✓ Back side of residence permit</li>
                            <li>✓ Must be issued by government</li>
                            <li>✓ Must be current and valid</li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Front - Label changes based on ID type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {formData.idType === 'passport' ? 'Passport Bio Page *' :
                       formData.idType === 'drivers_license' ? "Driver's License Front *" :
                       formData.idType === 'national_id' ? 'National ID Front *' :
                       formData.idType === 'residence_permit' ? 'Residence Permit Front *' :
                       'ID Front Side *'}
                    </label>
                    <div className="relative">
                      {previewUrls.idFrontImage ? (
                        <div className="relative aspect-[3/2] rounded-lg overflow-hidden">
                          <img 
                            src={previewUrls.idFrontImage} 
                            alt="ID Front" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile('idFrontImage')}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          
                          {/* Upload Progress Overlay */}
                          <AnimatePresence>
                            {uploadingFiles.idFrontImage && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center"
                              >
                                <div className="w-3/4">
                                  <div className="flex items-center justify-between text-white text-xs mb-1">
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Uploading...
                                    </span>
                                    <span>{Math.round(uploadProgress.idFrontImage)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress.idFrontImage}%` }}
                                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-[3/2] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors relative">
                          {formData.idType === 'passport' ? <Upload className="h-8 w-8 text-gray-400 mb-2" /> : <Upload className="h-8 w-8 text-gray-400 mb-2" />}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formData.idType === 'passport' ? 'Upload Passport Page' : 'Upload Front Side'}
                          </span>
                          {fileSizes.idFrontImage && (
                            <span className="text-xs text-gray-400 mt-1">
                              {(fileSizes.idFrontImage / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'idFrontImage')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* ID Back - Only shown for non-passport IDs */}
                  {formData.idType !== 'passport' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {formData.idType === 'drivers_license' ? "Driver's License Back *" :
                         formData.idType === 'national_id' ? 'National ID Back *' :
                         formData.idType === 'residence_permit' ? 'Residence Permit Back *' :
                         'ID Back Side *'}
                      </label>
                    <div className="relative">
                      {previewUrls.idBackImage ? (
                        <div className="relative aspect-[3/2] rounded-lg overflow-hidden">
                          <img 
                            src={previewUrls.idBackImage} 
                            alt="ID Back" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile('idBackImage')}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          
                          {/* Upload Progress Overlay */}
                          <AnimatePresence>
                            {uploadingFiles.idBackImage && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center"
                              >
                                <div className="w-3/4">
                                  <div className="flex items-center justify-between text-white text-xs mb-1">
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Uploading...
                                    </span>
                                    <span>{Math.round(uploadProgress.idBackImage)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress.idBackImage}%` }}
                                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-[3/2] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors relative">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Upload Back Side</span>
                          {fileSizes.idBackImage && (
                            <span className="text-xs text-gray-400 mt-1">
                              {(fileSizes.idBackImage / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'idBackImage')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Selfie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selfie with ID Document *
                    </label>
                    <div className="relative">
                      {previewUrls.selfieImage ? (
                        <div className="relative aspect-[3/2] rounded-lg overflow-hidden">
                          <img 
                            src={previewUrls.selfieImage} 
                            alt="Selfie" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile('selfieImage')}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          
                          {/* Upload Progress Overlay */}
                          <AnimatePresence>
                            {uploadingFiles.selfieImage && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center"
                              >
                                <div className="w-3/4">
                                  <div className="flex items-center justify-between text-white text-xs mb-1">
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Uploading...
                                    </span>
                                    <span>{Math.round(uploadProgress.selfieImage)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress.selfieImage}%` }}
                                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-[3/2] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors relative">
                          <Camera className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Upload Selfie Holding ID</span>
                          {fileSizes.selfieImage && (
                            <span className="text-xs text-gray-400 mt-1">
                              {(fileSizes.selfieImage / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'selfieImage')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Proof of Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Proof of Address *
                    </label>
                    <div className="relative">
                      {previewUrls.proofOfAddressImage ? (
                        <div className="relative aspect-[3/2] rounded-lg overflow-hidden">
                          <img 
                            src={previewUrls.proofOfAddressImage} 
                            alt="Proof of Address" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile('proofOfAddressImage')}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          
                          {/* Upload Progress Overlay */}
                          <AnimatePresence>
                            {uploadingFiles.proofOfAddressImage && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center"
                              >
                                <div className="w-3/4">
                                  <div className="flex items-center justify-between text-white text-xs mb-1">
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Uploading...
                                    </span>
                                    <span>{Math.round(uploadProgress.proofOfAddressImage)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${uploadProgress.proofOfAddressImage}%` }}
                                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-[3/2] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                          <FileText className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Upload Proof of Address</span>
                          {fileSizes.proofOfAddressImage && (
                            <span className="text-xs text-gray-400 mt-1">
                              {(fileSizes.proofOfAddressImage / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'proofOfAddressImage')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Utility bill or bank statement (last 3 months)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceedToNextStep()}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceedToNextStep()}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Submit KYC
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default KYC;
