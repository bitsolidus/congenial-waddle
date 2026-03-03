import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, adminOnly, optionalProtect } from '../middleware/auth.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import AdminSettings from '../models/AdminSettings.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   GET /api/chat/settings
// @desc    Get chat widget settings (public)
// @access  Public
router.get('/settings', async (req, res) => {
  try {
    const settings = await AdminSettings.findOne().sort({ createdAt: -1 });
    const chatSettings = settings?.chatSettings || {
      enabled: true,
      position: 'bottom-right',
      theme: 'purple',
      greetingMessage: 'Hello! How can we help you today?',
      offlineMessage: 'We are currently offline. Please leave a message and we will get back to you soon.',
      showOnPages: {
        home: true,
        about: true,
        services: true,
        blog: true,
        news: true,
        faq: true,
        contact: true,
        dashboard: true,
        login: false,
        register: false
      },
      requireGuestInfo: true,
      autoAssign: true,
      maxWaitTime: 300,
      departments: [
        { id: 'general', name: 'General Support', enabled: true },
        { id: 'technical', name: 'Technical Support', enabled: true },
        { id: 'billing', name: 'Billing & Payments', enabled: true },
        { id: 'trading', name: 'Trading Support', enabled: true },
        { id: 'kyc', name: 'KYC & Verification', enabled: true },
        { id: 'vip', name: 'VIP Support', enabled: true }
      ],
      customization: {
        buttonColor: '#7c3aed',
        headerColor: '#7c3aed',
        bubbleColor: '#f3f4f6',
        textColor: '#1f2937',
        fontFamily: 'Inter',
        borderRadius: '12',
        widgetTitle: 'Live Support',
        widgetSubtitle: 'We typically reply in a few minutes'
      }
    };
    
    res.json({
      success: true,
      settings: chatSettings
    });
  } catch (error) {
    console.error('Get chat settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/session
// @desc    Create a new chat session (authenticated or guest)
// @access  Public
router.post('/session', optionalProtect, [
  body('subject').optional().trim(),
  body('department').optional().isIn(['general', 'technical', 'billing', 'trading', 'kyc', 'vip']),
  body('guestName').optional().trim(),
  body('guestEmail').optional().isEmail(),
  body('isGuest').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { subject, department, guestName, guestEmail, isGuest } = req.body;
    
    let sessionData = {
      subject: subject || 'General Support',
      department: department || 'general'
    };
    
    // Handle guest or authenticated user
    if (isGuest && guestName && guestEmail) {
      sessionData.guestInfo = {
        name: guestName,
        email: guestEmail,
        isGuest: true
      };
    } else if (req.user) {
      // Check if user already has an active session
      const existingSession = await ChatSession.findOne({
        userId: req.user._id,
        status: { $in: ['waiting', 'active'] }
      });
      
      if (existingSession) {
        return res.json({
          success: true,
          session: existingSession,
          message: 'Existing session found'
        });
      }
      
      sessionData.userId = req.user._id;
    } else {
      return res.status(400).json({ message: 'Either login or provide guest information' });
    }
    
    const session = await ChatSession.create(sessionData);
    
    // Create system message
    await ChatMessage.create({
      sessionId: session._id,
      senderId: req.user?._id || null,
      senderType: 'system',
      message: 'Welcome to BitSolidus Support! An agent will be with you shortly.'
    });
    
    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/session
// @desc    Get user's active chat session
// @access  Private
router.get('/session', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      userId: req.user._id,
      status: { $in: ['waiting', 'active'] }
    }).populate('agentId', 'username avatar');
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/sessions
// @desc    Get user's chat history
// @access  Private
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.user._id
    })
    .populate('agentId', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/message
// @desc    Send a message
// @access  Public (with session validation)
router.post('/message', [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('message').notEmpty().trim().withMessage('Message is required'),
  body('guestEmail').optional().isEmail(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { sessionId, message, guestEmail } = req.body;
    
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    let senderType = 'user';
    let senderId = req.user?._id || null;
    
    // Check authorization
    if (req.user) {
      // Authenticated user
      if (session.userId?.toString() === req.user._id.toString()) {
        senderType = 'user';
      } else if (session.agentId?.toString() === req.user._id.toString()) {
        senderType = 'agent';
      } else if (req.user.isAdmin) {
        senderType = 'agent';
      } else {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (session.guestInfo?.isGuest && session.guestInfo?.email === guestEmail) {
      // Guest user - verify by email
      senderType = 'user';
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const chatMessage = await ChatMessage.create({
      sessionId,
      senderId: senderId,
      senderType,
      message
    });
    
    // Update session last message time
    session.lastMessageAt = new Date();
    await session.save();
    
    res.status(201).json({
      success: true,
      message: chatMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/messages/:sessionId
// @desc    Get messages for a session
// @access  Public (with validation)
router.get('/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { guestEmail } = req.query;
    
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check authorization
    let isAuthorized = false;
    
    if (req.user) {
      // Authenticated user
      if (session.userId?.toString() === req.user._id.toString() ||
          session.agentId?.toString() === req.user._id.toString() ||
          req.user.isAdmin) {
        isAuthorized = true;
      }
    } else if (session.guestInfo?.isGuest && session.guestInfo?.email === guestEmail) {
      // Guest user
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const messages = await ChatMessage.find({ sessionId })
      .populate('senderId', 'username avatar')
      .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/session/:id/close
// @desc    Close a chat session
// @access  Private
router.put('/session/:id/close', protect, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Only user, assigned agent, or admin can close
    if (session.userId.toString() !== req.user._id.toString() && 
        session.agentId?.toString() !== req.user._id.toString() &&
        !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    session.status = 'closed';
    session.closedAt = new Date();
    await session.save();
    
    // Add system message
    await ChatMessage.create({
      sessionId: session._id,
      senderId: req.user._id,
      senderType: 'system',
      message: 'This chat session has been closed.'
    });
    
    res.json({
      success: true,
      message: 'Session closed'
    });
  } catch (error) {
    console.error('Close session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== AGENT ROUTES ====================

// @route   GET /api/chat/agent/sessions
// @desc    Get all active sessions for agents
// @access  Private (Agent/Admin)
router.get('/agent/sessions', protect, async (req, res) => {
  try {
    // Check if user is an agent or admin
    if (!req.user.isAgent && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const sessions = await ChatSession.find(query)
      .populate('userId', 'username avatar email')
      .populate('agentId', 'username avatar')
      .sort({ priority: -1, createdAt: 1 });
    
    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get agent sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/agent/session/:id/assign
// @desc    Assign session to agent (self or specific agent for admin)
// @access  Private (Agent/Admin)
router.put('/agent/session/:id/assign', protect, async (req, res) => {
  try {
    if (!req.user.isAgent && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Admin can assign to any agent, agents can only assign to themselves
    const agentId = req.body.agentId || req.user._id;
    const isTransfer = req.body.isTransfer || false;
    const transferReason = req.body.transferReason || '';
    
    // If admin is assigning to a specific agent, verify that agent exists
    if (agentId !== req.user._id.toString() && req.user.isAdmin) {
      const agent = await User.findOne({ _id: agentId, isAgent: true });
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      // Check if agent has capacity for new chats
      if (agent.activeChatCount >= agent.maxConcurrentChats) {
        return res.status(400).json({ message: 'Agent has reached maximum concurrent chats' });
      }
    }
    
    const previousAgentId = session.agentId;
    
    // Update previous agent's chat count if there was one
    if (previousAgentId && previousAgentId.toString() !== agentId.toString()) {
      await User.findByIdAndUpdate(previousAgentId, { $inc: { activeChatCount: -1 } });
      
      // Record transfer in history
      if (isTransfer) {
        session.transferHistory.push({
          fromAgentId: previousAgentId,
          toAgentId: agentId,
          transferredBy: req.user._id,
          reason: transferReason
        });
      }
      
      // Close previous assignment
      const lastAssignment = session.assignmentHistory[session.assignmentHistory.length - 1];
      if (lastAssignment) {
        lastAssignment.unassignedAt = new Date();
      }
    }
    
    // Assign to new agent
    session.agentId = agentId;
    session.status = 'active';
    
    // Add to assignment history
    session.assignmentHistory.push({
      agentId: agentId,
      assignedAt: new Date()
    });
    
    await session.save();
    
    // Update new agent's chat count
    await User.findByIdAndUpdate(agentId, { $inc: { activeChatCount: 1 } });
    
    // Get agent info for system message
    const assignedAgent = await User.findById(agentId);
    
    // Add system message
    const messageText = isTransfer && previousAgentId
      ? `Chat transferred to Agent ${assignedAgent?.firstName || assignedAgent?.username || 'Support'}. Reason: ${transferReason || 'Department transfer'}`
      : `Agent ${assignedAgent?.firstName || assignedAgent?.username || 'Support'} has joined the chat.`;
    
    await ChatMessage.create({
      sessionId: session._id,
      senderId: req.user._id,
      senderType: 'system',
      message: messageText
    });
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Assign session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/agent/stats
// @desc    Get agent chat statistics
// @access  Private (Agent/Admin)
router.get('/agent/stats', protect, async (req, res) => {
  try {
    if (!req.user.isAgent && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const waitingCount = await ChatSession.countDocuments({ status: 'waiting' });
    const activeCount = await ChatSession.countDocuments({ 
      status: 'active',
      agentId: req.user._id
    });
    const totalHandled = await ChatSession.countDocuments({
      agentId: req.user._id,
      status: 'closed'
    });
    
    res.json({
      success: true,
      stats: {
        waiting: waitingCount,
        active: activeCount,
        totalHandled
      }
    });
  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/agents/by-department
// @desc    Get agents by department
// @access  Private (Agent/Admin)
router.get('/agents/by-department', protect, async (req, res) => {
  try {
    if (!req.user.isAgent && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { department } = req.query;
    const query = { isAgent: true, isActive: true };
    if (department) query.department = department;
    
    const agents = await User.find(query)
      .select('username firstName lastName avatar department agentStatus activeChatCount maxConcurrentChats')
      .sort({ agentStatus: 1, activeChatCount: 1 });
    
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error('Get agents by department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/agent/status
// @desc    Update agent status (online, away, busy, offline)
// @access  Private (Agent)
router.put('/agent/status', protect, async (req, res) => {
  try {
    if (!req.user.isAgent && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status } = req.body;
    if (!['online', 'away', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    await User.findByIdAndUpdate(req.user._id, { agentStatus: status });
    
    res.json({
      success: true,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    console.error('Update agent status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/departments
// @desc    Get all departments with agent counts
// @access  Private
router.get('/departments', protect, async (req, res) => {
  try {
    const departments = [
      { id: 'general', name: 'General Support', description: 'General inquiries and support' },
      { id: 'technical', name: 'Technical Support', description: 'Technical issues and troubleshooting' },
      { id: 'billing', name: 'Billing & Payments', description: 'Payment and billing questions' },
      { id: 'trading', name: 'Trading Support', description: 'Trading related inquiries' },
      { id: 'kyc', name: 'KYC & Verification', description: 'Identity verification support' },
      { id: 'vip', name: 'VIP Support', description: 'Priority support for VIP users' }
    ];
    
    // Get agent counts per department
    const agentCounts = await User.aggregate([
      { $match: { isAgent: true, isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    // Get waiting chats per department
    const waitingCounts = await ChatSession.aggregate([
      { $match: { status: 'waiting' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    
    const departmentsWithCounts = departments.map(dept => ({
      ...dept,
      agentCount: agentCounts.find(a => a._id === dept.id)?.count || 0,
      waitingCount: waitingCounts.find(w => w._id === dept.id)?.count || 0
    }));
    
    res.json({
      success: true,
      departments: departmentsWithCounts
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
