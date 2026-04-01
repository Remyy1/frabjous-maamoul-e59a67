'use client';
import { useState } from 'react';
import {
  Package, MapPin, Clock, CheckCircle2, AlertTriangle,
  Truck, Home, RotateCcw, FileText, ChevronDown, ChevronUp,
  Star, ArrowRight
} from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/aftership';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/invoice';
import { useTrackingStore } from '@/lib/store';
import toast from 'react-hot-toast';
import type { TrackingData } from '@/lib/aftership';

interface Props {
  data: TrackingData;
  onReset: () => void;
}

function StatusIcon({ status }: { status: string }) {
  const icons: Record<string, any> = {
    Delivered: CheckCircle2,
    OutForDelivery: Truck,
    InTransit: Package,
    Exception: AlertTriangle,
    AttemptFail: AlertTriangle,
    default: Clock,
  };
  const Icon = icons[status] || icons.default;
  return <Icon className="w-5 h-5" />;
}

function CarrierBadge({ carrier }: { carrier: string }) {
  const colors: Record<string, string> = {
    FEDEX: '#4D148C',
    UPS: '#FFB500',
    USPS: '#333366',
    DHL: '#FFCC00',
  };
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
      style={{ background: colors[carrier] || '#2a2a45', color: carrier === 'USPS' ? '#fff' : undefined }}
    >
      {carrier}
    </span>
  );
}

export default function TrackingResult({ data, onReset }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { addTracking, savedTrackings } = useTrackingStore();
  const isSaved = savedTrackings.includes(data.trackingNumber);

  const statusColor = STATUS_COLORS[data.status] || '#9999aa';
  const visibleEvents = showAll ? data.events : data.events.slice(0, 4);

  async function handleDownloadInvoice() {
    setDownloading(true);
    try {
      await generateInvoicePDF(data);
      toast.success('Invoice downloaded!');
    } catch (err) {
      toast.error('Failed to generate invoice');
    } finally {
      setDownloading(false);
    }
  }

  function handleSave() {
    addTracking(data.trackingNumber);
    toast.success('Saved to dashboard');
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Status Hero Card */}
      <div className="card relative overflow-hidden">
        {/* Glow background */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${statusColor}, transparent 70%)` }}
        />

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Status indicator */}
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${statusColor}20`, color: statusColor }}
            >
              <StatusIcon status={data.status} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <CarrierBadge carrier={data.carrier} />
                <span className="text-xs font-mono text-ink-400">{data.trackingNumber}</span>
              </div>
              <h2
                className="text-2xl font-display font-bold"
                style={{ color: statusColor }}
              >
                {STATUS_LABELS[data.status] || data.status}
              </h2>
              <p className="text-ink-400 text-sm mt-1">{data.statusDescription}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!isSaved && (
              <button onClick={handleSave} className="btn-secondary text-sm py-2 px-4">
                <Star className="w-3.5 h-3.5" />
                Save
              </button>
            )}
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="btn-secondary text-sm py-2 px-4"
            >
              <FileText className="w-3.5 h-3.5" />
              {downloading ? 'Generating...' : 'Invoice'}
            </button>
            <button onClick={onReset} className="btn-secondary text-sm py-2 px-4">
              <RotateCcw className="w-3.5 h-3.5" />
              New Search
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-subtle">
          {[
            { label: 'Current Location', value: data.currentLocation, icon: MapPin },
            { label: 'Estimated Delivery', value: formatDate(data.estimatedDelivery), icon: Clock },
            { label: 'Origin', value: data.origin || 'Unknown', icon: ArrowRight },
            { label: 'Destination', value: data.destination || 'Unknown', icon: Home },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <p className="text-xs text-ink-500 mb-1 flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {label}
              </p>
              <p className="text-sm font-medium text-ink-100 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Timeline */}
      {data.events.length > 0 ? (
        <div className="card">
          <h3 className="font-display font-semibold text-lg mb-5">Tracking History</h3>
          <div className="space-y-0">
            {visibleEvents.map((event, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-4 relative pb-6',
                  i === visibleEvents.length - 1 ? 'pb-0' : 'timeline-line'
                )}
              >
                {/* Dot */}
                <div className="flex-shrink-0 relative z-10">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center border-2',
                      i === 0
                        ? 'border-signal bg-signal/20'
                        : 'border-ink-600 bg-ink-800'
                    )}
                  >
                    <div
                      className={cn('w-2 h-2 rounded-full', i === 0 ? 'bg-signal status-active' : 'bg-ink-500')}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className={cn('text-sm font-medium', i === 0 ? 'text-ink-100' : 'text-ink-300')}>
                        {event.message}
                      </p>
                      <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    </div>
                    <span className="text-xs text-ink-500 font-mono flex-shrink-0">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.events.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-ink-400 hover:text-signal transition-colors py-2"
            >
              {showAll ? (
                <><ChevronUp className="w-4 h-4" /> Show Less</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Show {data.events.length - 4} More Events</>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="card text-center py-8">
          <Clock className="w-8 h-8 text-ink-500 mx-auto mb-3" />
          <p className="text-ink-400">No tracking events yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
