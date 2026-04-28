import { useState, useEffect } from 'react';
import { MapPin, Calendar, Search, Tag, Share2 } from 'lucide-react';
import { useEvents, useServices, useCreateBooking } from '@/lib/queries';
import {
  EmptyState, SkeletonCard, SectionHeader, Modal, Button,
} from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Event, Service } from '@/types';

export default function Events() {
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: events = [], isLoading } = useEvents();
  const [searchParams] = useState(new URLSearchParams(window.location.search));

  // Handle deep-linking to an event via ?id=...
  useEffect(() => {
    const eventId = searchParams.get('id');
    if (eventId && events.length > 0) {
      const found = events.find(e => e.id === eventId);
      if (found) setSelectedEvent(found);
    }
  }, [events, searchParams]);

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase()) ||
    e.vendor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Upcoming events"
            subtitle="Discover events near you"
          />
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              className="input pl-10"
              placeholder="Search events, locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
            icon="🎪"
            title="No events found"
            description={search ? 'Try a different search term.' : 'No events are currently listed. Check back soon!'}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onClick={() => setSelectedEvent(event)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const isPast = new Date(event.date) < new Date();
  
  // Random image placeholder based on event name or just a set
  const images = [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1514525253361-bee8a487409e?w=1200&h=800&fit=crop',
  ];
  const image = images[Math.abs(event.name.length) % images.length];

  return (
    <div 
      onClick={onClick}
      className={`group card overflow-hidden flex flex-col cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isPast ? 'brightness-[0.85]' : ''}`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Date Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 border border-white/20 rounded-2xl px-3 py-2 text-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
          <p className="text-xl font-black text-ink-900 leading-none">
            {new Date(event.date).getDate()}
          </p>
          <p className="text-[10px] text-brand-600 font-black uppercase tracking-widest mt-0.5">
            {new Date(event.date).toLocaleString('en-IN', { month: 'short' })}
          </p>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-brand-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
            {event.price === '0' ? 'Free' : 'Premium'}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
            {event.name.toLowerCase().includes('wedding') ? 'Wedding' : event.name.toLowerCase().includes('party') ? 'Party' : 'Corporate'}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-ink-500 bg-ink-50 px-2 py-0.5 rounded border border-ink-100">
            Popular
          </span>
        </div>

        <h3 className="font-display text-2xl text-ink-900 group-hover:text-brand-600 transition-colors leading-tight mb-2">
          {event.name}
        </h3>
        
        {event.description && (
          <p className="text-sm text-ink-500 leading-relaxed line-clamp-2 mb-4 italic">"{event.description}"</p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex flex-col gap-2 border-t border-ink-50 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-600">
              <div className="w-6 h-6 rounded-lg bg-ink-50 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
              </div>
              <span className="truncate">{event.location || 'Secret Location'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-ink-400">
              <div className="w-6 h-6 rounded-lg bg-ink-50 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-ink-300" />
              </div>
              <span>Hosted by <span className="text-ink-600 font-black">{event.vendor.name}</span></span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-[9px] text-ink-400 uppercase font-black tracking-widest mb-0.5">Starting From</p>
              <span className="text-xl font-black text-ink-900">
                {parseFloat(event.price) === 0 ? 'FREE' : formatPrice(event.price)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                className="w-10 h-10 p-0 rounded-full border border-ink-100 hover:bg-brand-50 hover:border-brand-200 text-ink-400 hover:text-brand-600 flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `${window.location.origin}/events?id=${event.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Link copied to clipboard!');
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 group-hover:bg-ink-900 transition-colors">
                Book Ticket
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventDetailModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const { data: allServices = [] } = useServices();
  const { isAuthenticated } = useAuthStore();
  const createBooking = useCreateBooking();
  const navigate = useNavigate();

  if (!event) return null;

  const totalPrice = parseFloat(event.price) + selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);

  const toggleService = (service: Service) => {
    setSelectedServices(prev => 
      prev.find(s => s.id === service.id) 
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  async function handleBook() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!event) return;

    try {
      await createBooking.mutateAsync({
        eventName: event.name,
        eventDate: event.date,
        services: selectedServices.map(s => ({ id: s.id, name: s.name, price: parseFloat(s.price) })),
        totalPrice,
        notes: `Booked via Events page. Included ${selectedServices.length} extra services.`,
      });
      toast.success('Booking confirmed! 🎉');
      onClose();
      navigate('/dashboard');
    } catch {
      toast.error('Failed to create booking');
    }
  }

  return (
    <Modal open={!!event} onClose={onClose} title={event.name} size="lg">
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-ink-50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-ink-600 text-sm">
                <Calendar className="w-4 h-4 text-brand-500" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-2 text-ink-600 text-sm">
                <MapPin className="w-4 h-4 text-brand-500" />
                {event.location || 'Location to be announced'}
              </div>
              <div className="flex items-center gap-2 text-ink-600 text-sm">
                <Tag className="w-4 h-4 text-brand-500" />
                Hosted by {event.vendor.name}
              </div>
              <div className="pt-2 text-xl font-bold text-ink-900">
                {parseFloat(event.price) === 0 ? 'Free Entry' : formatPrice(event.price)}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-ink-900 mb-2">About this event</h4>
              <p className="text-sm text-ink-600 leading-relaxed">
                {event.description || 'No description provided for this event.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-ink-900">Add extra services (Custom Event)</h4>
            <p className="text-xs text-ink-500 mb-3">Enhance your experience by adding premium services to your booking.</p>
            
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {allServices.length === 0 ? (
                <p className="text-xs text-ink-400 py-4 text-center">No extra services available</p>
              ) : (
                allServices.map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer',
                      selectedServices.find(s => s.id === service.id)
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-ink-100 hover:border-ink-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                        selectedServices.find(s => s.id === service.id) ? 'bg-brand-500 border-brand-500' : 'border-ink-300'
                      )}>
                        {selectedServices.find(s => s.id === service.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{service.name}</p>
                        <p className="text-xs text-ink-500">{service.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-ink-700">{formatPrice(service.price)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-ink-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold">Total Amount</p>
            <p className="text-2xl font-bold text-ink-900">{formatPrice(totalPrice)}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleBook} 
              loading={createBooking.isPending}
              className="px-8"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
