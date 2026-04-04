import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  ChevronLeft,
  Download,
  Clock
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import axios from 'axios';

const AdminKYC = () => {
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchKYCSubmissions();
  }, [filter]);

  const fetchKYCSubmissions = async () => {
    try {
      setIsLoading(true);
      const endpoint = filter === 'pending' ? '/api/admin/kyc/pending' : '/api/admin/kyc/all';
      const response = await axios.get(`${endpoint}?status=${filter}`);
      setKycSubmissions(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch KYC submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  };

  const handleApprove = async (userId) => {
    try {
      await axios.put(`/api/admin/kyc/${userId}/approve`);
      fetchKYCSubmissions();
      if (showDetailModal) {
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error('Failed to approve KYC:', err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.put(`/api/admin/kyc/${userId}/reject`, { reason: rejectionReason });
      setRejectionReason('');
      setShowRejectModal(false);
      fetchKYCSubmissions();
      if (showDetailModal) {
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error('Failed to reject KYC:', err);
    }
  };

  const filteredSubmissions = kycSubmissions.filter(sub => 
    sub.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.kycData?.firstName && sub.kycData.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sub.kycData?.lastName && sub.kycData.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getIDTypeLabel = (type) => {
    switch (type) {
      case 'passport': return 'Passport';
      case 'drivers_license': return "Driver's License";
      case 'national_id': return 'National ID';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KYC Verification</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and verify user identity documents</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending</p>
            <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
              {kycSubmissions.filter(s => s.kycStatus === 'pending').length}
            </p>
          </div>
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400">Verified</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {kycSubmissions.filter(s => s.kycStatus === 'verified').length}
            </p>
          </div>
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400">Rejected</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {kycSubmissions.filter(s => s.kycStatus === 'rejected').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* KYC Submissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-crypto-border">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Full Name</th>
                <th className="pb-3 font-medium">ID Type</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="border-b border-gray-100 dark:border-crypto-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                          {submission.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{submission.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{submission.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-900 dark:text-white">
                      {submission.kycData?.firstName && submission.kycData?.lastName
                        ? `${submission.kycData.firstName} ${submission.kycData.lastName}`
                        : 'N/A'}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">
                      {submission.kycData?.idType 
                        ? getIDTypeLabel(submission.kycData.idType)
                        : 'N/A'}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">
                      {submission.kycData?.submittedAt 
                        ? formatDate(submission.kycData.submittedAt)
                        : 'N/A'}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(submission.kycStatus)}`}>
                        {submission.kycStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(submission)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {submission.kycStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(submission._id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowRejectModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No KYC submissions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">KYC Details</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(selectedSubmission.kycStatus)}`}>
                  {selectedSubmission.kycStatus}
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">First Name</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.firstName || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Last Name</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.lastName || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Date of Birth</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.dateOfBirth 
                            ? formatDate(selectedSubmission.kycData.dateOfBirth)
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Nationality</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.nationality || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Address Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Address</span>
                        <span className="text-gray-900 dark:text-white font-medium text-right">
                          {selectedSubmission.kycData?.address || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">City</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.city || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">State/Province</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.state || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Country</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.country || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Postal Code</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.postalCode || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Phone Number</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.phoneNumber || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Email</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      ID Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">ID Type</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {getIDTypeLabel(selectedSubmission.kycData?.idType)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">ID Number</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {selectedSubmission.kycData?.idNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submitted Documents</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedSubmission.kycData?.idFrontImage && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Front</p>
                        <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <img 
                            src={selectedSubmission.kycData.idFrontImage} 
                            alt="ID Front"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                    {selectedSubmission.kycData?.idBackImage && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Back</p>
                        <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <img 
                            src={selectedSubmission.kycData.idBackImage} 
                            alt="ID Back"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                    {selectedSubmission.kycData?.selfieImage && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Selfie</p>
                        <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <img 
                            src={selectedSubmission.kycData.selfieImage} 
                            alt="Selfie"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                    {selectedSubmission.kycData?.proofOfAddressImage && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Proof of Address</p>
                        <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <img 
                            src={selectedSubmission.kycData.proofOfAddressImage} 
                            alt="Proof of Address"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Info */}
                {selectedSubmission.kycStatus !== 'pending' && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Review Information
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reviewed at: {selectedSubmission.kycData?.reviewedAt 
                        ? formatDate(selectedSubmission.kycData.reviewedAt)
                        : 'N/A'}
                    </p>
                    {selectedSubmission.kycData?.rejectionReason && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Rejection Reason: {selectedSubmission.kycData.rejectionReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {selectedSubmission.kycStatus === 'pending' && (
                  <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleApprove(selectedSubmission._id)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Approve KYC
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject KYC
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                Reject KYC
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this KYC submission.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="input-field w-full h-32 mb-4 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedSubmission._id)}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminKYC;
