const Issue = require('../models/Issue');
const User = require('../models/User');
const Comment = require('../models/Comment');

exports.getDashboard = async (req, res, next) => {
  try {
    const baseFilter = { isArchived: false };

    // For developers/QA, restrict to their issues
    if (['developer', 'qa'].includes(req.user.role)) {
      baseFilter.$or = [
        { assignedTo: req.user._id },
        { reportedBy: req.user._id }
      ];
    }

    // Overall counts
    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      totalUsers
    ] = await Promise.all([
      Issue.countDocuments(baseFilter),
      Issue.countDocuments({ ...baseFilter, status: 'open' }),
      Issue.countDocuments({ ...baseFilter, status: 'in_progress' }),
      Issue.countDocuments({ ...baseFilter, status: 'resolved' }),
      Issue.countDocuments({ ...baseFilter, status: 'closed' }),
      User.countDocuments({ isActive: true })
    ]);

    // Issues by priority
    const priorityData = await Issue.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Issues by type
    const typeData = await Issue.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Issues by environment
    const envData = await Issue.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$environment', count: { $sum: 1 } } }
    ]);

    // Issues created over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendData = await Issue.aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Issues by approval status
    const approvalData = await Issue.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$approvalStatus', count: { $sum: 1 } } }
    ]);

    // Recent issues
    const recentIssues = await Issue.find(baseFilter)
      .populate('assignedTo', 'name email avatar')
      .populate('reportedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Critical issues
    const criticalIssues = await Issue.find({ ...baseFilter, priority: 'critical', status: { $in: ['open', 'in_progress'] } })
      .populate('assignedTo', 'name email avatar')
      .populate('reportedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top assignees
    const topAssignees = await Issue.aggregate([
      { $match: { ...baseFilter, assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          count: 1
        }
      }
    ]);

    res.json({
      summary: {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        closedIssues,
        totalUsers
      },
      charts: {
        priority: priorityData,
        type: typeData,
        environment: envData,
        trend: trendData,
        approval: approvalData
      },
      recentIssues,
      criticalIssues,
      topAssignees
    });
  } catch (err) {
    next(err);
  }
};
