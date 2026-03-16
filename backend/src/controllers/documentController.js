const CodeDocument = require('../models/CodeDocument');
const Room = require('../models/Room');
const ActivityLog = require('../models/ActivityLog');
const RoomMember = require('../models/RoomMember');

// Create document
exports.createDocument = async (req, res) => {
  try {
    const { name, roomId } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a document name',
      });
    }

    let room = null;
    let finalRoomId = roomId;

    // If no roomId provided, create a dedicated room for this document.
    if (!finalRoomId) {
      const roomName = `${name} Room`;
      room = new Room({
        name: roomName,
        description: `Dedicated room for document "${name}"`,
        owner: userId,
      });
      await room.save();

      const member = new RoomMember({
        user: userId,
        room: room._id,
        role: 'owner',
      });
      await member.save();

      room.members.push(member._id);
      await room.save();

      finalRoomId = room._id;
    } else {
      // Check if room exists
      room = await Room.findById(finalRoomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Check if user is member of room
      const member = await RoomMember.findOne({
        user: userId,
        room: finalRoomId,
        isActive: true,
      });
      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this room',
        });
      }
    }

    // Create document
    const document = new CodeDocument({
      name,
      room: finalRoomId,
      createdBy: userId,
    });
    await document.save();

    // Log activity
    await ActivityLog.create({
      document: document._id,
      user: userId,
      action: 'created',
      description: `Created document "${name}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      data: document,
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create document',
    });
  }
};

// Get all documents in a room
exports.listDocuments = async (req, res) => {
  try {
    const { roomId } = req.query;
    const userId = req.user.userId;

    const memberships = await RoomMember.find({
      user: userId,
      isActive: true,
    }).select('room');

    const allowedRoomIds = memberships.map((m) => m.room);

    let query = {
      status: 'active',
      room: { $in: allowedRoomIds },
    };
    if (roomId) {
      query.room = roomId;
    }

    const documents = await CodeDocument.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list documents',
    });
  }
};

// Get single document
exports.getDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user.userId;

    const document = await CodeDocument.findById(docId)
      .populate('createdBy', 'name email')
      .populate('room');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check if user has access to document
    const member = await RoomMember.findOne({
      user: userId,
      room: document.room._id,
      isActive: true,
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this document',
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get document',
    });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    let document = await CodeDocument.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check access
    const member = await RoomMember.findOne({
      user: userId,
      room: document.room,
      isActive: true,
    });

    if (!member || member.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this document',
      });
    }

    // Update document
    document.content = content || document.content;
    document.version += 1;
    await document.save();

    // Log activity
    await ActivityLog.create({
      document: docId,
      user: userId,
      action: 'edited',
      description: 'Updated document content',
    });

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document,
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update document',
    });
  }
};

// Rename document
exports.renameDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new name',
      });
    }

    let document = await CodeDocument.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check access
    const member = await RoomMember.findOne({
      user: userId,
      room: document.room,
      isActive: true,
    });

    if (!member || member.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to rename this document',
      });
    }

    const oldName = document.name;
    document.name = name;
    await document.save();

    // Log activity
    await ActivityLog.create({
      document: docId,
      user: userId,
      action: 'renamed',
      description: `Renamed from "${oldName}" to "${name}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Document renamed successfully',
      data: document,
    });
  } catch (error) {
    console.error('Rename document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to rename document',
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user.userId;

    let document = await CodeDocument.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Check access.
    const member = await RoomMember.findOne({
      user: userId,
      room: document.room,
      isActive: true,
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this document',
      });
    }

    if (member.role === 'owner') {
      // Owner deletes for everyone.
      document.status = 'deleted';
      await document.save();

      await RoomMember.updateMany(
        { room: document.room, isActive: true },
        { $set: { isActive: false } }
      );

      await Room.findByIdAndUpdate(document.room, {
        status: 'deleted',
      });

      await ActivityLog.create({
        document: docId,
        user: userId,
        action: 'deleted',
        description: `Owner deleted document "${document.name}" for all users`,
      });

      return res.status(200).json({
        success: true,
        message: 'Document deleted for all users',
        data: { deleteMode: 'owner_global' },
      });
    }

    // Editor or viewer: only remove own access.
    member.isActive = false;
    await member.save();

    await ActivityLog.create({
      document: docId,
      user: userId,
      action: 'left',
      description: `${member.role} removed their own access from document "${document.name}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Your access to this document has been removed',
      data: { deleteMode: 'member_leave' },
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete document',
    });
  }
};
