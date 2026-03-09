import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, Ban, CheckCircle, Edit2, ExternalLink, Wallet, X, User, Mail, Phone, MapPin, Calendar, DollarSign, Shield, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { convertFromUSD, formatCurrencyWithSymbol } from '../../utils/currency';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = useCallback(async (page = 1, search = '', status = '') => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const response = await axios.get(`/api/admin/users?${params.toString()}`);
      console.log('Users fetched:', response.data);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalUsers(response.data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch users:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUsers(1, searchTerm, statusFilter);
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, searchTerm, statusFilter);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage, searchTerm, statusFilter);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    fetchUsers(1, searchTerm, status);
  };

  const handleFreezeUser = async (userId) => {
    try {
      await axios.post(`/api/admin/user/${userId}/freeze`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to freeze user');
    }
  };

  const handleViewDetails = (user) => {
    setViewingUser(user);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="admin-user-search"
              name="userSearch"
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full md:w-80"
            />
          </form>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Frozen</option>
          </select>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            Total: {totalUsers} users
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                <th className="pb-3 font-medium">Balance</th>
                <th className="pb-3 font-medium">Tier</th>
                <th className="pb-3 font-medium">KYC Status</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 dark:border-crypto-border/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4">
                      <Link to={`/admin/users/${user._id}`} className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white hover:text-purple-600 transition-colors">{user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 text-gray-900 dark:text-white">
                      {(() => {
                        const balanceUSD = typeof user.balance === 'object' && user.balance !== null
                          ? (user.balance.USDT || 0) + (user.balance.BTC || 0) + (user.balance.ETH || 0) + (user.balance.BNB || 0)
                          : user.balance || 0;
                        const userCurrency = user.settings?.currency || 'USD';
                        return userCurrency !== 'USD' 
                          ? formatCurrencyWithSymbol(convertFromUSD(balanceUSD, userCurrency), userCurrency)
                          : formatCurrency(balanceUSD);
                      })()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                        user.tier === 'vip' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                        user.tier === 'gold' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        user.tier === 'silver' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                        'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                      }`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                        user.kycStatus === 'verified' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        user.kycStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {user.kycStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`} title={user.isEmailVerified ? 'Verified' : 'Not Verified'}></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Frozen'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Manage User"
                        >
                          <Wallet className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleFreezeUser(user._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive 
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.isActive ? 'Freeze Account' : 'Unfreeze Account'}
                        >
                          {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-crypto-bg rounded-lg"
                          title="Edit User"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-crypto-border">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showDetailsModal && viewingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                    {viewingUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{viewingUser.username}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{viewingUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        viewingUser.isActive 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {viewingUser.isActive ? 'Active' : 'Frozen'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                        viewingUser.kycStatus === 'verified' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        viewingUser.kycStatus === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        KYC: {viewingUser.kycStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-xs">Full Name</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viewingUser.name || viewingUser.kycData?.firstName + ' ' + viewingUser.kycData?.lastName || 'Not provided'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <Mail className="h-4 w-4" />
                        <span className="text-xs">Email Status</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${viewingUser.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {viewingUser.isEmailVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs">Phone Number</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viewingUser.kycData?.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">Date of Birth</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viewingUser.kycData?.dateOfBirth ? formatDate(viewingUser.kycData.dateOfBirth) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Location
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">Country</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viewingUser.kycData?.country || 'Not provided'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">City</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viewingUser.kycData?.city || 'Not provided'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 col-span-2">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs">Address</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viewingUser.kycData?.address || 'Not provided'}
                        {viewingUser.kycData?.postalCode && `, ${viewingUser.kycData.postalCode}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">Total Balance ({viewingUser.settings?.currency || 'USD'})</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const balanceUSD = typeof viewingUser.balance === 'object' && viewingUser.balance !== null
                            ? (viewingUser.balance.USDT || 0) + (viewingUser.balance.BTC || 0) + (viewingUser.balance.ETH || 0) + (viewingUser.balance.BNB || 0)
                            : viewingUser.balance || 0;
                          const userCurrency = viewingUser.settings?.currency || 'USD';
                          return userCurrency !== 'USD' 
                            ? formatCurrencyWithSymbol(convertFromUSD(balanceUSD, userCurrency), userCurrency)
                            : formatCurrency(balanceUSD);
                        })()}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Account Tier</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {viewingUser.tier}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">Joined Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(viewingUser.createdAt)}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">Last Login</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {viewingUser.lastLogin ? formatDate(viewingUser.lastLogin) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ID Information (if KYC submitted) */}
                {viewingUser.kycData?.idType && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      ID Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {viewingUser.kycData.idType.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Number</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {viewingUser.kycData.idNumber || 'Not provided'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nationality</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {viewingUser.kycData.nationality || 'Not provided'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">KYC Submitted</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {viewingUser.kycData.submittedAt ? formatDate(viewingUser.kycData.submittedAt) : 'Not submitted'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <Link
                  to={`/admin/users/${viewingUser._id}`}
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Manage User
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
