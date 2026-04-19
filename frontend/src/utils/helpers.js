import { formatDistanceToNow, format } from 'date-fns';

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800', dot: 'bg-red-500', ring: 'ring-red-500' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', ring: 'ring-orange-500' },
  medium:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', ring: 'ring-yellow-500' },
  low:      { label: 'Low',      color: 'bg-green-100 text-green-700', dot: 'bg-green-500', ring: 'ring-green-500' },
};

export const STATUS_CONFIG = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-800' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-700' },
  reopened:    { label: 'Reopened',    color: 'bg-yellow-100 text-yellow-800' },
};

export const TYPE_CONFIG = {
  bug:                  { label: 'Bug',                  color: 'bg-red-100 text-red-700',    icon: '🐛' },
  feature:              { label: 'Feature',              color: 'bg-blue-100 text-blue-700',  icon: '✨' },
  security_vulnerability: { label: 'Security',           color: 'bg-rose-100 text-rose-800',  icon: '🔒' },
  task:                 { label: 'Task',                 color: 'bg-gray-100 text-gray-700',  icon: '📋' },
  improvement:          { label: 'Improvement',          color: 'bg-teal-100 text-teal-700',  icon: '⬆️' },
};

export const ROLE_CONFIG = {
  admin:            { label: 'Admin',            color: 'bg-red-100 text-red-700' },
  manager:          { label: 'Manager',          color: 'bg-purple-100 text-purple-700' },
  security_analyst: { label: 'Security Analyst', color: 'bg-orange-100 text-orange-700' },
  developer:        { label: 'Developer',        color: 'bg-blue-100 text-blue-700' },
  qa:               { label: 'QA',               color: 'bg-green-100 text-green-700' },
};

export const APPROVAL_CONFIG = {
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  pending:  { label: 'Pending',  color: 'bg-yellow-100 text-yellow-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export const ENVIRONMENT_CONFIG = {
  production:  { label: 'Production',  color: 'bg-red-50 text-red-700 border border-red-200' },
  staging:     { label: 'Staging',     color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  development: { label: 'Development', color: 'bg-green-50 text-green-700 border border-green-200' },
  all:         { label: 'All Envs',    color: 'bg-gray-50 text-gray-700 border border-gray-200' },
};

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const avatarColors = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
];

export const getAvatarColor = (name = '') => {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
};

export const canEdit = (user, issue) => {
  if (!user) return false;
  if (['admin', 'manager'].includes(user.role)) return true;
  if (user._id === issue?.reportedBy?._id || user._id === issue?.reportedBy) return true;
  if (user._id === issue?.assignedTo?._id || user._id === issue?.assignedTo) return true;
  return false;
};

export const isAdmin = (user) => user?.role === 'admin';
export const isManagerOrAdmin = (user) => ['admin', 'manager'].includes(user?.role);
export const isSecurityOrAdmin = (user) => ['admin', 'security_analyst'].includes(user?.role);
