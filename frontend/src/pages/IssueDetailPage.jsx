import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PencilIcon, TrashIcon, PaperClipIcon, ChevronLeftIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import useAuthStore from '../context/authStore';
import { PageSpinner, Avatar, Badge, ConfirmDialog } from '../components/ui';
import CommentSection from '../components/issues/CommentSection';
import {
  PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG, ENVIRONMENT_CONFIG,
  APPROVAL_CONFIG, ROLE_CONFIG, formatDate, formatDateTime, timeAgo, canEdit, isManagerOrAdmin
} from '../utils/helpers';
import toast from 'react-hot-toast';

export default function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchIssue = async () => {
    try {
      const { data } = await api.get(`/issues/${id}`);
      setIssue(data.issue);
      setComments(data.comments);
    } catch {
      toast.error('Issue not found');
      navigate('/issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssue(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.patch(`/issues/${id}`, { status: newStatus });
      setIssue(data.issue);
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApprovalChange = async (approvalStatus) => {
    try {
      const { data } = await api.patch(`/issues/${id}`, { approvalStatus });
      setIssue(data.issue);
      toast.success(`Issue ${approvalStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update approval');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/issues/${id}`);
      toast.success('Issue deleted');
      navigate('/issues');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await api.delete(`/issues/${id}/attachments/${attachmentId}`);
      setIssue(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a => a._id !== attachmentId)
      }));
      toast.success('Attachment removed');
    } catch {
      toast.error('Failed to remove attachment');
    }
  };

  if (loading) return <PageSpinner />;
  if (!issue) return null;

  const priConf = PRIORITY_CONFIG[issue.priority] || {};
  const statConf = STATUS_CONFIG[issue.status] || {};
  const typeConf = TYPE_CONFIG[issue.type] || {};
  const envConf = ENVIRONMENT_CONFIG[issue.environment] || {};
  const approvalConf = APPROVAL_CONFIG[issue.approvalStatus] || {};

  const canEditIssue = canEdit(user, issue);
  const canApprove = isManagerOrAdmin(user) || user?.role === 'security_analyst';

  const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'reopened'];

  return (
    <div className="max-w-6xl mx-auto space-y-4 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/issues" className="hover:text-brand-600 flex items-center gap-1">
          <ChevronLeftIcon className="w-4 h-4" /> Issues
        </Link>
        <span>/</span>
        <span className="font-mono text-brand-600">{issue.issueId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Issue header card */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-xs text-gray-400">{issue.issueId}</span>
                  <span className={`badge ${typeConf.color}`}>{typeConf.icon} {typeConf.label}</span>
                  <span className={`badge ${priConf.color}`}>{priConf.label}</span>
                  <span className={`badge ${statConf.color}`}>{statConf.label}</span>
                  <span className={`badge ${approvalConf.color}`}>{approvalConf.label}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{issue.title}</h1>
              </div>

              {canEditIssue && (
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/issues/${id}/edit`} className="btn-secondary py-1.5 px-3 text-xs">
                    <PencilIcon className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button onClick={() => setConfirmDelete(true)} className="btn-danger py-1.5 px-3 text-xs">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose-content text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
              {issue.description}
            </div>

            {/* Tags */}
            {issue.tags?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {issue.tags.map(tag => (
                  <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
                ))}
              </div>
            )}

            {/* Security fields */}
            {issue.type === 'security_vulnerability' && (issue.cvssScore || issue.cveId) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <p className="text-sm font-semibold text-red-800">🔒 Security Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {issue.cvssScore && (
                    <div>
                      <span className="text-gray-500">CVSS Score:</span>
                      <span className={`ml-2 font-bold ${issue.cvssScore >= 9 ? 'text-red-700' : issue.cvssScore >= 7 ? 'text-orange-600' : 'text-yellow-600'}`}>
                        {issue.cvssScore}/10
                      </span>
                    </div>
                  )}
                  {issue.cveId && (
                    <div>
                      <span className="text-gray-500">CVE ID:</span>
                      <span className="ml-2 font-mono text-red-700">{issue.cveId}</span>
                    </div>
                  )}
                  {issue.affectedVersion && (
                    <div>
                      <span className="text-gray-500">Affected Version:</span>
                      <span className="ml-2 font-mono">{issue.affectedVersion}</span>
                    </div>
                  )}
                  {issue.fixVersion && (
                    <div>
                      <span className="text-gray-500">Fix Version:</span>
                      <span className="ml-2 font-mono text-green-700">{issue.fixVersion}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attachments */}
          {issue.attachments?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <PaperClipIcon className="w-4 h-4" /> Attachments ({issue.attachments.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {issue.attachments.map(att => (
                  <div key={att._id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                    {att.mimetype?.startsWith('image/') ? (
                      <a href={att.path} target="_blank" rel="noreferrer">
                        <img src={att.path} alt={att.originalName} className="w-full h-28 object-cover" />
                      </a>
                    ) : (
                      <a
                        href={att.path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center h-28 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-3xl">📄</span>
                        <span className="text-xs text-gray-500 mt-1 px-2 truncate w-full text-center">{att.originalName}</span>
                      </a>
                    )}
                    {canEditIssue && (
                      <button
                        onClick={() => handleDeleteAttachment(att._id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection
            issueId={id}
            comments={comments}
            setComments={setComments}
          />
        </div>

        {/* Sidebar details */}
        <div className="space-y-4">
          {/* Status changer */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="space-y-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || issue.status === s}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-default
                    ${issue.status === s
                      ? `${STATUS_CONFIG[s]?.color} ring-2 ring-offset-1 ring-brand-400`
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {issue.status === s && '✓ '}{STATUS_CONFIG[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Approval actions */}
          {canApprove && issue.approvalStatus === 'pending' && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Approval</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprovalChange('approved')}
                  className="flex-1 btn-primary py-2 text-xs justify-center"
                >
                  <CheckCircleIcon className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleApprovalChange('rejected')}
                  className="flex-1 btn-danger py-2 text-xs justify-center"
                >
                  <XCircleIcon className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Details</h3>

            <DetailRow label="Environment">
              <span className={`badge ${envConf.color}`}>{envConf.label}</span>
            </DetailRow>

            <DetailRow label="Reported By">
              {issue.reportedBy ? (
                <div className="flex items-center gap-2">
                  <Avatar user={issue.reportedBy} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{issue.reportedBy.name}</p>
                    <p className="text-xs text-gray-400">{ROLE_CONFIG[issue.reportedBy.role]?.label}</p>
                  </div>
                </div>
              ) : '—'}
            </DetailRow>

            <DetailRow label="Assigned To">
              {issue.assignedTo ? (
                <div className="flex items-center gap-2">
                  <Avatar user={issue.assignedTo} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{issue.assignedTo.name}</p>
                    <p className="text-xs text-gray-400">{ROLE_CONFIG[issue.assignedTo.role]?.label}</p>
                  </div>
                </div>
              ) : <span className="text-gray-400 text-sm italic">Unassigned</span>}
            </DetailRow>

            {issue.resolvedBy && (
              <DetailRow label="Resolved By">
                <div className="flex items-center gap-2">
                  <Avatar user={issue.resolvedBy} size="sm" />
                  <span className="text-sm text-gray-900">{issue.resolvedBy.name}</span>
                </div>
              </DetailRow>
            )}

            <DetailRow label="Created">{timeAgo(issue.createdAt)}</DetailRow>
            {issue.updatedAt !== issue.createdAt && (
              <DetailRow label="Updated">{timeAgo(issue.updatedAt)}</DetailRow>
            )}
            {issue.dueDate && (
              <DetailRow label="Due Date">
                <span className={new Date(issue.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                  {formatDate(issue.dueDate)}
                </span>
              </DetailRow>
            )}
            {issue.resolvedAt && (
              <DetailRow label="Resolved">{formatDateTime(issue.resolvedAt)}</DetailRow>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Issue"
        message={`Are you sure you want to delete "${issue.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function DetailRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <div>{children}</div>
    </div>
  );
}
