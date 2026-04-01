'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TrackingInput from '@/components/tracking/TrackingInput';
import TrackingResult from '@/components/tracking/TrackingResult';
import LiveMap from '@/components/map/LiveMap';
import type { TrackingData } from '@/lib/aftership';
import toast from 'react-hot-toast';

function TrackingContent() {
  const searchParams = useSearchParams();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-track if ?tn= is in URL
  useEffect(() => {
    const tn = searchParams.get('tn');
    if (tn) {
      setLoading(true);
      fetch(`/api/track?tn=${encodeURIComponent(tn)}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.data) setTrackingData(json.data);
          else toast.error(json.message || 'Tracking not found');
        })
        .catch(() => toast.error('Network error'))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="section-label mb-3">Real-Time Tracking</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            Track your shipment
          </h1>
          <p className="text-ink-400">FedEx · UPS · USPS · DHL · 500+ carriers</p>
        </div>

        {/* Input */}
        <TrackingInput
          large
          onResult={(data) => setTrackingData(data)}
          className="mb-8"
        />

        {/* Loading */}
        {loading && (
          <div className="card text-center py-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full bg-signal animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 rounded-full bg-signal animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 rounded-full bg-signal animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-ink-400 text-sm font-mono">Fetching tracking data...</p>
          </div>
        )}

        {/* Map — shown when data is available */}
        {trackingData && !loading && (
          <div className="mb-6">
            <LiveMap data={trackingData} />
          </div>
        )}

        {/* Results */}
        {trackingData && !loading && (
          <TrackingResult
            data={trackingData}
            onReset={() => setTrackingData(null)}
          />
        )}

        {/* Empty state */}
        {!trackingData && !loading && (
          <div className="card text-center py-16 mt-4">
            <div className="w-16 h-16 rounded-2xl bg-signal/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-signal/50" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Enter a tracking number above</h3>
            <p className="text-ink-400 text-sm max-w-sm mx-auto">
              Supports FedEx, UPS, USPS, DHL, and 500+ carriers. We auto-detect the carrier.
            </p>

            <div className="mt-8 p-4 glass rounded-xl max-w-sm mx-auto border border-signal/10">
              <p className="text-xs font-mono text-signal mb-2">API KEY REQUIRED</p>
              <p className="text-xs text-ink-400 leading-relaxed">
                Add your AfterShip key to <code className="text-signal bg-signal/10 px-1 rounded">.env.local</code> to track real shipments.
                Get a free key at{' '}
                <a href="https://www.aftership.com" target="_blank" rel="noopener" className="text-signal underline">
                  aftership.com
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-900" />}>
      <TrackingContent />
    </Suspense>
  );
}
