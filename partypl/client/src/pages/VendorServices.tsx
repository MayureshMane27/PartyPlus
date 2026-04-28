import { useState } from 'react';
import { Plus, Trash2, Edit3, Package } from 'lucide-react';
import {
  useMyServices, useCreateService, useDeleteService,
  useMyEvents, useCreateEvent,
} from '@/lib/queries';
import {
  SectionHeader, EmptyState, SkeletonCard, Modal,
  Button, Input, Select, Textarea, CategoryBadge, StatusBadge,
} from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  { value: 'venue', label: '🏛️ Venue' },
  { value: 'catering', label: '🍽️ Catering' },
  { value: 'decoration', label: '🎨 Decoration' },
  { value: 'photography', label: '📸 Photography' },
  { value: 'entertainment', label: '🎵 Entertainment' },
];

export default function VendorServices() {
  const [serviceModal, setServiceModal] = useState(false);

  const [serviceForm, setServiceForm] = useState({
    name: '', category: 'venue', price: '', description: '',
  });

  const { data: services = [], isLoading: loadingServices } = useMyServices();
  const createService = useCreateService();
  const deleteService = useDeleteService();

  async function handleCreateService() {
    if (!serviceForm.name || !serviceForm.price) {
      toast.error('Name and price are required');
      return;
    }
    try {
      await createService.mutateAsync({
        name: serviceForm.name,
        category: serviceForm.category as Parameters<typeof createService.mutateAsync>[0]['category'],
        price: parseFloat(serviceForm.price),
        description: serviceForm.description || undefined,
      });
      toast.success('Service added!');
      setServiceModal(false);
      setServiceForm({ name: '', category: 'venue', price: '', description: '' });
    } catch {
      toast.error('Failed to add service');
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm('Delete this service?')) return;
    try {
      await deleteService.mutateAsync(id);
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete service');
    }
  }

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Header */}
      <div className="bg-ink-900 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-3xl mb-1">Service Management</h1>
          <p className="text-ink-400">Manage your offerings and pricing</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <SectionHeader
          title="My services"
          subtitle={`${services.length} listed`}
          action={
            <Button onClick={() => setServiceModal(true)}>
              <Plus className="w-4 h-4" /> Add service
            </Button>
          }
        />

        {loadingServices ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No services yet"
            description="Add your first service to start receiving bookings."
            action={
              <Button onClick={() => setServiceModal(true)}>
                <Plus className="w-4 h-4" /> Add service
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-ink-900">{s.name}</h3>
                    <p className="text-sm text-ink-500 mt-0.5">{formatDate(s.createdAt)}</p>
                  </div>
                  <CategoryBadge category={s.category} />
                </div>
                {s.description && (
                  <p className="text-sm text-ink-500 leading-relaxed mb-3 line-clamp-2">{s.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-ink-50">
                  <span className="font-semibold text-ink-900">{formatPrice(s.price)}</span>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 text-sm px-3"
                    onClick={() => handleDeleteService(s.id)}
                    loading={deleteService.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add service modal */}
      <Modal open={serviceModal} onClose={() => setServiceModal(false)} title="Add new service">
        <div className="space-y-4">
          <Input
            id="svcName"
            label="Service name *"
            value={serviceForm.name}
            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
            placeholder="Professional Photography"
          />
          <Select
            id="svcCat"
            label="Category *"
            value={serviceForm.category}
            onChange={(v) => setServiceForm({ ...serviceForm, category: v })}
            options={CATEGORY_OPTIONS}
          />
          <Input
            id="svcPrice"
            label="Price (₹) *"
            type="number"
            value={serviceForm.price}
            onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
            placeholder="5000"
            min="0"
          />
          <Textarea
            id="svcDesc"
            label="Description"
            value={serviceForm.description}
            onChange={(v) => setServiceForm({ ...serviceForm, description: v })}
            placeholder="Describe what you offer…"
          />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setServiceModal(false)} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button onClick={handleCreateService} loading={createService.isPending} className="flex-1 justify-center">
              Add service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
