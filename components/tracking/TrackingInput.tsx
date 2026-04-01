'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props {
  large?: boolean;
  onResult?: (data: any) => void;
  className?: string;
}

const EXAMPLE_NUMBERS = [
  '1Z999AA10123456784',     // UPS example format
  '9400111899223397620913', // USPS example format
  '274899172137',           // FedEx example format
];

export default function TrackingInput({ large, onResult, className }: Props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const tn = value.trim();
    if (!tn) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/track?tn=${encodeURIComponent(tn)}`);
      const json = await res.json();

      if (json.error === 'API_KEY_MISSING') {
        toast.error('Add your AfterShip API key to .env.local to track real shipments');
        setLoading(false);
        return;
      }

      if (!res.ok || !json.data) {
        toast.error(json.message || 'Tracking number not found');
        setLoading(false);
        return;
      }

      // If a callback was provided (tracking page), pass data up
      if (onResult) {
        onResult(json.data);
      } else {
        // Otherwise navigate to tracking page with the TN
        router.push(`/tracking?tn=${encodeURIComponent(tn)}`);
      }
    } catch (err) {
      toast.error('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div
        className={cn(
          'flex gap-2 p-1.5 glass rounded-2xl border border-subtle focus-within:border-signal/40 transition-all duration-300',
          large ? 'shadow-signal-lg' : ''
        )}
      >
        <div className="flex-1 flex items-center gap-3 px-3">
          <Search className={cn('text-ink-400 flex-shrink-0', large ? 'w-5 h-5' : 'w-4 h-4')} />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={large ? 'Enter tracking number — FedEx, UPS, USPS, DHL' : 'Tracking number...'}
            className={cn(
              'flex-1 bg-transparent text-ink-100 placeholder:text-ink-400 focus:outline-none font-mono',
              large ? 'text-base py-2' : 'text-sm py-1'
            )}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'flex items-center gap-2 bg-signal text-ink-900 font-semibold rounded-xl transition-all duration-200',
            'hover:bg-signal-dim active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
            large ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'
          )}
        >
          {loading ? (
            <Loader2 className={cn('animate-spin', large ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
          ) : (
            <ScanLine className={cn(large ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
          )}
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </div>

      {large && (
        <p className="mt-3 text-xs text-ink-500 text-center font-mono">
          Try:{' '}
          {EXAMPLE_NUMBERS.map((n, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setValue(n)}
              className="text-ink-400 hover:text-signal transition-colors ml-2 underline decoration-dotted"
            >
              {n.slice(0, 10)}…
            </button>
          ))}
        </p>
      )}
    </form>
  );
}
