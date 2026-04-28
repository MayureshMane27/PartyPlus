import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Crown, Menu, X, LayoutDashboard, LogOut,
  CalendarDays, Users, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './ui';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/services', label: 'Services' },
  { to: '/events', label: 'Events' },
  { to: '/vendors', label: 'Vendors' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const isActive = (to: string) => location.pathname === to;

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-500 p-2 rounded-xl group-hover:rotate-6 transition-transform duration-300">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl text-ink-900 tracking-tight">Party<span className="text-brand-500">Plus</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.to)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive('/admin')
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-ink-600 hover:bg-ink-100'
                    )}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive('/dashboard')
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-ink-600 hover:bg-ink-100'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <Avatar name={user.name} />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-ink-600 hover:text-ink-900 px-3 py-2 rounded-lg hover:bg-ink-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.to)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-ink-100">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                    <Avatar name={user.name} className="w-8 h-8 text-xs" />
                    <div>
                      <p className="text-sm font-medium text-ink-900">{user.name}</p>
                      <p className="text-xs text-ink-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary justify-center text-sm"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary justify-center text-sm"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
