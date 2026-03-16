const crypto = require('crypto');
const Room = require('../models/Room');
const RoomMember = require('../models/RoomMember');
const User = require('../models/User');
const CodeDocument = require('../models/CodeDocument');

// In-memory share-link registry scoped per backend process.
const shareLinks = new Map();

// Generate a unique share link/invite code
function generateInviteCode() {
  return crypto.randomBytes(16).toString('hex');
}

// Send invite to a user
exports.sendInvite = async (req, res) => {
  try {
    const { email, docId, role = 'editor' } = req.body;
    const senderId = req.user.userId;

    if (!email || !docId) {
      return res.status(400).json({
        success: false,
        message: 'Email and document ID are required',
      });
    }

    // Get the document
    const document = await CodeDocument.findById(docId).populate('room');
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if sender has permission to share
    const senderMember = await RoomMember.findOne({
      user: senderId,
      room: document.room._id,
      isActive: true,
    });
    if (!senderMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to share this document',
      });
    }

    // Find user by email
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user membership already exists (active or inactive).
    const existingMember = await RoomMember.findOne({
      user: targetUser._id,
      room: document.room._id,
    });

    if (existingMember && existingMember.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this document',
      });
    }

    let savedMember = existingMember;
    if (existingMember && !existingMember.isActive) {
      existingMember.isActive = true;
      existingMember.role = role;
      existingMember.invitedBy = senderId;
      existingMember.invitedAt = new Date();
      await existingMember.save();
    } else {
      // Add user to room
      savedMember = new RoomMember({
        user: targetUser._id,
        room: document.room._id,
        role: role,
        invitedBy: senderId,
        invitedAt: new Date(),
      });
      await savedMember.save();

      // Add to room members list
      document.room.members.push(savedMember._id);
      await document.room.save();
    }

    res.status(201).json({
      success: true,
      message: `Invite sent to ${email}`,
      data: {
        inviteId: savedMember._id,
        email,
        role,
        createdAt: savedMember.invitedAt,
      },
    });
  } catch (error) {
    console.error('Send invite error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send invite',
    });
  }
};

// Generate a shareable link for a document
exports.generateShareLink = async (req, res) => {
  try {
    const { docId, expiresIn = 7 } = req.body; // expiresIn in days
    const userId = req.user.userId;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
    }

    // Get the document
    const document = await CodeDocument.findById(docId).populate('room');
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if user has permission to share
    const userMember = await RoomMember.findOne({
      user: userId,
      room: document.room._id,
      isActive: true,
    });
    if (!userMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to share this document',
      });
    }

    // Generate invite code
    const inviteCode = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    // Store the share link info (in real app, would use a separate model)
    const shareLink = {
      code: inviteCode,
      docId,
      roomId: document.room._id,
      createdBy: userId,
      createdAt: new Date(),
      expiresAt,
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/editor/${docId}?invite=${inviteCode}`,
    };

    shareLinks.set(inviteCode, shareLink);

    // For now, storing in room description or a cache
    // In production, would use a separate ShareLink model
    res.status(201).json({
      success: true,
      message: 'Share link generated',
      data: {
        code: inviteCode,
        url: shareLink.url,
        expiresAt,
        shortUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${inviteCode}`,
      },
    });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate share link',
    });
  }
};

// Join a room using an invite code
exports.joinWithInviteCode = async (req, res) => {
  try {
    const { code, docId } = req.body;
    const userId = req.user.userId;

    if (!code || !docId) {
      return res.status(400).json({
        success: false,
        message: 'Invite code and document ID are required',
      });
    }

    const shareLink = shareLinks.get(code);
    if (!shareLink) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invite code',
      });
    }

    if (String(shareLink.docId) !== String(docId)) {
      return res.status(400).json({
        success: false,
        message: 'Invite code does not match this document',
      });
    }

    if (new Date(shareLink.expiresAt).getTime() < Date.now()) {
      shareLinks.delete(code);
      return res.status(400).json({
        success: false,
        message: 'Invite code has expired',
      });
    }

    // Get the document
    const document = await CodeDocument.findById(docId).populate('room');
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if user is already a member
    const existingMember = await RoomMember.findOne({
      user: userId,
      room: document.room._id,
    });

    if (existingMember) {
      if (existingMember.isActive) {
        return res.status(400).json({
          success: false,
          message: 'You are already a member of this document',
        });
      }

      existingMember.isActive = true;
      existingMember.role = 'editor';
      existingMember.joinedViaInvite = code;
      existingMember.joinedAt = new Date();
      await existingMember.save();

      return res.status(200).json({
        success: true,
        message: 'Access restored successfully',
        data: {
          roomId: document.room._id,
          docId,
          role: 'editor',
        },
      });
    }

    // Add user to room with editor role.
    const newMember = new RoomMember({
      user: userId,
      room: document.room._id,
      role: 'editor',
      joinedViaInvite: code,
      joinedAt: new Date(),
    });
    await newMember.save();

    // Add to room members list
    document.room.members.push(newMember._id);
    await document.room.save();

    res.status(201).json({
      success: true,
      message: 'Successfully joined the document',
      data: {
        roomId: document.room._id,
        docId,
        role: 'editor',
      },
    });
  } catch (error) {
    console.error('Join with invite code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join document',
    });
  }
};

// Get all invites sent to current user
exports.getMyInvites = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all rooms where user was invited
    const members = await RoomMember.find({
      user: userId,
      invitedBy: { $exists: true, $ne: null },
    })
      .populate({
        path: 'room',
        populate: { path: 'owner', select: 'name email' },
      })
      .populate('invitedBy', 'name email');

    const invites = members.map((m) => ({
      id: m._id,
      sentBy: m.invitedBy,
      room: m.room,
      role: m.role,
      sentAt: m.invitedAt,
    }));

    res.status(200).json({
      success: true,
      data: invites,
    });
  } catch (error) {
    console.error('Get my invites error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get invites',
    });
  }
};
