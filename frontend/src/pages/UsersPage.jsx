import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import useAuthStore from '../context/authStore';
import { Avatar, Badge, Modal, ConfirmDialog, PageSpinner, Empty } from '../components/ui';
import { ROLE_CONFIG, formatDate, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'manager', 'developer', 'qa', 'security_analyst'];
const emptyForm = { name: '', email: '', password: '', role: 'developer', isActive: true };

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    const params = {};
    if (search) params.search = search;
    const { data } = await api.get('/users', { params });
    setUsers(data.users);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    if (!editUser && !form.password) return toast.error('Password is required for new users');

    setSaving(true);
    try {
      if (editUser) {
        const updates = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
        const { data } = await api.put(`/users/${editUser._id}`, updates);
        setUsers(prev => prev.map(u => u._id === editUser._id ? data.user : u));
        toast.success('User updated');
      } else {
        const { data } = await api.post('/users', form);
        setUsers(prev => [data.user, ...prev]);
        toast.success('User created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteUser._id}`);
      setUsers(prev => prev.map(u => u._id === deleteUser._id ? { ...u, isActive: false } : u));
      toast.success('User deactivated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deactivate user');
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button onClick={openCreate} className="btn-primary">
          <PlusIcon className="w-4 h-4" /> New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role && u.isActive).length;
          return (
            <div key={role} className="card p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`badge ${ROLE_CONFIG[role]?.color} mt-1`}>{ROLE_CONFIG[role]?.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageSpinner /> : users.length === 0 ? (
          <Empty title="No users found" action={<button onClick={openCreate} className="btn-primary">Create User</button>} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Last Login</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className={`hover:bg-gray-50/60 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size="md" />
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`badge ${ROLE_CONFIG[u.role]?.color}`}>{ROLE_CONFIG[u.role]?.label}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {u.lastLogin ? timeAgo(u.lastLogin) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {u._id !== currentUser._id && u.isActive && (
                        <button
                          onClick={() => setDeleteUser(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Deactivate"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Edit User' : 'Create New User'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="John Doe" required />
          </div>
          <div>
            <label className="label">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="john@company.com" required />
          </div>
          {!editUser && (
            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="input" placeholder="Min 6 characters" minLength={6} required />
            </div>
          )}
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input bg-white">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r]?.label}</option>)}
            </select>
          </div>
          {editUser && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600"
              />
              <span className="text-sm text-gray-700">Active account</span>
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[100px] justify-center">
              {saving ? 'Saving...' : (editUser ? 'Save Changes' : 'Create User')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Deactivate User"
        message={`Deactivate "${deleteUser?.name}"? They will no longer be able to log in.`}
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}
