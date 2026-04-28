import { useState } from 'react';
import { Search, Store, Calendar } from 'lucide-react';
import { useVendors } from '@/lib/queries';
import { Avatar, EmptyState, SkeletonCard, SectionHeader } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export default function Vendors() {
  const [search, setSearch] = useState('');
  const { data: vendors = [], isLoading } = useVendors();

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fffbf7]">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Verified vendors"
            subtitle={`${vendors.length} vendors on PartyPlus`}
          />
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              className="input pl-10"
              placeholder="Search vendors…"
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
            icon="🏪"
            title="No vendors found"
            description="Try a different search term."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((vendor) => (
              <div key={vendor.id} className="card p-6 flex flex-col gap-4 group">
                <div className="flex items-center gap-4">
                  <Avatar name={vendor.name} className="w-12 h-12 text-base" />
                  <div>
                    <h3 className="font-semibold text-ink-900 group-hover:text-brand-600 transition-colors">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-ink-500">{vendor.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-ink-400">
                  <Store className="w-3.5 h-3.5" />
                  <span>Verified vendor</span>
                  <span className="mx-1">·</span>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(vendor.createdAt ?? '')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
