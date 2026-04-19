import { XMarkIcon } from '@heroicons/react/24/outline';
import { getInitials, getAvatarColor } from '../../utils/helpers';

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ label, color, className = '' }) {
  return (
    <span className={`badge ${color} ${className}`}>{label}</span>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
  if (!user) return (
    <div className={`${sizes[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-400`}>?</div>
  );
  return (
    <div
      className={`${sizes[size]} rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold flex-shrink-0`}
      title={user.name}
    >
      {getInitials(user.name)}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ className = 'w-6 h-6' }) {
  return (
    <div className={`${className} border-2 border-gray-200 border-t-brand-600 rounded-full animate-spin`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function Empty({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-5">{description}</p>}
      {action}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto fade-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, className = '', required }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input bg-white appearance-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn-danger' : 'btn-primary'}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color, change }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && <p className="text-xs text-gray-400 mt-1">{change}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
