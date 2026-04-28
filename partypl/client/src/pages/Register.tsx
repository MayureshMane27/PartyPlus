import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, User2, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ApiResponse } from '@/types';

type Role = 'user' | 'vendor';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'user' as Role,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<null>>('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success(res.data.message ?? 'Account created!');
      navigate('/login');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <Crown className="w-6 h-6 text-brand-500 group-hover:rotate-12 transition-transform" />
            <span className="font-display text-xl text-ink-900">PartyPlus</span>
          </Link>
          <h1 className="font-display text-4xl text-ink-900 mb-2">Join PartyPlus</h1>
          <p className="text-ink-500">Create your free account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="name"
              label="Full name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Priya Sharma"
              required
              autoComplete="name"
            />

            <Input
              id="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <Input
              id="confirm"
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setField('confirmPassword', e.target.value)}
              placeholder="••••••••"
              required
            />

            {/* Role picker */}
            <div>
              <p className="label">Account type</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { role: 'user' as Role, icon: User2, title: 'Customer', desc: 'Book event services' },
                  { role: 'vendor' as Role, icon: Store, title: 'Vendor', desc: 'Offer your services' },
                ] as const).map(({ role, icon: Icon, title, desc }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setField('role', role)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                      form.role === role
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-ink-200 hover:border-ink-300 bg-white'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', form.role === role ? 'text-brand-600' : 'text-ink-500')} />
                    <div>
                      <p className={cn('font-medium text-sm', form.role === role ? 'text-brand-700' : 'text-ink-800')}>
                        {title}
                      </p>
                      <p className="text-xs text-ink-500">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {form.role === 'vendor' && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
                  Vendor accounts require admin approval before you can list services.
                </p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center py-3">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
