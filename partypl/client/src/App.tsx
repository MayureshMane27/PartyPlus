import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Services from '@/pages/Services';
import Events from '@/pages/Events';
import Vendors from '@/pages/Vendors';
import VendorServices from '@/pages/VendorServices';
import VendorEvents from '@/pages/VendorEvents';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 min
      gcTime: 1000 * 60 * 5,      // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/events" element={<Events />} />
              <Route path="/vendors" element={<Vendors />} />

              {/* Protected — any authenticated user */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected — vendor only */}
              <Route
                path="/vendor/services"
                element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor/events"
                element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorEvents />
                  </ProtectedRoute>
                }
              />

              {/* Protected — admin only */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-ink-900 text-ink-500 text-sm px-4 py-6 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} PartyPlus. All rights reserved.</p>
              <p>Built with Hono · Mongoose · MongoDB · React</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #e7e5e4',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
