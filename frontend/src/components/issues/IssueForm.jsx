import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { Spinner } from '../ui';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'bug', label: '🐛 Bug' },
  { value: 'feature', label: '✨ Feature Request' },
  { value: 'security_vulnerability', label: '🔒 Security Vulnerability' },
  { value: 'task', label: '📋 Task' },
  { value: 'improvement', label: '⬆️ Improvement' },
];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'reopened'];
const ENVIRONMENTS = ['development', 'staging', 'production', 'all'];
const APPROVALS = ['pending', 'approved', 'rejected'];

export default function IssueForm({ issue, onSuccess }) {
  const navigate = useNavigate();
  const isEdit = !!issue;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    title: issue?.title || '',
    description: issue?.description || '',
    type: issue?.type || 'bug',
    priority: issue?.priority || 'medium',
    status: issue?.status || 'open',
    environment: issue?.environment || 'staging',
    assignedTo: issue?.assignedTo?._id || issue?.assignedTo || '',
    dueDate: issue?.dueDate ? issue.dueDate.substring(0, 10) : '',
    approvalStatus: issue?.approvalStatus || 'pending',
    tags: issue?.tags?.join(', ') || '',
    cvssScore: issue?.cvssScore || '',
    cveId: issue?.cveId || '',
    affectedVersion: issue?.affectedVersion || '',
    fixVersion: issue?.fixVersion || '',
  });

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users));
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(f => {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} is too large (max 10MB)`); return false; }
      return true;
    });
    setFiles(prev => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles(f => f.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      files.forEach(file => formData.append('attachments', file));

      let data;
      if (isEdit) {
        const resp = await api.put(`/issues/${issue._id}`, form);
        data = resp.data;
      } else {
        const resp = await api.post('/issues', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        data = resp.data;
      }

      toast.success(isEdit ? 'Issue updated!' : 'Issue created!');
      if (onSuccess) onSuccess(data.issue);
      else navigate(`/issues/${data.issue._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save issue');
    } finally {
      setLoading(false);
    }
  };

  const isSecVuln = form.type === 'security_vulnerability';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label className="label">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className="input"
            placeholder="Brief, descriptive title of the issue"
            maxLength={200}
          />
        </div>

        <div>
          <label className="label">Description <span className="text-red-500">*</span></label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="input min-h-[160px] resize-y font-mono text-sm"
            placeholder="Detailed description of the issue. Include steps to reproduce, expected vs actual behavior, etc."
            maxLength={10000}
          />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/10000</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">Type <span className="text-red-500">*</span></label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input bg-white">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority <span className="text-red-500">*</span></label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)} className="input bg-white">
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input bg-white">
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Environment</label>
            <select value={form.environment} onChange={e => set('environment', e.target.value)} className="input bg-white">
              {ENVIRONMENTS.map(env => <option key={env} value={env}>{env.charAt(0).toUpperCase() + env.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Assignment */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Assignment & Schedule</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Assign To</label>
            <select value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} className="input bg-white">
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role.replace('_', ' ')})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Approval Status</label>
            <select value={form.approvalStatus} onChange={e => set('approvalStatus', e.target.value)} className="input bg-white">
              {APPROVALS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Tags</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
            className="input"
            placeholder="security, frontend, database (comma-separated)"
          />
        </div>
      </div>

      {/* Security fields */}
      {isSecVuln && (
        <div className="card p-6 space-y-4 border-red-200 bg-red-50/30">
          <h2 className="font-semibold text-red-900">🔒 Security Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CVSS Score (0–10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={form.cvssScore}
                onChange={e => set('cvssScore', e.target.value)}
                className="input"
                placeholder="e.g. 9.8"
              />
            </div>
            <div>
              <label className="label">CVE ID</label>
              <input
                type="text"
                value={form.cveId}
                onChange={e => set('cveId', e.target.value)}
                className="input"
                placeholder="CVE-2024-XXXXX"
              />
            </div>
            <div>
              <label className="label">Affected Version</label>
              <input
                type="text"
                value={form.affectedVersion}
                onChange={e => set('affectedVersion', e.target.value)}
                className="input"
                placeholder="e.g. v1.2.3"
              />
            </div>
            <div>
              <label className="label">Fix Version</label>
              <input
                type="text"
                value={form.fixVersion}
                onChange={e => set('fixVersion', e.target.value)}
                className="input"
                placeholder="e.g. v1.2.4"
              />
            </div>
          </div>
        </div>
      )}

      {/* File uploads (create only) */}
      {!isEdit && (
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Attachments</h2>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all">
            <PaperClipIcon className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload images or PDFs</span>
            <span className="text-xs text-gray-400">Max 10MB per file, up to 5 files</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </label>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="text-lg">{f.type.startsWith('image/') ? '🖼️' : '📄'}</span>
                  <span className="flex-1 truncate text-gray-700">{f.name}</span>
                  <span className="text-gray-400 text-xs">{(f.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary min-w-[120px] justify-center">
          {loading ? <Spinner className="w-4 h-4" /> : (isEdit ? 'Save Changes' : 'Create Issue')}
        </button>
      </div>
    </form>
  );
}
