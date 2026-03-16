const mongoose = require('mongoose');

const codeDocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a document name'],
      trim: true,
    },
    content: {
      type: String,
      default: '// Start coding...\n',
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css', 'json', 'sql', 'other'],
      default: 'javascript',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for faster queries
codeDocumentSchema.index({ room: 1 });
codeDocumentSchema.index({ createdBy: 1 });
codeDocumentSchema.index({ status: 1 });

module.exports = mongoose.model('CodeDocument', codeDocumentSchema);
