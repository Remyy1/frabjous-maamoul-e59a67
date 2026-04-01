'use client';
import { useState, useEffect } from 'react';
import {
  Package, Plus, Trash2, RefreshCw, BarChart3,
  Clock, CheckCircle2, AlertTriangle, Truck
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTrackingStore } from '@/lib/store';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/aftership';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { TrackingData } from '@/lib/aftership';

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold">{value}</p>
        <p className="text-ink-400 text-sm">{label}</p>
      </div>
    </div>
  );
}

function ShipmentRow({ data, onRemove }: { data: TrackingData; onRemove: () => void }) {
  const color = STATUS_COLORS[data.status] || '#9999aa';

  return (
    <div className="card glass-hover flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, color }}>
          <Package className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium truncate">{data.trackingNumber}</p>
          <p className="text-ink-500 text-xs">{data.carrier}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: `${color}15`, color }}>
          {STATUS_LABELS[data.status] || data.status}
        </span>
      </div>

      <div className="text-sm text-ink-400 flex-shrink-0 hidden md:block">
        {data.currentLocation || '—'}
      </div>

      <div className="text-sm text-ink-400 flex-shrink-0 hidden md:block">
        ETA: {formatDate(data.estimatedDelivery)}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/tracking?tn=${data.trackingNumber}`}
          className="text-xs btn-secondary py-1.5 px-3">
          View
        </Link>
        <button onClick={onRemove}
          className="text-ink-500 hover:text-crimson-alert transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { savedTrackings, removeTracking, trackingCache, setTrackingData } = useTrackingStore();
  const [shipments, setShipments] = useState<TrackingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTn, setNewTn] = useState('');

  async function fetchAll(tns: string[]) {
    if (tns.length === 0) return;
    setLoading(true);
    const results: TrackingData[] = [];
    for (const tn of tns) {
      if (trackingCache[tn]) {
        results.push(trackingCache[tn]);
        continue;
      }
      try {
        const res = await fetch(`/api/track?tn=${encodeURIComponent(tn)}`);
        const json = await res.json();
        if (json.data) {
          setTrackingData(tn, json.data);
          results.push(json.data);
        }
      } catch { /* skip */ }
    }
    setShipments(results);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll(savedTrackings);
  }, [savedTrackings.join(',')]);

  async function handleAddTracking(e: React.FormEvent) {
    e.preventDefault();
    const tn = newTn.trim();
    if (!tn) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/track?tn=${encodeURIComponent(tn)}`);
      const json = await res.json();
      if (json.error === 'API_KEY_MISSING') {
        toast.error('Add your AfterShip API key first');
      } else if (json.data) {
        setTrackingData(tn, json.data);
        useTrackingStore.getState().addTracking(tn);
        setShipments((prev) => [json.data, ...prev.filter((s) => s.trackingNumber !== tn)]);
        setNewTn('');
        toast.success('Shipment added to dashboard');
      } else {
        toast.error(json.message || 'Not found');
      }
    } catch {
      toast.error('Network error');
    }
    setLoading(false);
  }

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'InTransit').length,
    delivered: shipments.filter((s) => s.status === 'Delivered').length,
    exceptions: shipments.filter((s) => ['Exception', 'AttemptFail'].includes(s.status)).length,
  };

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="section-label mb-1">Dashboard</p>
            <h1 className="font-display text-3xl font-bold">Your Shipments</h1>
          </div>
          <button
            onClick={() => { setShipments([]); fetchAll(savedTrackings); }}
            className="btn-secondary text-sm py-2 px-4 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh All
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tracked" value={stats.total} icon={BarChart3} color="#9999aa" />
          <StatCard label="In Transit" value={stats.inTransit} icon={Truck} color="#F5A623" />
          <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} color="#00E5A0" />
          <StatCard label="Exceptions" value={stats.exceptions} icon={AlertTriangle} color="#FF3B5C" />
        </div>

        {/* Add tracking form */}
        <form onSubmit={handleAddTracking} className="card mb-6 flex gap-3">
          <input
            value={newTn}
            onChange={(e) => setNewTn(e.target.value)}
            placeholder="Add a tracking number..."
            className="input-field flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary py-2 px-5 text-sm">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {/* Shipments list */}
        {loading && shipments.length === 0 ? (
          <div className="card text-center py-12">
            <RefreshCw className="w-6 h-6 text-signal mx-auto mb-3 animate-spin" />
            <p className="text-ink-400 text-sm">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="card text-center py-16">
            <Package className="w-12 h-12 text-ink-600 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No shipments yet</h3>
            <p className="text-ink-400 text-sm mb-6">Add a tracking number above or track one on the tracking page.</p>
            <Link href="/tracking" className="btn-primary inline-flex">
              Track a Package
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map((s) => (
              <ShipmentRow
                key={s.trackingNumber}
                data={s}
                onRemove={() => {
                  removeTracking(s.trackingNumber);
                  setShipments((prev) => prev.filter((p) => p.trackingNumber !== s.trackingNumber));
                  toast.success('Removed');
                }}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
