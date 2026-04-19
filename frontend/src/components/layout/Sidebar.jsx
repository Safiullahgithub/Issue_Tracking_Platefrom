import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon, BugAntIcon, UsersIcon, PlusCircleIcon,
  ArrowRightOnRectangleIcon, UserCircleIcon, ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../context/authStore';
import { ROLE_CONFIG, getInitials, getAvatarColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/issues', label: 'Issues', icon: BugAntIcon },
  { to: '/issues/new', label: 'New Issue', icon: PlusCircleIcon },
];

const adminItems = [
  { to: '/users', label: 'User Management', icon: UsersIcon },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleConf = ROLE_CONFIG[user?.role] || {};

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200
        flex flex-col w-64 transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-tight">TrackShield</p>
            <p className="text-xs text-gray-400">Issue Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2">Admin</p>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-3 space-y-1 flex-shrink-0">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <UserCircleIcon className="w-5 h-5 flex-shrink-0" />
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            Sign Out
          </button>

          <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg bg-gray-50">
            <div className={`w-8 h-8 rounded-full ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <span className={`badge text-xs ${roleConf.color}`}>{roleConf.label}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
