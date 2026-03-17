import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Users,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  User,
  X,
  CheckCircle,
  AlertCircle,
  Camera
} from 'lucide-react';

const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: 'general',
    maxConcurrentChats: 5
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Predefined avatars
  const predefinedAvatars = [
    '/avatars/agent1.png',
    '/avatars/agent2.png',
    '/avatars/agent3.png',
    '/avatars/agent4.png',
    '/avatars/agent5.png',
    '/avatars/agent6.png',
    '/avatars/agent7.png',
    '/avatars/agent8.png',
  ];

  // Departments
  const departments = [
    { id: 'general', name: 'General Support', color: 'bg-blue-500' },
    { id: 'technical', name: 'Technical Support', color: 'bg-purple-500' },
    { id: 'billing', name: 'Billing & Payments', color: 'bg-green-500' },
    { id: 'trading', name: 'Trading Support', color: 'bg-orange-500' },
    { id: 'kyc', name: 'KYC & Verification', color: 'bg-pink-500' },
    { id: 'vip', name: 'VIP Support', color: 'bg-yellow-500' }
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get('/api/admin/agents');
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Fetch agents error:', error);
      showNotification('Failed to load agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setSelectedAvatar(null);
    }
  };

  const handlePredefinedAvatarSelect = (avatarPath) => {
    setSelectedAvatar(avatarPath);
    setAvatarPreview(avatarPath);
    setAvatar(null);
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setFormData({
      username: agent.username,
      email: agent.email,
      password: '',
      firstName: agent.firstName || '',
      lastName: agent.lastName || '',
      department: agent.department || 'general',
      maxConcurrentChats: agent.maxConcurrentChats || 5
    });
    setAvatarPreview(agent.avatar || null);
    setSelectedAvatar(agent.avatar || null);
    setAvatar(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('maxConcurrentChats', formData.maxConcurrentChats);
      
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      } else if (selectedAvatar) {
        formDataToSend.append('avatar', selectedAvatar);
      }

      await axios.put(`/api/admin/agents/${editingAgent._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('Agent updated successfully', 'success');
      setShowEditModal(false);
      setEditingAgent(null);
      setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', department: 'general', maxConcurrentChats: 5 });
      setAvatar(null);
      setAvatarPreview(null);
      setSelectedAvatar(null);
      fetchAgents();
    } catch (error) {
      console.error('Update agent error:', error);
      showNotification(error.response?.data?.message || 'Failed to update agent', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('maxConcurrentChats', formData.maxConcurrentChats);
      
      // Handle avatar - uploaded file takes precedence over predefined avatar
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      } else if (selectedAvatar) {
        formDataToSend.append('avatar', selectedAvatar);
      }

      await axios.post('/api/admin/agents', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('Agent created successfully', 'success');
      setShowAddModal(false);
      setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', department: 'general', maxConcurrentChats: 5 });
      setAvatar(null);
      setAvatarPreview(null);
      setSelectedAvatar(null);
      fetchAgents();
    } catch (error) {
      console.error('Create agent error:', error);
      showNotification(error.response?.data?.message || 'Failed to create agent', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleAgentStatus = async (agentId, currentStatus) => {
    try {
      await axios.put(`/api/admin/agents/${agentId}`, {
        isActive: !currentStatus
      });
      showNotification('Agent status updated', 'success');
      fetchAgents();
    } catch (error) {
      console.error('Update agent error:', error);
      showNotification('Failed to update agent', 'error');
    }
  };

  const removeAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to remove this agent?')) return;
    try {
      await axios.delete(`/api/admin/agents/${agentId}`);
      showNotification('Agent removed successfully', 'success');
      fetchAgents();
    } catch (error) {
      console.error('Remove agent error:', error);
      showNotification('Failed to remove agent', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      return `${baseUrl}${avatar}`;
    }
    return `/default-avatar.svg`;
  };

  // Helper function to get department name
  const getDepartmentName = (deptId) => {
    return departments.find(d => d.id === deptId)?.name || 'General Support';
  };

  // Helper function to get department color
  const getDepartmentColor = (deptId) => {
    return departments.find(d => d.id === deptId)?.color || 'bg-gray-500';
  };

  const filteredAgents = agents.filter(agent =>
    agent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Agents</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your live chat support team</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agents.filter(a => a.isActive).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {agents.filter(a => !a.isActive).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Agents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search agents..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Agents List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No agents found matching your search' : 'No agents yet. Create your first agent!'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4 font-medium">Agent</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Chats</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredAgents.map((agent) => (
                <tr key={agent._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center overflow-hidden">
                        {agent.avatar ? (
                          <img 
                            src={getAvatarUrl(agent.avatar)} 
                            alt={agent.username} 
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <User className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {agent.firstName} {agent.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{agent.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${getDepartmentColor(agent.department)}`}>
                      {getDepartmentName(agent.department)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleAgentStatus(agent._id, agent.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                          agent.isActive
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </button>
                      {agent.isActive && (
                        <span className={`text-xs ${
                          agent.agentStatus === 'online' ? 'text-green-600' :
                          agent.agentStatus === 'busy' ? 'text-orange-600' :
                          agent.agentStatus === 'away' ? 'text-yellow-600' :
                          'text-gray-500'
                        }`}>
                          ● {agent.agentStatus || 'offline'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <span className="text-sm">
                      {agent.activeChatCount || 0} / {agent.maxConcurrentChats || 5}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(agent)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit Agent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeAgent(agent._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remove Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Agent Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Agent</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-purple-600" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Predefined Avatars */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or choose an avatar
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedAvatars.map((avatarPath, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePredefinedAvatarSelect(avatarPath)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                          selectedAvatar === avatarPath
                            ? 'border-purple-600 ring-2 ring-purple-600'
                            : 'border-gray-200 hover:border-purple-400'
                        }`}
                      >
                        <img
                          src={avatarPath}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-avatar.svg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {formLoading ? 'Creating...' : 'Create Agent'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Agent Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Agent</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-purple-600" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Predefined Avatars */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or choose an avatar
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedAvatars.map((avatarPath, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePredefinedAvatarSelect(avatarPath)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                          selectedAvatar === avatarPath
                            ? 'border-purple-600 ring-2 ring-purple-600'
                            : 'border-gray-200 hover:border-purple-400'
                        }`}
                      >
                        <img
                          src={avatarPath}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/default-avatar.svg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAgents;
