import { Link } from 'react-router-dom';
import {
  CalendarCheck, Star, MapPin, Plus, ArrowRight,
  TrendingUp, Clock, CheckCircle, XCircle, Store, CalendarDays,
  Printer, Download, FileText, Crown,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookings, useCancelBooking, useMyServices, useMyEvents } from '@/lib/queries';
import {
  StatusBadge, EmptyState, SkeletonCard, SectionHeader, Button, Modal,
} from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Booking } from '@/types';
import { useState, useRef } from 'react';

function StatCard({
  icon: Icon, value, label, subLabel, color, trend,
}: { icon: React.ElementType; value: string | number; label: string; subLabel?: string; color: string; trend?: string }) {
  return (
    <div className="card p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-ink-900 text-white rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-display text-ink-900">{value}</p>
          {subLabel && <span className="text-xs text-ink-400 font-medium">{subLabel}</span>}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-ink-500 mt-1">{label}</p>
      </div>
      {/* Decorative element */}
      <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-ink-900/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();
  const { data: myServices = [] } = useMyServices();
  const { data: myEvents = [] } = useMyEvents();
  const cancelBooking = useCancelBooking();
  const [viewReceipt, setViewReceipt] = useState<Booking | null>(null);

  async function handleCancel(id: string) {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelBooking.mutateAsync(id);
      toast.success('Booking cancelled');
    } catch {
      toast.error('Failed to cancel booking');
    }
  }

  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pending = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Hero header */}
      <div className="bg-ink-900 text-white px-4 py-16 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">{user?.role} Control Center</p>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl">
              Hello, <span className="text-brand-400">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-md">Welcome back to your event management hub. Here's what's happening today.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {user?.role === 'vendor' ? (
              <>
                <Link to="/vendor/services" className="btn-secondary bg-white/5 border-white/10 text-white hover:bg-white/10 px-6 py-3">
                  <Store className="w-4 h-4 text-brand-400" /> Manage Services
                </Link>
                <Link to="/vendor/events" className="btn-primary px-6 py-3 shadow-lg shadow-brand-500/20">
                  <CalendarDays className="w-4 h-4" /> New Event
                </Link>
              </>
            ) : (
              <Link to="/services" className="btn-primary px-8 py-4 shadow-xl shadow-brand-500/30 text-lg">
                <Plus className="w-5 h-5" /> Book a Service
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={CalendarCheck} 
            value={bookings.length} 
            label="Total Bookings" 
            subLabel="+2 this week"
            trend="Active"
            color="bg-brand-50 text-brand-600" 
          />
          <StatCard 
            icon={CheckCircle} 
            value={confirmed} 
            label="Confirmed" 
            subLabel="Ready to go"
            trend="Upcoming"
            color="bg-emerald-50 text-emerald-600" 
          />
          <StatCard 
            icon={Clock} 
            value={pending} 
            label="Pending" 
            subLabel="Action required"
            trend="Needs Review"
            color="bg-amber-50 text-amber-600" 
          />
          {user?.role === 'vendor'
            ? <StatCard icon={TrendingUp} value={myServices.length} label="Active Services" trend="Fully Booked" color="bg-violet-50 text-violet-600" />
            : <StatCard icon={Star} value="4.9" label="Avg Rating" trend="Top Client" color="bg-rose-50 text-rose-600" />}
        </div>

        {/* Vendor extras */}
        {user?.role === 'vendor' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* My services summary */}
            <div className="card p-8 group hover:shadow-xl transition-all duration-300">
              <SectionHeader
                title="My Services"
                subtitle="High-performing listings"
                action={
                  <Link to="/vendor/services" className="btn-ghost text-xs uppercase tracking-widest font-bold text-brand-600 hover:bg-brand-50">
                    Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                }
              />
              {myServices.length === 0 ? (
                <p className="text-ink-400 text-sm py-8 text-center italic">No services yet. Add your first one!</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {myServices.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-ink-100 hover:bg-ink-50 transition-all group/item">
                      <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-ink-400 group-hover/item:text-brand-500 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-900 font-bold truncate">{s.name}</p>
                        <p className="text-xs text-ink-500">{s.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-600 font-bold">{formatPrice(s.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My events summary */}
            <div className="card p-8 group hover:shadow-xl transition-all duration-300">
              <SectionHeader
                title="My Events"
                subtitle="Latest event submissions"
                action={
                  <Link to="/vendor/events" className="btn-ghost text-xs uppercase tracking-widest font-bold text-brand-600 hover:bg-brand-50">
                    All Events <Plus className="w-3.5 h-3.5 ml-1" />
                  </Link>
                }
              />
              {myEvents.length === 0 ? (
                <p className="text-ink-400 text-sm py-8 text-center italic">No events yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {myEvents.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-ink-100 hover:bg-ink-50 transition-all group/item">
                      <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center shrink-0 overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop`} 
                          alt="" 
                          className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ink-900 font-bold truncate">{ev.name}</p>
                        <p className="text-xs text-ink-500">{formatDate(ev.date)}</p>
                      </div>
                      <StatusBadge status={ev.approved ? 'approved' : 'pending'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings / Live Activity Feed */}
        <div className="space-y-8">
          <div className="flex items-end justify-between">
            <SectionHeader
              title="Activity Feed"
              subtitle="Real-time booking updates"
            />
            <div className="pb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </div>
          </div>

          {loadingBookings ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="card border-dashed border-2 p-12 text-center">
              <EmptyState
                icon="🎟️"
                title="No recent activity"
                description="Start planning your next masterpiece today."
                action={
                  <Link to="/services" className="btn-primary px-8 py-3">
                    Discover Services
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="card p-6 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-ink-900 flex items-center justify-center text-white font-bold text-xs">
                        {booking.eventName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors">{booking.eventName}</h3>
                        <p className="text-[10px] text-ink-400 uppercase tracking-widest font-bold">Booking #{booking.id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-ink-50/50 rounded-xl p-3 border border-ink-100/50">
                      <p className="text-[10px] text-ink-400 uppercase font-black mb-1">Date</p>
                      <p className="text-xs font-bold text-ink-700 flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-brand-500" />
                        {formatDate(booking.eventDate)}
                      </p>
                    </div>
                    <div className="bg-ink-50/50 rounded-xl p-3 border border-ink-100/50">
                      <p className="text-[10px] text-ink-400 uppercase font-black mb-1">Total</p>
                      <p className="text-xs font-bold text-ink-900">{formatPrice(booking.totalPrice)}</p>
                    </div>
                  </div>

                  {booking.services && booking.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {booking.services.map((s) => (
                        <span
                          key={s.id || (s as any)._id}
                          className="text-[10px] font-bold uppercase tracking-tight bg-ink-100 text-ink-600 px-2.5 py-1 rounded-md border border-ink-200/50"
                        >
                          {s.serviceName}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-ink-50">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-ink-200" />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-brand-600 hover:bg-brand-50 text-[10px] font-black uppercase tracking-widest px-3"
                        onClick={() => setViewReceipt(booking)}
                      >
                        <FileText className="w-3.5 h-3.5" /> Receipt
                      </Button>
                      {booking.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          className="text-ink-400 hover:text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest px-3"
                          onClick={() => handleCancel(booking.id)}
                          loading={cancelBooking.isPending}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReceiptModal 
        booking={viewReceipt} 
        onClose={() => setViewReceipt(null)} 
      />
    </div>
  );
}

function ReceiptModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal open={!!booking} onClose={onClose} title="Booking Receipt" size="lg">
      <div className="space-y-6">
        {/* Receipt UI */}
        <div 
          ref={receiptRef}
          id="printable-receipt"
          className="bg-white p-10 border border-ink-100 rounded-2xl shadow-xl space-y-10 relative overflow-hidden"
        >
          {/* PAID Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] rotate-[-35deg] select-none">
            <p className="text-[180px] font-black border-[20px] border-emerald-600 text-emerald-600 px-10 leading-none">PAID</p>
          </div>

          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 -translate-y-1/2 translate-x-1/2 rounded-full" />

          {/* Receipt Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-ink-900 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <Crown className="w-7 h-7 text-brand-400" />
                </div>
                <div>
                  <h2 className="font-display text-3xl text-ink-900 leading-none">PartyPlus</h2>
                  <p className="text-[10px] text-brand-600 uppercase tracking-[0.2em] font-bold mt-1">Premium Celebrations</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-ink-400 uppercase tracking-widest font-bold">Billed To</p>
                <p className="font-semibold text-ink-900">{booking.userId.slice(0, 8)}... (Customer)</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="inline-block px-3 py-1 bg-ink-900 text-white text-[10px] font-bold rounded-full mb-2 uppercase tracking-tighter">Official Receipt</div>
              <p className="text-sm font-black text-ink-900">#REC-{booking.id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-ink-500">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-ink-100 to-transparent" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-ink-400 uppercase font-black tracking-widest mb-1.5">Event Information</p>
                <p className="font-bold text-ink-900 text-xl leading-tight">{booking.eventName}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-ink-600">
                  <CalendarDays className="w-4 h-4 text-brand-500" />
                  {formatDate(booking.eventDate)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-ink-600">
                  <Clock className="w-4 h-4 text-brand-500" />
                  19:00 PM
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <p className="text-[10px] text-ink-400 uppercase font-black tracking-widest mb-2">Booking Status</p>
                <StatusBadge status={booking.status} />
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                <CheckCircle className="w-3.5 h-3.5" /> Fully Paid
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="space-y-4">
            <p className="text-[10px] text-ink-400 uppercase font-black tracking-widest px-1">Order Breakdown</p>
            <div className="border border-ink-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-900 text-white/90">
                    <th className="text-left py-4 px-6 font-semibold uppercase text-[10px] tracking-widest">Description</th>
                    <th className="text-right py-4 px-6 font-semibold uppercase text-[10px] tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {booking.services && booking.services.length > 0 ? (
                    booking.services.map((s, idx) => (
                      <tr key={s.id || (s as any)._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-ink-50/30'}>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-ink-900">{s.serviceName}</p>
                          <p className="text-[10px] text-ink-400">Professional Service Provision</p>
                        </td>
                        <td className="py-4 px-6 text-right text-ink-900 font-bold">{formatPrice(s.servicePrice)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-ink-900">Event Booking Fee</p>
                        <p className="text-[10px] text-ink-400">Standard Access Pass</p>
                      </td>
                      <td className="py-4 px-6 text-right text-ink-900 font-bold">{formatPrice(booking.totalPrice)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-brand-50/30 border-t-2 border-brand-100">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-ink-900 text-lg">Total Amount</span>
                        <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded font-bold">PAID</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right font-black text-brand-600 text-2xl tracking-tighter">{formatPrice(booking.totalPrice)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end pt-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-ink-900 italic">PartyPlus Celebrations Inc.</p>
              <p className="text-[10px] text-ink-400">Mumbai, Maharashtra • support@partyplus.com</p>
            </div>
            <div className="text-right space-y-4">
              <div className="space-y-1">
                <div className="w-24 h-px bg-ink-200 ml-auto" />
                <p className="text-[10px] text-ink-500 uppercase font-bold tracking-tighter">Digital Signature</p>
              </div>
              <p className="text-[10px] text-ink-300 italic max-w-[200px]">
                This is a secure computer-generated document. Verification ID: {booking.id}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center py-3">
            Close
          </Button>
          <Button onClick={handlePrint} className="flex-1 justify-center gap-3 py-3 shadow-lg shadow-brand-500/20">
            <Download className="w-5 h-5" /> Export PDF
          </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0; background: white; }
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            border: none !important;
            box-shadow: none !important;
            padding: 40px !important;
            margin: 0 !important;
          }
          .modal-overlay { background: white !important; }
        }
      `}} />
    </Modal>
  );
}
