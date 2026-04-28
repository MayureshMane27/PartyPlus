import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, MapPin, Camera, Music,
  UtensilsCrossed, Building2, Palette, Sparkles, CalendarDays,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const services = [
  { icon: Building2, label: 'Venue', desc: 'Premium spaces for every occasion', color: 'bg-orange-50 text-orange-600' },
  { icon: UtensilsCrossed, label: 'Catering', desc: 'Gourmet menus from top chefs', color: 'bg-rose-50 text-rose-600' },
  { icon: Palette, label: 'Decoration', desc: 'Stunning setups & custom themes', color: 'bg-violet-50 text-violet-600' },
  { icon: Camera, label: 'Photography', desc: 'Capture every precious moment', color: 'bg-sky-50 text-sky-600' },
  { icon: Music, label: 'Entertainment', desc: 'Live music, DJ & performances', color: 'bg-emerald-50 text-emerald-600' },
];

const stats = [
  { value: '500+', label: 'Verified vendors' },
  { value: '12k+', label: 'Events planned' },
  { value: '4.9★', label: 'Average rating' },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white px-4">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'url("/hero-bg.png")' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/20 via-white/80 to-white pointer-events-none" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-brand-200 rounded-full blur-[100px] opacity-30 floating pointer-events-none" />
        <div className="absolute bottom-20 left-[10%] w-72 h-72 bg-orange-200 rounded-full blur-[100px] opacity-30 floating animation-delay-500 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto w-full py-20 text-center md:text-left grid lg:grid-cols-2 items-center gap-12">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
              <Sparkles className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
              Revolutionizing event planning in India
            </div>

            <h1 className="section-title mb-6 text-balance">
              Plan your dream <br/>
              <span className="text-gradient">event</span>, effortlessly.
            </h1>

            <p className="text-lg md:text-xl text-ink-500 mb-10 max-w-xl leading-relaxed">
              Connect with top-tier vendors for venues, catering, decoration, and more. All the magic, none of the stress.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/services" className="btn-primary px-8 py-4 text-lg">
                Explore services <ArrowRight className="w-5 h-5" />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn-secondary px-8 py-4 text-lg">
                  Join as a Vendor
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 flex flex-wrap justify-center md:justify-start gap-x-12 gap-y-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl text-ink-900">{s.value}</p>
                  <p className="text-sm text-ink-500 font-medium tracking-wide uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative">
             <div className="glass-card p-2 rounded-[2.5rem] relative z-10 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" 
                  alt="Party Celebration" 
                  className="rounded-[2rem] w-full h-[500px] object-cover"
                />
             </div>
             <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-500 rounded-2xl -z-10 animate-pulse" />
             <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-brand-200 rounded-full -z-10" />
          </div>
        </div>
      </section>

      {/* Services Section with improved cards */}
      <section className="py-32 px-4 bg-ink-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-sm font-bold text-brand-600 uppercase tracking-widest mb-4">
                Categories
              </p>
              <h2 className="section-title">Everything you need</h2>
            </div>
            <Link to="/services" className="text-brand-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map(({ icon: Icon, label, desc, color }, idx) => (
              <Link
                key={label}
                to={`/services?category=${label.toLowerCase()}`}
                className={`group glass-card p-8 flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-all duration-300 animate-fade-up animation-delay-${(idx + 1) * 100}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color} shadow-inner group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-ink-900 text-lg mb-2">{label}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works with premium visuals */}
      <section className="py-32 px-4 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="section-title mb-4 text-gradient">How PartyPlus works</h2>
            <p className="text-ink-500 max-w-lg mx-auto">Planning an event has never been this simple and elegant.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Browse vendors', desc: 'Curated selection of top-tier professionals in your city.', icon: Star },
              { step: '02', title: 'Seamless Booking', desc: 'Book with confidence through our secure and easy platform.', icon: CalendarDays },
              { step: '03', title: 'Memorable Events', desc: 'Enjoy your special day while we handle the details.', icon: Music },
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="text-9xl font-display text-brand-50 absolute -top-10 -left-4 pointer-events-none opacity-50">
                  {item.step}
                </div>
                <div className="relative">
                   <h3 className="font-bold text-xl text-ink-900 mb-3">{item.title}</h3>
                   <p className="text-ink-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="py-24 px-4 bg-ink-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-900/20 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-5xl md:text-7xl mb-8 leading-tight">
            Ready to host an <br/>
            <span className="text-brand-400">unforgettable</span> day?
          </h2>
          <p className="text-ink-400 text-xl mb-12 max-w-2xl mx-auto">
            Join the elite circle of event planners and hosts. Your dream celebration starts with a single click.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to={isAuthenticated ? '/services' : '/register'}
              className="inline-flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-brand-500/20 active:scale-95"
            >
              {isAuthenticated ? 'Start Exploring' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
