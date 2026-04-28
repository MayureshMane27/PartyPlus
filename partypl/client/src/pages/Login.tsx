import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button, Input } from '@/components/ui';
import type { ApiResponse } from '@/types';
import type { User } from '@/types';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<null> & { user: User; token: string }>(
        '/auth/login',
        form
      );
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Login failed';
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
          <h1 className="font-display text-4xl text-ink-900 mb-2">Welcome back</h1>
          <p className="text-ink-500">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                id="email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <Mail className="absolute right-3 top-9 w-4 h-4 text-ink-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                id="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <Lock className="absolute right-3 top-9 w-4 h-4 text-ink-400 pointer-events-none" />
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center py-3">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
