'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, Zap, Globe, Shield, BarChart3, Clock,
  ArrowRight, ChevronRight, Star, Check, TrendingUp
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TrackingInput from '@/components/tracking/TrackingInput';
import { useRouter } from 'next/navigation';

const STATS = [
  { value: '50M+', label: 'Shipments Tracked' },
  { value: '500+', label: 'Carriers Supported' },
  { value: '99.9%', label: 'API Uptime' },
  { value: '<2s', label: 'Avg Response Time' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Real-Time Updates',
    desc: 'Live tracking data from FedEx, UPS, USPS, DHL, and 500+ carriers worldwide.',
  },
  {
    icon: Globe,
    title: 'Live Map Visualization',
    desc: 'See exactly where your package is on an interactive map with route history.',
  },
  {
    icon: Shield,
    title: 'Smart Notifications',
    desc: 'Get instant alerts for delivery attempts, delays, and successful deliveries.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Track all your shipments in one place with insights and delivery performance.',
  },
  {
    icon: Clock,
    title: 'Delivery Predictions',
    desc: 'AI-powered ETA predictions based on carrier data and historical patterns.',
  },
  {
    icon: TrendingUp,
    title: 'Invoice Generation',
    desc: 'Auto-generate professional PDF invoices for every shipment instantly.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Ops Manager @ Bellford',
    text: 'TrackFlow replaced 3 different tools we were using. Real-time data, beautiful UI — it just works.',
    stars: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'E-commerce Director @ Luxe Co.',
    text: 'Our WISMO tickets dropped 60% in the first month. Customers can track themselves now.',
    stars: 5,
  },
  {
    name: 'Priya Kapoor',
    role: 'Logistics Lead @ Freightwell',
    text: 'The map view alone is worth it. Our clients love seeing live package movement.',
    stars: 5,
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mo',
    desc: 'For individuals and small teams',
    features: ['100 trackings/month', '3 carriers', 'Basic dashboard', 'PDF invoices'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/mo',
    desc: 'For growing e-commerce businesses',
    features: ['10,000 trackings/month', 'All carriers', 'Live map', 'Analytics', 'Webhooks', 'Priority support'],
    cta: 'Start Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For high-volume logistics operations',
    features: ['Unlimited trackings', 'Dedicated API', 'Custom integrations', 'SLA guarantee', 'Onboarding'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 50);
  }, []);

  return (
    <div className="min-h-screen bg-ink-900 noise">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-ink bg-grid opacity-100" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-signal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-signal/3 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 glass border border-signal/20 rounded-full px-4 py-1.5 text-sm mb-8"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}
          >
            <span className="w-2 h-2 rounded-full bg-signal animate-pulse-slow" />
            <span className="text-signal font-mono text-xs">Live tracking — AfterShip powered</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.1s' }}
          >
            Know where
            <br />
            <span className="text-gradient">every package</span>
            <br />
            is. Always.
          </h1>

          <p
            className="text-ink-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.2s' }}
          >
            Real-time shipment tracking for FedEx, UPS, USPS, DHL and 500+ carriers.
            One platform. Zero guesswork.
          </p>

          {/* Tracking Input */}
          <div
            className="max-w-2xl mx-auto mb-8"
            style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.3s' }}
          >
            <TrackingInput large />
          </div>

          {/* Trust indicators */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-ink-500"
            style={{ opacity: heroVisible ? 1 : 0, transition: 'all 0.7s ease 0.4s' }}
          >
            {['No credit card required', 'Free tier forever', '500+ carriers'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-signal" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="border-y border-subtle py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-bold text-signal mb-1">{value}</p>
                <p className="text-ink-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Why TrackFlow</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Everything you need to
            <br />
            <span className="text-gradient">track smarter</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card glass-hover group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-signal/10 flex items-center justify-center mb-4 group-hover:bg-signal/20 transition-colors">
                <Icon className="w-5 h-5 text-signal" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
              <p className="text-ink-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section className="py-24 border-t border-subtle">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="section-label mb-3">How It Works</p>
          <h2 className="font-display text-4xl font-bold mb-16">
            Track anything in <span className="text-gradient">3 seconds</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Enter Tracking Number', desc: 'Paste any tracking number — we auto-detect the carrier.' },
              { step: '02', title: 'See Live Status', desc: 'Instant real-time data from the carrier API with timeline.' },
              { step: '03', title: 'Track on Map', desc: 'Watch your package move on an interactive live map.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-display font-bold text-signal/10 mb-4">{step}</div>
                <h3 className="font-display font-semibold text-xl mb-2">{title}</h3>
                <p className="text-ink-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/tracking" className="btn-primary">
              Try It Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="py-24 border-t border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Testimonials</p>
            <h2 className="font-display text-4xl font-bold">
              Trusted by logistics teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} className="card">
                <div className="flex gap-0.5 mb-4">
                  {Array(stars).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-signal text-signal" />
                  ))}
                </div>
                <p className="text-ink-300 text-sm leading-relaxed mb-5">"{text}"</p>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-ink-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section className="py-24 border-t border-subtle">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Pricing</p>
            <h2 className="font-display text-4xl font-bold">Simple, transparent pricing</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map(({ name, price, period, desc, features, cta, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-7 border transition-all ${
                  highlight
                    ? 'bg-signal/5 border-signal/30 shadow-signal'
                    : 'glass border-subtle'
                }`}
              >
                {highlight && (
                  <div className="inline-flex items-center gap-1 text-xs font-mono bg-signal text-ink-900 px-2.5 py-1 rounded-full mb-4 font-bold">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-bold mb-1">{name}</h3>
                <p className="text-ink-400 text-sm mb-4">{desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold">{price}</span>
                  <span className="text-ink-400 text-sm">{period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-300">
                      <Check className="w-4 h-4 text-signal flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/tracking"
                  className={`block text-center py-3 px-5 rounded-xl font-semibold text-sm transition-all ${
                    highlight
                      ? 'bg-signal text-ink-900 hover:bg-signal-dim'
                      : 'glass-hover border border-subtle'
                  }`}
                >
                  {cta} <ChevronRight className="inline w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-subtle">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Start tracking in <span className="text-gradient">seconds</span>
          </h2>
          <p className="text-ink-400 text-lg mb-8">
            No signup required. Paste a tracking number and go.
          </p>
          <Link href="/tracking" className="btn-primary text-base px-8 py-4">
            Track Your Package <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
