import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

// ─── Spinner ───────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} />;
}

// ─── Status Badge ──────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('badge capitalize', statusStyles[status] ?? 'bg-ink-100 text-ink-600')}>
      {status}
    </span>
  );
}

// ─── Avatar ────────────────────────────────────────────────────
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-medium select-none',
      className ?? 'w-9 h-9 text-sm'
    )}>
      {initials}
    </span>
  );
}

// ─── Category Icon ─────────────────────────────────────────────
const categoryEmoji: Record<string, string> = {
  venue: '🏛️',
  catering: '🍽️',
  decoration: '🎨',
  photography: '📸',
  entertainment: '🎵',
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="badge bg-ink-100 text-ink-700">
      {categoryEmoji[category] ?? '✨'} {category}
    </span>
  );
}

// ─── Empty State ───────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold text-ink-800 mb-2">{title}</h3>
      <p className="text-ink-500 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-8 w-24 mt-2" />
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl text-ink-900">{title}</h2>
        {subtitle && <p className="text-ink-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn('input', error && 'border-red-400 focus:ring-red-300', className)}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────
interface SelectProps {
  label?: string;
  error?: string;
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({ label, error, id, value, onChange, options, className }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('input', error && 'border-red-400', className)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Textarea ──────────────────────────────────────────────────
interface TextareaProps {
  label?: string;
  error?: string;
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export function Textarea({ label, error, id, value, onChange, placeholder, rows = 3 }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn('input resize-none', error && 'border-red-400')}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-white rounded-3xl shadow-2xl w-full p-8 animate-fade-up max-h-[90vh] overflow-y-auto custom-scrollbar',
        sizes[size]
      )}>
        <h3 className="font-display text-2xl text-ink-900 mb-6">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── Button ────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50',
  };
  return (
    <button
      className={cn(variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}
