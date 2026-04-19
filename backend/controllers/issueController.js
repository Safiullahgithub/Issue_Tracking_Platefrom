const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const path = require('path');
const fs = require('fs');

exports.getAllIssues = async (req, res, next) => {
  try {
    const {
      status, priority, type, environment, assignedTo,
      reportedBy, approvalStatus, search,
      page = 1, limit = 20, sort = '-createdAt'
    } = req.query;

    const filter = { isArchived: false };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (environment) filter.environment = environment;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { issueId: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Role-based filtering: developers/QA only see their assigned/reported
    if (['developer', 'qa'].includes(req.user.role)) {
      filter.$or = [
        { assignedTo: req.user._id },
        { reportedBy: req.user._id }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('assignedTo', 'name email role avatar')
      .populate('reportedBy', 'name email role avatar')
      .populate('resolvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('assignedTo', 'name email role avatar')
      .populate('reportedBy', 'name email role avatar')
      .populate('resolvedBy', 'name email avatar')
      .populate('attachments.uploadedBy', 'name email');

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const comments = await Comment.find({ issue: issue._id })
      .populate('author', 'name email role avatar')
      .sort({ createdAt: 1 });

    res.json({ issue, comments });
  } catch (err) {
    next(err);
  }
};

exports.createIssue = async (req, res, next) => {
  try {
    const {
      title, description, type, priority, status,
      environment, assignedTo, dueDate, tags,
      cvssScore, cveId, affectedVersion, fixVersion
    } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ error: 'Title, description, and type are required' });
    }

    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: `/uploads/attachments/${file.filename}`,
          uploadedBy: req.user._id
        });
      });
    }

    const issue = await Issue.create({
      title,
      description,
      type,
      priority: priority || 'medium',
      status: status || 'open',
      environment: environment || 'staging',
      assignedTo: assignedTo || null,
      reportedBy: req.user._id,
      dueDate: dueDate || null,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      attachments,
      cvssScore: cvssScore || null,
      cveId: cveId || null,
      affectedVersion: affectedVersion || null,
      fixVersion: fixVersion || null
    });

    const populated = await Issue.findById(issue._id)
      .populate('assignedTo', 'name email role')
      .populate('reportedBy', 'name email role');

    res.status(201).json({ message: 'Issue created successfully', issue: populated });
  } catch (err) {
    next(err);
  }
};

exports.updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Only admin, manager, security_analyst can update approval status
    if (req.body.approvalStatus && !['admin', 'manager', 'security_analyst'].includes(req.user.role)) {
      delete req.body.approvalStatus;
    }

    const allowedFields = [
      'title', 'description', 'type', 'priority', 'status',
      'environment', 'assignedTo', 'dueDate', 'tags', 'approvalStatus',
      'cvssScore', 'cveId', 'affectedVersion', 'fixVersion'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.status === 'resolved') {
      updates.resolvedBy = req.user._id;
      updates.resolvedAt = new Date();
    }

    const updated = await Issue.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('assignedTo', 'name email role avatar')
      .populate('reportedBy', 'name email role avatar')
      .populate('resolvedBy', 'name email');

    res.json({ message: 'Issue updated', issue: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Only admin can permanently delete
    if (req.user.role !== 'admin') {
      await Issue.findByIdAndUpdate(req.params.id, { isArchived: true });
      return res.json({ message: 'Issue archived' });
    }

    // Delete attachments
    issue.attachments.forEach(att => {
      const filePath = path.join(__dirname, '..', att.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Comment.deleteMany({ issue: issue._id });
    await issue.deleteOne();

    res.json({ message: 'Issue deleted permanently' });
  } catch (err) {
    next(err);
  }
};

exports.uploadAttachment = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/attachments/${req.file.filename}`,
      uploadedBy: req.user._id
    };

    issue.attachments.push(attachment);
    await issue.save();

    res.json({ message: 'Attachment uploaded', attachment });
  } catch (err) {
    next(err);
  }
};

exports.deleteAttachment = async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const attachment = issue.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.join(__dirname, '..', attachment.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    issue.attachments.pull(attachmentId);
    await issue.save();

    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    next(err);
  }
};
