const ActivityLog = require('../models/ActivityLog');
const CodeDocument = require('../models/CodeDocument');
const RoomMember = require('../models/RoomMember');

// Get activity logs for document
exports.getActivityLogs = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user.userId;

    // Get document
    const document = await CodeDocument.findById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if user has access
    const member = await RoomMember.findOne({
      user: userId,
      room: document.room,
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this document',
      });
    }

    // Get logs
    const logs = await ActivityLog.find({ document: docId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get activity logs',
    });
  }
};

// Log activity
exports.logActivity = async (req, res) => {
  try {
    const { docId } = req.params;
    const { action, description, changes } = req.body;
    const userId = req.user.userId;

    // Get document
    const document = await CodeDocument.findById(docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if user has access
    const member = await RoomMember.findOne({
      user: userId,
      room: document.room,
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this document',
      });
    }

    // Create log
    const log = new ActivityLog({
      document: docId,
      user: userId,
      action: action || 'edited',
      description: description || '',
      changes: changes || {},
    });
    await log.save();
    await log.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: log,
    });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to log activity',
    });
  }
};
