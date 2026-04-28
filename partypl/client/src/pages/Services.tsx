import { useState } from 'react';
import { Search, Zap, Utensils, Palette, Camera, Music, Home } from 'lucide-react';
import { useServices, useCreateBooking } from '@/lib/queries';
import {
  CategoryBadge, EmptyState, SkeletonCard,
  SectionHeader, Modal, Button, Input, Textarea,
} from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { Service } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'venue', label: '🏛️ Venue' },
  { value: 'catering', label: '🍽️ Catering' },
  { value: 'decoration', label: '🎨 Decoration' },
  { value: 'photography', label: '📸 Photography' },
  { value: 'entertainment', label: '🎵 Entertainment' },
];

export default function Services() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingForm, setBookingForm] = useState({
    eventName: '', eventDate: '', notes: '',
  });

  const { data: services = [], isLoading } = useServices(category || undefined);
  const createBooking = useCreateBooking();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.vendor.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleBook() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!bookingService) return;
    if (!bookingForm.eventName || !bookingForm.eventDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createBooking.mutateAsync({
        eventName: bookingForm.eventName,
        eventDate: new Date(bookingForm.eventDate).toISOString(),
        services: [{ id: bookingService.id, name: bookingService.name, price: parseFloat(bookingService.price) }],
        totalPrice: parseFloat(bookingService.price),
        notes: bookingForm.notes,
      });
      toast.success('Booking confirmed! 🎉');
      setBookingService(null);
      setBookingForm({ eventName: '', eventDate: '', notes: '' });
      navigate('/dashboard');
    } catch {
      toast.error('Failed to create booking');
    }
  }

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Browse services"
            subtitle="Find the perfect vendors for your event"
          />

          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                className="input pl-10"
                placeholder="Search services or vendors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    category === c.value
                      ? 'bg-ink-900 text-white border-ink-900'
                      : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No services found"
            description="Try adjusting your search or category filter."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={() => setBookingService(service)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking modal */}
      <Modal
        open={!!bookingService}
        onClose={() => setBookingService(null)}
        title={`Book: ${bookingService?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm">
            <p className="text-ink-600">Service by <span className="font-medium">{bookingService?.vendor.name}</span></p>
            <p className="text-brand-700 font-semibold text-base mt-1">{formatPrice(bookingService?.price ?? '0')}</p>
          </div>

          <Input
            id="eventName"
            label="Event name *"
            value={bookingForm.eventName}
            onChange={(e) => setBookingForm({ ...bookingForm, eventName: e.target.value })}
            placeholder="My birthday party"
            required
          />

          <Input
            id="eventDate"
            label="Event date *"
            type="date"
            value={bookingForm.eventDate}
            onChange={(e) => setBookingForm({ ...bookingForm, eventDate: e.target.value })}
            required
          />

          <Textarea
            id="notes"
            label="Notes (optional)"
            value={bookingForm.notes}
            onChange={(v) => setBookingForm({ ...bookingForm, notes: v })}
            placeholder="Any special requirements…"
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setBookingService(null)} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button onClick={handleBook} loading={createBooking.isPending} className="flex-1 justify-center">
              Confirm booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ServiceCard({ service, onBook }: { service: Service; onBook: () => void }) {
  const Icon = categoryIcons[service.category as keyof typeof categoryIcons] || Zap;

  return (
    <div className="card p-6 flex flex-col gap-6 group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      {/* Decorative background icon */}
      <Icon className="absolute -right-4 -top-4 w-24 h-24 text-ink-900/[0.03] group-hover:text-brand-500/[0.05] transition-colors -rotate-12" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-400 group-hover:text-brand-600 transition-colors">
              {service.category}
            </span>
          </div>
          <h3 className="font-display text-2xl text-ink-900 group-hover:text-brand-600 transition-colors leading-tight">
            {service.name}
          </h3>
          <p className="text-xs font-bold text-ink-400 mt-1 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-ink-300" />
            by {service.vendor.name}
          </p>
        </div>
        <CategoryBadge category={service.category} />
      </div>

      {service.description && (
        <div className="relative z-10">
          <p className="text-sm text-ink-500 leading-relaxed line-clamp-3 italic opacity-80 group-hover:opacity-100 transition-opacity">
            "{service.description}"
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-ink-50 relative z-10">
        <div>
          <p className="text-[9px] text-ink-400 uppercase font-black tracking-widest mb-0.5">Starting At</p>
          <span className="text-xl font-black text-ink-900">{formatPrice(service.price)}</span>
        </div>
        <Button 
          onClick={onBook} 
          className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}

const categoryIcons = {
  venue: Home,
  catering: Utensils,
  decoration: Palette,
  photography: Camera,
  entertainment: Music,
};
