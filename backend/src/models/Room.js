const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a room name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomMember',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for owner for faster queries
roomSchema.index({ owner: 1 });
roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);
