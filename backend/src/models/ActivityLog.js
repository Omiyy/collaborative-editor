const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodeDocument',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['created', 'edited', 'deleted', 'renamed', 'shared', 'commented', 'left'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    changes: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for faster queries
activityLogSchema.index({ document: 1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
