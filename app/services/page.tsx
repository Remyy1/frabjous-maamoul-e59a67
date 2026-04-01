import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, Zap, Globe, Shield, BarChart3, FileText, Webhook, Clock, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  {
    icon: Package,
    name: 'Multi-Carrier Tracking',
    desc: 'Track shipments across 500+ carriers worldwide from a single dashboard. FedEx, UPS, USPS, DHL, and more — all unified.',
    features: ['Auto carrier detection', 'Real-time status updates', 'Historical events timeline', 'Signed-by confirmation'],
  },
  {
    icon: Globe,
    name: 'Live Map Visualization',
    desc: 'Interactive Mapbox-powered maps showing your package location, route, and estimated path to destination.',
    features: ['Real GPS coordinates when available', 'Animated route line', 'Origin & destination pins', 'Zoom and pan controls'],
  },
  {
    icon: FileText,
    name: 'Invoice Generation',
    desc: 'Generate professional PDF invoices for any shipment in one click. Branded, itemized, and ready to send.',
    features: ['Auto-calculated charges', 'Carrier-specific rates', 'Tracking history included', 'Instant PDF download'],
  },
  {
    icon: BarChart3,
    name: 'Analytics Dashboard',
    desc: 'Centralized view of all your shipments with status breakdowns, delivery performance, and exception alerts.',
    features: ['Real-time status counters', 'Batch tracking management', 'Exception flagging', 'Delivery rate tracking'],
  },
  {
    icon: Zap,
    name: 'Instant Notifications',
    desc: 'Webhook and email alerts for every status change — so you know the moment something happens.',
    features: ['Delivery confirmations', 'Delay alerts', 'Exception notifications', 'Webhook support'],
  },
  {
    icon: Shield,
    name: 'Enterprise Security',
    desc: 'API key management, encrypted data, and SOC 2 compliance for enterprise logistics operations.',
    features: ['Encrypted API calls', 'Key rotation support', 'Audit logs', 'Role-based access'],
  },
];

const CARRIERS = ['FedEx', 'UPS', 'USPS', 'DHL', 'Amazon', 'OnTrac', 'LaserShip', 'Purolator', 'Canada Post', 'Royal Mail', 'Australia Post', 'Hermes'];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />

      <div className="pt-28 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <p className="section-label mb-3">Our Services</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-5">
            Everything logistics.
            <br />
            <span className="text-gradient">Nothing missing.</span>
          </h1>
          <p className="text-ink-400 text-lg max-w-2xl mx-auto">
            TrackFlow gives you real-time tracking, live maps, invoice generation, and analytics — all in one platform.
          </p>
        </div>

        {/* Services grid */}
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, name, desc, features }) => (
              <div key={name} className="card glass-hover group">
                <div className="w-11 h-11 rounded-xl bg-signal/10 flex items-center justify-center mb-5 group-hover:bg-signal/20 transition-colors">
                  <Icon className="w-5 h-5 text-signal" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{name}</h3>
                <p className="text-ink-400 text-sm mb-5 leading-relaxed">{desc}</p>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-300">
                      <Check className="w-3.5 h-3.5 text-signal flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Supported carriers */}
        <div className="border-t border-subtle py-20">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="section-label mb-3">Supported Carriers</p>
            <h2 className="font-display text-3xl font-bold mb-10">500+ carriers, one platform</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {CARRIERS.map((c) => (
                <span key={c} className="glass px-4 py-2 rounded-xl text-sm text-ink-300 border border-subtle">
                  {c}
                </span>
              ))}
              <span className="glass px-4 py-2 rounded-xl text-sm text-signal border border-signal/20">
                + 488 more
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold mb-5">Ready to get started?</h2>
          <p className="text-ink-400 mb-8">No signup required — just paste a tracking number.</p>
          <Link href="/tracking" className="btn-primary text-base px-8 py-4">
            Track Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
