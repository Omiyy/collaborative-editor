const Room = require('../models/Room');
const RoomMember = require('../models/RoomMember');
const User = require('../models/User');

// Create room
exports.createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a room name',
      });
    }

    // Create room
    const room = new Room({
      name,
      description: description || '',
      owner: userId,
    });
    await room.save();

    // Add creator as owner member
    const member = new RoomMember({
      user: userId,
      room: room._id,
      role: 'owner',
    });
    await member.save();
    room.members.push(member._id);
    await room.save();

    // Populate data
    await room.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create room',
    });
  }
};

// Get all rooms for user
exports.getUserRooms = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all rooms where user is a member
    const members = await RoomMember.find({ user: userId, isActive: true }).populate({
      path: 'room',
      populate: { path: 'owner', select: 'name email' },
    });

    const rooms = members.map((m) => ({
      ...m.room.toObject(),
      userRole: m.role,
    }));

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get rooms',
    });
  }
};

// Get single room
exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const room = await Room.findById(roomId)
      .populate('owner', 'name email')
      .populate({
        path: 'members',
        populate: { path: 'user', select: 'name email' },
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is member
    const member = await RoomMember.findOne({ user: userId, room: roomId, isActive: true });
    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this room',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get room',
    });
  }
};

// Get room members
exports.getRoomMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    // Check if user is member
    const userMember = await RoomMember.findOne({ user: userId, room: roomId, isActive: true });
    if (!userMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this room',
      });
    }

    const members = await RoomMember.find({ room: roomId, isActive: true }).populate(
      'user',
      'name email'
    );

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error('Get room members error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get members',
    });
  }
};

// Add member to room
exports.addMember = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { email, role } = req.body;
    const userId = req.user.userId;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email',
      });
    }

    // Check if requester is owner or editor
    const requesterMember = await RoomMember.findOne({
      user: userId,
      room: roomId,
      isActive: true,
    });

    if (!requesterMember || requesterMember.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add members',
      });
    }

    // Find user by email
    const newUser = await User.findOne({ email });
    if (!newUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user already member
    const existingMember = await RoomMember.findOne({
      user: newUser._id,
      room: roomId,
    });

    if (existingMember && existingMember.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this room',
      });
    }

    if (existingMember && !existingMember.isActive) {
      existingMember.isActive = true;
      existingMember.role = role || 'viewer';
      await existingMember.save();
      await existingMember.populate('user', 'name email');

      return res.status(200).json({
        success: true,
        message: 'Member access restored successfully',
        data: existingMember,
      });
    }

    // Add member
    const member = new RoomMember({
      user: newUser._id,
      room: roomId,
      role: role || 'viewer',
    });
    await member.save();

    const room = await Room.findById(roomId);
    room.members.push(member._id);
    await room.save();

    await member.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: member,
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add member',
    });
  }
};

// Remove member from room
exports.removeMember = async (req, res) => {
  try {
    const { roomId, memberId } = req.params;
    const userId = req.user.userId;

    // Check if requester has permission
    const requesterMember = await RoomMember.findOne({
      user: userId,
      room: roomId,
      isActive: true,
    });

    if (!requesterMember || requesterMember.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove members',
      });
    }

    const member = await RoomMember.findOne({
      _id: memberId,
      room: roomId,
      isActive: true,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    if (member.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove owner access from this endpoint',
      });
    }

    member.isActive = false;
    await member.save();

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: member,
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove member',
    });
  }
};

// Update member role in room
exports.updateMemberRole = async (req, res) => {
  try {
    const { roomId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.userId;

    if (!['owner', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be owner, editor, or viewer',
      });
    }

    const requesterMember = await RoomMember.findOne({
      user: userId,
      room: roomId,
      isActive: true,
    });

    if (!requesterMember || requesterMember.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only room owner can change roles',
      });
    }

    const targetMember = await RoomMember.findOne({
      _id: memberId,
      room: roomId,
      isActive: true,
    }).populate('user', 'name email');

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    if (targetMember.user._id.toString() === userId && role !== 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Owner cannot downgrade own role here',
      });
    }

    targetMember.role = role;
    await targetMember.save();

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: targetMember,
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update member role',
    });
  }
};
