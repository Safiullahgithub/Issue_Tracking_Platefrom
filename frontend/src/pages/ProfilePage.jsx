import { useState } from 'react';
import api from '../services/api';
import useAuthStore from '../context/authStore';
import { Avatar } from '../components/ui';
import { ROLE_CONFIG, formatDate, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [savingPass, setSavingPass] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/users/profile', { name });
      setUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPass(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPass(false);
    }
  };

  const roleConf = ROLE_CONFIG[user?.role] || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card p-6 flex items-center gap-5">
        <div className="flex-shrink-0">
          <Avatar user={user} size="lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`badge ${roleConf.color}`}>{roleConf.label}</span>
            <span className="text-xs text-gray-400">Member since {formatDate(user?.createdAt)}</span>
          </div>
          {user?.lastLogin && (
            <p className="text-xs text-gray-400 mt-1">Last login: {timeAgo(user.lastLogin)}</p>
          )}
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Edit Profile</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact an admin if needed.</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
              className="input"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
              className="input"
              placeholder="Min 6 characters"
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className="input"
              placeholder="Repeat new password"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPass || !passwords.current || !passwords.new || !passwords.confirm} className="btn-primary">
              {savingPass ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Security info */}
      <div className="card p-5 bg-amber-50 border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-2">🔐 Security Tips</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Use a strong, unique password with 12+ characters</li>
          <li>• Never share your credentials with others</li>
          <li>• Report any suspicious activity to your admin immediately</li>
          <li>• Always log out when using shared devices</li>
        </ul>
      </div>
    </div>
  );
}
