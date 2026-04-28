import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  User, Service, Event, Booking, AdminStats, ApiResponse
} from '@/types';

// ─── Auth ──────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<null> & { user: User }>('/auth/me');
      return res.data.user;
    },
    retry: false,
  });
}

// ─── Services ──────────────────────────────────────────────────
export function useServices(category?: string) {
  return useQuery({
    queryKey: ['services', category],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Service[]>>('/services', {
        params: category ? { category } : {},
      });
      return res.data.data ?? [];
    },
  });
}

export function useMyServices() {
  return useQuery({
    queryKey: ['services', 'mine'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Service[]>>('/services/mine');
      return res.data.data ?? [];
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      price: number;
      description?: string;
    }) => {
      const res = await api.post<ApiResponse<Service>>('/services', data);
      return res.data.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// ─── Events ────────────────────────────────────────────────────
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Event[]>>('/events');
      return res.data.data ?? [];
    },
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Event[]>>('/events/all');
      return res.data.data ?? [];
    },
  });
}

export function useMyEvents() {
  return useQuery({
    queryKey: ['events', 'mine'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Event[]>>('/events/mine');
      return res.data.data ?? [];
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      date: string;
      location?: string;
      price: number;
    }) => {
      const res = await api.post<ApiResponse<Event>>('/events', data);
      return res.data.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

// ─── Bookings ──────────────────────────────────────────────────
export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Booking[]>>('/bookings');
      return res.data.data ?? [];
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      eventName: string;
      eventDate: string;
      services: { id?: string; name: string; price: number }[];
      totalPrice: number;
      notes?: string;
    }) => {
      const res = await api.post<ApiResponse<Booking>>('/bookings', data);
      return res.data.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// ─── Admin ─────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminStats>>('/users/stats');
      return res.data.data!;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>('/users');
      return res.data.data ?? [];
    },
  });
}

export function useApproveVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/users/${id}/approve`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>('/users/vendors');
      return res.data.data ?? [];
    },
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ bookings: any[], users: any[] }>>('/users/activity');
      return res.data.data;
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Booking[]>>('/bookings/all');
      return res.data.data ?? [];
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
