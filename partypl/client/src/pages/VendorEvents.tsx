import { useState } from 'react';
import { Plus, CalendarDays, MapPin, Info } from 'lucide-react';
import { useMyEvents, useCreateEvent, useDeleteEvent } from '@/lib/queries';
import {
  SectionHeader, EmptyState, SkeletonCard, Modal,
  Button, Input, Textarea, StatusBadge,
} from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function VendorEvents() {
  const [eventModal, setEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '', description: '', date: '', location: '', price: '0',
  });

  const { data: events = [], isLoading } = useMyEvents();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  async function handleCreateEvent() {
    if (!eventForm.name || !eventForm.date) {
      toast.error('Name and date are required');
      return;
    }
    try {
      await createEvent.mutateAsync({
        name: eventForm.name,
        description: eventForm.description || undefined,
        date: new Date(eventForm.date).toISOString(),
        location: eventForm.location || undefined,
        price: parseFloat(eventForm.price) || 0,
      });
      toast.success('Event submitted for approval!');
      setEventModal(false);
      setEventForm({ name: '', description: '', date: '', location: '', price: '0' });
    } catch {
      toast.error('Failed to submit event');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEvent.mutateAsync(id);
      toast.success('Event removed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove event');
    }
  }

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Header */}
      <div className="bg-ink-900 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-brand-400" />
          <div>
            <h1 className="font-display text-3xl mb-1">Event Management</h1>
            <p className="text-ink-400">Submit and track your hosted events</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <SectionHeader
          title="My events"
          subtitle={`${events.length} events submitted`}
          action={
            <Button onClick={() => setEventModal(true)}>
              <Plus className="w-4 h-4" /> Create new event
            </Button>
          }
        />

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="No events yet"
            description="Submit an event for admin approval. Once approved, it will be visible to all customers."
            action={
              <Button onClick={() => setEventModal(true)}>
                <Plus className="w-4 h-4" /> Create new event
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="card p-5 group hover:border-brand-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-ink-900 text-lg leading-tight group-hover:text-brand-600 transition-colors">
                    {ev.name}
                  </h3>
                  <StatusBadge status={ev.approved ? 'approved' : 'pending'} />
                </div>
                
                <div className="space-y-2.5 mb-5">
                  <p className="text-sm text-ink-600 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-brand-400" />
                    {formatDate(ev.date)}
                  </p>
                  {ev.location && (
                    <p className="text-sm text-ink-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      {ev.location}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-ink-900 pt-1">
                    Entry: {parseFloat(ev.price) === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(ev.price)}
                  </p>
                </div>

                {!ev.approved && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <Info className="w-3.5 h-3.5" />
                    Pending admin review
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-ink-50 flex items-center justify-between">
                  <span className="text-[10px] text-ink-400 uppercase font-bold tracking-wider">Actions</span>
                  <Button
                    variant="ghost"
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 h-auto disabled:opacity-30"
                    disabled={new Date(ev.date) > new Date()}
                    onClick={() => {
                      if(confirm('Are you sure you want to remove this event?')) {
                        handleDelete(ev.id);
                      }
                    }}
                    title={new Date(ev.date) > new Date() ? "Can only be removed after the event date" : ""}
                  >
                    Remove Event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add event modal */}
      <Modal open={eventModal} onClose={() => setEventModal(false)} title="Submit new event">
        <div className="space-y-4">
          <Input
            id="evtName"
            label="Event name *"
            value={eventForm.name}
            onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
            placeholder="Summer Wedding Showcase"
          />
          <Input
            id="evtDate"
            label="Event date *"
            type="datetime-local"
            value={eventForm.date}
            onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
          />
          <Input
            id="evtLocation"
            label="Location"
            value={eventForm.location}
            onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
            placeholder="Pune, Maharashtra"
          />
          <Input
            id="evtPrice"
            label="Entry price (₹)"
            type="number"
            value={eventForm.price}
            onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
            placeholder="0 for free"
            min="0"
          />
          <Textarea
            id="evtDesc"
            label="Description"
            value={eventForm.description}
            onChange={(v) => setEventForm({ ...eventForm, description: v })}
            placeholder="Describe the event…"
          />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setEventModal(false)} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} loading={createEvent.isPending} className="flex-1 justify-center">
              Submit for approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
