export type Role = 'user' | 'vendor' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type ServiceCategory =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'photography'
  | 'entertainment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  approved: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: string;
  description?: string;
  createdAt: string;
  vendor: { id: string; name: string };
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  price: string;
  approved: boolean;
  createdAt: string;
  vendor: { id: string; name: string };
}

export interface BookingServiceItem {
  id: string;
  serviceId?: string;
  serviceName: string;
  servicePrice: number;
}

export interface Booking {
  id: string;
  userId: string;
  eventName: string;
  eventDate: string;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  services: BookingServiceItem[];
}

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalBookings: number;
  confirmedBookings: number;
  totalEvents: number;
  pendingEvents: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
}
