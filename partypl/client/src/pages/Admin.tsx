import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Users, Store, CalendarDays, TrendingUp, MapPin,
  CheckCircle, Clock, ShieldCheck, Activity, ShoppingCart, UserPlus, CalendarCheck
} from 'lucide-react';
import {
  useAdminStats, useAdminUsers, useApproveVendor, useAdminEvents, useAdminActivity,
  useAdminBookings, useDeleteUser
} from '@/lib/queries';
import {
  Avatar, StatusBadge, SkeletonCard, SectionHeader, Button, EmptyState,
} from '@/components/ui';
import { formatDate, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { ApiResponse, User, Event } from '@/types';

function StatCard({
  icon: Icon, value, label, sub, color,
}: { icon: React.ElementType; value: number; label: string; sub?: string; color: string }) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-semibold text-ink-900">{value}</p>
      <p className="text-sm text-ink-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
    </div>
  );
}

type Tab = 'overview' | 'users' | 'events' | 'bookings';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('overview');
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers();
  const { data: events = [] } = useAdminEvents();
  const { data: bookings = [], isLoading: loadingBookings } = useAdminBookings();
  const { data: activity } = useAdminActivity();
  const approveVendor = useApproveVendor();
  const deleteUser = useDeleteUser();
  const qc = useQueryClient();

  const [liveFeed, setLiveFeed] = useState<{ type: string; data: any; timestamp: Date }[]>([]);

  // Setup Socket.io for real-time updates
  useEffect(() => {
    // Use the current domain (works for localhost and ngrok)
    const socket = io(window.location.origin);

    socket.on('activity', (event) => {
      console.log('📡 Live activity received:', event);
      
      // Update local feed state
      setLiveFeed((prev) => [event, ...prev].slice(0, 10));

      // Show toast notification
      if (event.type === 'login') {
        toast(`${event.data.name} just logged in!`, { icon: '👤' });
      } else if (event.type === 'booking') {
        toast(`New booking: ${event.data.eventName} by ${event.data.userName}`, { icon: '💰' });
      }

      // Invalidate queries to refresh data in the background
      qc.invalidateQueries({ queryKey: ['admin', 'activity'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [qc]);

  async function handleApprove(id: string) {
    try {
      await approveVendor.mutateAsync(id);
      toast.success('Vendor approved!');
    } catch {
      toast.error('Failed to approve vendor');
    }
  }

  async function handleApproveEvent(id: string) {
    try {
      await api.patch<ApiResponse<null>>(`/events/${id}/approve`);
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Event approved!');
    } catch {
      toast.error('Failed to approve event');
    }
  }

  const pendingVendors = users.filter((u: User) => u.role === 'vendor' && !u.approved);
  const pendingEvents = events.filter((e: Event) => !e.approved);

  if (loadingStats) return <div className="p-10 text-center text-ink-500">Loading admin data...</div>;
  if (!stats) return <div className="p-10 text-center text-red-500">Failed to load admin dashboard</div>;

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Header */}
      <div className="bg-ink-900 text-white px-4 py-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-brand-400" />
          <div>
            <h1 className="font-display text-3xl">Admin panel</h1>
            <p className="text-ink-400 text-sm">Manage PartyPlus platform</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-ink-100 rounded-xl p-1 w-fit mb-8">
          {([
            ['overview', 'Overview'],
            ['users', `Users${pendingVendors.length ? ` (${pendingVendors.length})` : ''}`],
            ['events', `Events${pendingEvents.length ? ` (${pendingEvents.length})` : ''}`],
            ['bookings', 'Bookings'],
          ] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} value={stats.totalUsers} label="Users" color="bg-brand-50 text-brand-600" />
              <StatCard icon={Store} value={stats.totalVendors} label="Vendors" sub={`${stats.pendingVendors} pending`} color="bg-violet-50 text-violet-600" />
              <StatCard icon={CalendarCheck} value={stats.totalBookings} label="Bookings" sub={`${stats.confirmedBookings} confirmed`} color="bg-amber-50 text-amber-600" />
              <StatCard icon={CalendarDays} value={stats.totalEvents} label="Events" sub={`${pendingEvents.length} pending`} color="bg-emerald-50 text-emerald-600" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Activity Feed */}
              <div className="lg:col-span-2 space-y-6">
                <SectionHeader 
                  title="Live Activity Feed" 
                  subtitle="Real-time updates from other users" 
                  action={<div className="flex items-center gap-2 text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full animate-pulse"><Activity className="w-3 h-3" /> Live</div>}
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card p-6 border-l-4 border-l-amber-400 shadow-sm">
                    <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-500" /> Latest Bookings
                    </h3>
                    <div className="space-y-4">
                      {activity?.bookings?.length ? activity.bookings.map((b: any) => (
                        <div key={b.id} className="flex justify-between items-start border-b border-ink-50 pb-3 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-ink-900">{b.eventName}</p>
                            <p className="text-[10px] text-ink-400">{formatDate(b.createdAt)}</p>
                          </div>
                          <span className="text-xs font-bold text-brand-600">{formatPrice(b.totalPrice)}</span>
                        </div>
                      )) : <p className="text-xs text-ink-400 py-4 text-center">No recent bookings</p>}
                    </div>
                  </div>

                  <div className="card p-6 border-l-4 border-l-violet-400 shadow-sm">
                    <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-violet-500" /> New Users
                    </h3>
                    <div className="space-y-4">
                      {activity?.users?.length ? activity.users.map((u: any) => (
                        <div key={u.id} className="flex justify-between items-center border-b border-ink-50 pb-3 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-ink-900">{u.name}</p>
                            <p className="text-[10px] text-ink-400 capitalize">{u.role} • {formatDate(u.createdAt)}</p>
                          </div>
                          <StatusBadge status={u.role} />
                        </div>
                      )) : <p className="text-xs text-ink-400 py-4 text-center">No recent users</p>}
                    </div>
                  </div>
                </div>

                {/* Real-time Socket Feed */}
                {liveFeed.length > 0 && (
                  <div className="card p-6 bg-brand-900 text-white shadow-xl animate-fade-in border-0">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-brand-300">
                      <Activity className="w-4 h-4" /> Live System Pulse
                    </h3>
                    <div className="space-y-3">
                      {liveFeed.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm animate-fade-up">
                          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                          <span className="text-brand-100/60 font-mono text-[10px]">
                            {new Date(f.timestamp).toLocaleTimeString()}
                          </span>
                          <p>
                            <span className="font-bold">{f.data.name || f.data.userName}</span>
                            {f.type === 'login' ? ' joined the session' : ` booked ${f.data.eventName}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Quick Actions */}
              <div className="space-y-6">
                <SectionHeader title="Pending Approvals" subtitle="Needs attention" />
                <div className="space-y-3">
                  {stats.pendingVendors > 0 && (
                    <div className="card p-4 bg-violet-50 border-violet-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-violet-700">{stats.pendingVendors} vendors waiting</span>
                      <Button onClick={() => setTab('users')} variant="ghost" className="text-xs text-violet-600">Review</Button>
                    </div>
                  )}
                  {pendingEvents.length > 0 && (
                    <div className="card p-4 bg-emerald-50 border-emerald-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-700">{pendingEvents.length} events waiting</span>
                      <Button onClick={() => setTab('events')} variant="ghost" className="text-xs text-emerald-600">Review</Button>
                    </div>
                  )}
                  {stats.pendingVendors === 0 && pendingEvents.length === 0 && (
                    <p className="text-sm text-ink-400 italic text-center py-4">No pending approvals! 🎉</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-6">
            <SectionHeader title="User management" subtitle="Manage all users and approve vendors" />
            {loadingUsers ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {users.map((u) => (
                  <div key={u.id} className="card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={u.name} />
                      <div>
                        <p className="font-semibold text-ink-900">{u.name}</p>
                        <p className="text-xs text-ink-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-ink-50">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-ink-400 uppercase font-bold tracking-wider">Role</span>
                        <StatusBadge status={u.role} />
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] text-ink-400 uppercase font-bold tracking-wider">Actions</span>
                        <div className="flex gap-2">
                           <Button 
                              variant="ghost" 
                              className="text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-auto"
                              onClick={() => {
                                if(confirm('Are you sure you want to remove this user?')) {
                                  deleteUser.mutate(u.id);
                                }
                              }}
                           >
                            Remove
                           </Button>
                           <StatusBadge status={u.approved ? 'approved' : 'pending'} />
                        </div>
                      </div>
                    </div>
                    {u.role === 'vendor' && !u.approved && (
                      <Button
                        onClick={() => handleApprove(u.id)}
                        loading={approveVendor.isPending}
                        className="w-full mt-4 justify-center py-2.5 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Vendor
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab — Filtered lists */}
        {tab === 'bookings' && (
          <div className="space-y-12">
            {/* Cancelled Bookings */}
            <div className="space-y-6">
              <SectionHeader title="Cancelled bookings" subtitle="Refunds or disputes may be pending" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookings.filter(b => b.status === 'cancelled').length === 0 ? (
                  <p className="text-sm text-ink-400 col-span-full italic">No cancelled bookings.</p>
                ) : (
                  bookings.filter(b => b.status === 'cancelled').map(b => (
                    <BookingAdminCard key={b.id} booking={b} />
                  ))
                )}
              </div>
            </div>

            {/* Completed Bookings (Past date) */}
            <div className="space-y-6">
              <SectionHeader title="Completed events" subtitle="Events that have already taken place" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookings.filter(b => b.status === 'confirmed' && new Date(b.eventDate) < new Date()).length === 0 ? (
                  <p className="text-sm text-ink-400 col-span-full italic">No completed events yet.</p>
                ) : (
                  bookings.filter(b => b.status === 'confirmed' && new Date(b.eventDate) < new Date()).map(b => (
                    <BookingAdminCard key={b.id} booking={b} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {tab === 'events' && (
          <div className="space-y-6">
            <SectionHeader title="Event approvals" subtitle="Review and approve vendor event submissions" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState icon="📅" title="No events" description="No events have been submitted yet." />
                </div>
              ) : (
                events.map((ev) => {
                  return (
                    <div key={ev.id} className="card p-5 flex flex-col gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-ink-900 leading-snug">{ev.name}</h3>
                          <StatusBadge status={ev.approved ? 'approved' : 'pending'} />
                        </div>
                        <p className="text-sm text-ink-500 line-clamp-2 mb-3">{ev.description}</p>
                        <div className="space-y-1.5 text-xs text-ink-400">
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {ev.location}</p>
                          <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {formatDate(ev.date)}</p>
                          <p className="flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> by {ev.vendor.name}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-ink-50 flex items-center justify-between">
                        <span className="font-bold text-ink-900">{formatPrice(ev.price)}</span>
                        {!ev.approved && (
                          <Button
                            onClick={() => handleApproveEvent(ev.id)}
                            className="text-xs px-4 py-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingAdminCard({ booking }: { booking: any }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-ink-900 leading-tight">{booking.eventName}</h3>
          <p className="text-xs text-ink-500 mt-1">Booked by {booking.userName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      
      <div className="space-y-2 text-xs text-ink-500">
        <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {formatDate(booking.eventDate)}</p>
        <div className="pt-2 border-t border-ink-50">
          <p className="font-semibold text-ink-700 mb-1">Services:</p>
          <ul className="list-disc list-inside">
            {booking.services.map((s: any, idx: number) => (
              <li key={idx} className="truncate">{s.serviceName}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-3 border-t border-ink-50 flex justify-between items-center">
        <span className="text-sm font-bold text-ink-900">{formatPrice(booking.totalPrice)}</span>
      </div>
    </div>
  );
}
