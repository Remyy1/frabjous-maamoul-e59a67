'use client';
import { useState } from 'react';
// FIXED: Changed barChart3 to BarChart3 to fix Netlify Type Error
import { Truck, Shield, Zap, Globe, ArrowRight, Box, BarChart3 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CONTENT = {
  hero: {
    title: "Global Logistics. Local Precision.",
    subtitle: "Infrastructure for modern commerce. Real-time tracking, automated labeling, and multi-carrier intelligence powered by EasyPost.",
    cta: "Track Shipment",
    secondary: "Client Portal"
  },
  stats: [
    { label: "Uptime SLA", value: "99.9%" },
    { label: "API Response", value: "250ms" },
    { label: "Daily Shipments", value: "10k+" }
  ],
  features: [
    {
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      title: "Instant Webhooks",
      description: "No more manual refreshing. Receive push updates the millisecond a package scans in the EasyPost network."
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "Multi-Carrier Sync",
      description: "Unified tracking across USPS, UPS, FedEx, and 100+ global partners through a single API endpoint."
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Encrypted Chain",
      description: "Every milestone is time-stamped and verified via secure enterprise-grade API protocols."
    }
  ]
};

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState('');

  const handleTrack = () => {
    if (!trackingId) return;
    window.location.href = `https://www.easypost.com/tracking/${trackingId}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <Navbar />

      <section className="relative pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-widest uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              EasyPost Infrastructure Active
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6">
              {CONTENT.hero.title}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl mb-10">
              {CONTENT.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-blue-500/10 max-w-lg">
              <input 
                type="text" 
                placeholder="Enter EasyPost Tracking ID (e.g. EZ100...)"
                className="flex-1 px-6 py-4 outline-none text-slate-700 bg-transparent font-medium"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button 
                onClick={handleTrack}
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {CONTENT.hero.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative lg:ml-auto">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-transparent rounded-[3rem] -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000" 
              alt="Logistics Hub" 
              className="rounded-[2.5rem] shadow-2xl object-cover h-[500px] w-full"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {CONTENT.stats.map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {CONTENT.features.map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="mb-6 p-4 inline-block rounded-2xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
