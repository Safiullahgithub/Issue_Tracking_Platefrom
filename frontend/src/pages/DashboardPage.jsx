import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { PageSpinner, StatCard, Badge } from '../components/ui';
import { PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG, timeAgo, formatDate } from '../utils/helpers';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load dashboard</div>;

  const { summary, charts, recentIssues, criticalIssues } = data;

  const priorityChartData = charts.priority.map(p => ({
    name: PRIORITY_CONFIG[p._id]?.label || p._id,
    value: p.count,
    fill: p._id === 'critical' ? '#ef4444' : p._id === 'high' ? '#f97316' : p._id === 'medium' ? '#eab308' : '#22c55e'
  }));

  const typeChartData = charts.type.map(t => ({
    name: TYPE_CONFIG[t._id]?.label || t._id,
    value: t.count
  }));

  const trendChartData = charts.trend.map(t => ({
    date: t._id,
    Issues: t.count
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Issues" value={summary.totalIssues} icon="📋" color="bg-blue-50" />
        <StatCard label="Open" value={summary.openIssues} icon="🔵" color="bg-blue-50" />
        <StatCard label="In Progress" value={summary.inProgressIssues} icon="🟣" color="bg-purple-50" />
        <StatCard label="Resolved" value={summary.resolvedIssues} icon="✅" color="bg-green-50" />
        <StatCard label="Closed" value={summary.closedIssues} icon="🔒" color="bg-gray-50" />
        <StatCard label="Total Users" value={summary.totalUsers} icon="👥" color="bg-brand-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Issues by Priority (bar) */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Issues by Priority</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityChartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Issues by Type (pie) */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Issues by Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {typeChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend chart */}
      {trendChartData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Issue Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="Issues" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Issues */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Recent Issues</h3>
            <Link to="/issues" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentIssues.map(issue => (
              <Link key={issue._id} to={`/issues/${issue._id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <span className="text-lg mt-0.5">{TYPE_CONFIG[issue.type]?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${STATUS_CONFIG[issue.status]?.color}`}>{STATUS_CONFIG[issue.status]?.label}</span>
                    <span className="text-xs text-gray-400">{timeAgo(issue.createdAt)}</span>
                  </div>
                </div>
                <span className={`badge ${PRIORITY_CONFIG[issue.priority]?.color} self-start`}>
                  {PRIORITY_CONFIG[issue.priority]?.label}
                </span>
              </Link>
            ))}
            {recentIssues.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No issues yet</div>
            )}
          </div>
        </div>

        {/* Critical issues */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">🚨 Critical Open Issues</h3>
            <Link to="/issues?priority=critical" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {criticalIssues.map(issue => (
              <Link key={issue._id} to={`/issues/${issue._id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{issue.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${TYPE_CONFIG[issue.type]?.color}`}>{TYPE_CONFIG[issue.type]?.label}</span>
                    {issue.assignedTo && (
                      <span className="text-xs text-gray-500">→ {issue.assignedTo.name}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(issue.createdAt)}</span>
              </Link>
            ))}
            {criticalIssues.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-green-600">✅ No critical issues open</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
