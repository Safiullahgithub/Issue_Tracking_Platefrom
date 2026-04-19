const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

const issueSchema = new mongoose.Schema({
  issueId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'security_vulnerability', 'task', 'improvement'],
    required: [true, 'Issue type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Priority is required'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'open'
  },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production', 'all'],
    default: 'staging'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [attachmentSchema],
  cvssScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  cveId: {
    type: String,
    default: null
  },
  affectedVersion: {
    type: String,
    default: null
  },
  fixVersion: {
    type: String,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate issueId before saving
issueSchema.pre('save', async function(next) {
  if (!this.issueId) {
    const count = await mongoose.model('Issue').countDocuments();
    this.issueId = `TS-${String(count + 1).padStart(4, '0')}`;
  }
  if (this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  if (this.status === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  }
  next();
});

// Indexes for performance
issueSchema.index({ status: 1, priority: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ type: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Issue', issueSchema);
