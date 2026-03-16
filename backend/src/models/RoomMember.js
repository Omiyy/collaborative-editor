const mongoose = require('mongoose');

const roomMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    invitedAt: {
      type: Date,
      default: null,
    },
    joinedViaInvite: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure unique user-room combination
roomMemberSchema.index({ user: 1, room: 1 }, { unique: true });
roomMemberSchema.index({ room: 1 });
roomMemberSchema.index({ user: 1 });

module.exports = mongoose.model('RoomMember', roomMemberSchema);
