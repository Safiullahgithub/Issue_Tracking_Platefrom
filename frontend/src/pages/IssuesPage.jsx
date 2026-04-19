import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { PageSpinner, Avatar, Badge, Empty } from '../components/ui';
import {
  PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG, ENVIRONMENT_CONFIG,
  timeAgo, formatDate
} from '../utils/helpers';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'reopened'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const TYPES = ['bug', 'feature', 'security_vulnerability', 'task', 'improvement'];

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    type: searchParams.get('type') || '',
    assignedTo: searchParams.get('assignedTo') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== 0));
    try {
      const { data } = await api.get('/issues', { params: { ...params, limit: 20 } });
      setIssues(data.issues);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);
  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users));
  }, []);

  const setFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', priority: '', type: '', assignedTo: '', page: 1 });
  };

  const hasFilters = filters.search || filters.status || filters.priority || filters.type || filters.assignedTo;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues by title, ID, or description..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-2 ${hasFilters ? 'ring-2 ring-brand-500 border-brand-300' : ''}`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
          </button>
          <Link to="/issues/new" className="btn-primary whitespace-nowrap">
            <PlusIcon className="w-4 h-4" />
            New Issue
          </Link>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Status</label>
              <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className="input bg-white">
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={filters.priority} onChange={e => setFilter('priority', e.target.value)} className="input bg-white">
                <option value="">All Priorities</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select value={filters.type} onChange={e => setFilter('type', e.target.value)} className="input bg-white">
                <option value="">All Types</option>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <select value={filters.assignedTo} onChange={e => setFilter('assignedTo', e.target.value)} className="input bg-white">
                <option value="">All Assignees</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <XMarkIcon className="w-4 h-4" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <PageSpinner />
        ) : issues.length === 0 ? (
          <Empty
            title="No issues found"
            description={hasFilters ? "Try adjusting your filters" : "Create your first issue to get started"}
            action={!hasFilters && <Link to="/issues/new" className="btn-primary">Create Issue</Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500 w-24">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Assignee</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">Env</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {issues.map(issue => (
                    <tr key={issue._id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-4 py-3">
                        <Link to={`/issues/${issue._id}`} className="font-mono text-xs text-brand-600 hover:underline">
                          {issue.issueId}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/issues/${issue._id}`} className="font-medium text-gray-900 hover:text-brand-600 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {issue.title}
                        </Link>
                        {issue.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {issue.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="badge bg-gray-100 text-gray-500 text-xs">{tag}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`badge ${TYPE_CONFIG[issue.type]?.color}`}>
                          {TYPE_CONFIG[issue.type]?.icon} {TYPE_CONFIG[issue.type]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${PRIORITY_CONFIG[issue.priority]?.color}`}>
                          {PRIORITY_CONFIG[issue.priority]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_CONFIG[issue.status]?.color}`}>
                          {STATUS_CONFIG[issue.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {issue.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar user={issue.assignedTo} size="sm" />
                            <span className="text-gray-700 truncate max-w-[100px]">{issue.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className={`badge ${ENVIRONMENT_CONFIG[issue.environment]?.color}`}>
                          {ENVIRONMENT_CONFIG[issue.environment]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden xl:table-cell whitespace-nowrap">
                        {timeAgo(issue.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
                <div className="flex gap-1">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setFilter('page', pagination.page - 1)}
                    className="btn-secondary py-1 px-3 disabled:opacity-40"
                  >← Prev</button>
                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setFilter('page', pagination.page + 1)}
                    className="btn-secondary py-1 px-3 disabled:opacity-40"
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
