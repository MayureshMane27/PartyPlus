import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl text-brand-200 mb-4">404</p>
        <h1 className="font-display text-3xl text-ink-900 mb-3">Page not found</h1>
        <p className="text-ink-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}
