'use client';
import { useState } from 'react';
import { Settings, Key, Database, Activity, Terminal, Check, Copy, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useTrackingStore } from '@/lib/store';
import toast from 'react-hot-toast';

function ConfigRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [show, setShow] = useState(!secret);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  }

  const display = secret && !show ? '•'.repeat(Math.min(value.length, 32)) : value;

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-subtle last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-ink-500 mb-0.5">{label}</p>
        <p className="font-mono text-sm text-ink-200 truncate">{display || '(not set)'}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {secret && (
          <button onClick={() => setShow(!show)} className="p-1.5 rounded-lg hover:bg-white/5 text-ink-400 hover:text-ink-200 transition-colors">
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/5 text-ink-400 hover:text-signal transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-signal" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { savedTrackings, trackingCache } = useTrackingStore();
  const apiKey = process.env.NEXT_PUBLIC_TRACKING_API_KEY || '';
  const mapboxKey = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  const apiKeySet = apiKey && apiKey !== 'your_aftership_api_key_here';
  const mapKeySet = mapboxKey && mapboxKey !== 'your_mapbox_token_here';

  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  async function testApiConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      // Use a known test tracking number
      const res = await fetch('/api/track?tn=1Z999AA10123456784');
      const json = await res.json();
      if (json.error === 'API_KEY_MISSING') {
        setTestResult('❌ API key not set. Add NEXT_PUBLIC_TRACKING_API_KEY to .env.local');
      } else if (json.data) {
        setTestResult('✅ AfterShip API connected successfully!');
      } else {
        setTestResult(`⚠️ API connected but returned: ${json.message}`);
      }
    } catch {
      setTestResult('❌ Network error — is the dev server running?');
    }
    setTesting(false);
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <p className="section-label mb-1">Admin Panel</p>
          <h1 className="font-display text-3xl font-bold">System Configuration</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* API Status */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-signal" />
              </div>
              <h2 className="font-display font-semibold text-lg">API Configuration</h2>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between py-2.5 border-b border-subtle">
                <span className="text-sm text-ink-400">AfterShip API Key</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${apiKeySet ? 'bg-signal/10 text-signal' : 'bg-red-500/10 text-red-400'}`}>
                  {apiKeySet ? '● Active' : '● Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-subtle">
                <span className="text-sm text-ink-400">Mapbox Token</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${mapKeySet ? 'bg-signal/10 text-signal' : 'bg-red-500/10 text-red-400'}`}>
                  {mapKeySet ? '● Active' : '● Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-ink-400">API Endpoint</span>
                <span className="text-xs font-mono text-ink-400">api.aftership.com/v4</span>
              </div>
            </div>

            <button
              onClick={testApiConnection}
              disabled={testing}
              className="btn-secondary w-full mt-5 justify-center text-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              {testing ? 'Testing...' : 'Test API Connection'}
            </button>

            {testResult && (
              <div className="mt-3 p-3 glass rounded-xl border border-subtle">
                <p className="text-xs font-mono">{testResult}</p>
              </div>
            )}
          </div>

          {/* Store stats */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-signal" />
              </div>
              <h2 className="font-display font-semibold text-lg">Data Store</h2>
            </div>

            <div className="space-y-0">
              {[
                { label: 'Saved Trackings', value: savedTrackings.length.toString() },
                { label: 'Cached Results', value: Object.keys(trackingCache).length.toString() },
                { label: 'Storage Type', value: 'localStorage (client)' },
                { label: 'API Provider', value: 'AfterShip v4' },
                { label: 'Map Provider', value: 'Mapbox GL JS v3' },
                { label: 'Invoice Engine', value: 'jsPDF + AutoTable' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-subtle last:border-0">
                  <span className="text-sm text-ink-400">{label}</span>
                  <span className="text-sm font-mono text-ink-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Setup instructions */}
          <div className="card md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-signal" />
              </div>
              <h2 className="font-display font-semibold text-lg">Setup Instructions</h2>
            </div>

            <div className="space-y-5 text-sm">
              <div>
                <p className="text-signal font-mono text-xs mb-2">STEP 1 — Create .env.local</p>
                <div className="bg-ink-800 rounded-xl p-4 font-mono text-xs text-ink-300 space-y-1">
                  <p className="text-ink-500"># .env.local — never commit this file</p>
                  <p>NEXT_PUBLIC_TRACKING_API_KEY=<span className="text-signal">your_aftership_key</span></p>
                  <p>NEXT_PUBLIC_MAPBOX_TOKEN=<span className="text-signal">your_mapbox_token</span></p>
                </div>
              </div>

              <div>
                <p className="text-signal font-mono text-xs mb-2">STEP 2 — Get AfterShip API Key</p>
                <ol className="text-ink-400 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://admin.aftership.com" target="_blank" className="text-signal underline">admin.aftership.com</a></li>
                  <li>Create a free account</li>
                  <li>Go to Settings → API Keys</li>
                  <li>Copy your key into NEXT_PUBLIC_TRACKING_API_KEY</li>
                </ol>
              </div>

              <div>
                <p className="text-signal font-mono text-xs mb-2">STEP 3 — Get Mapbox Token (optional, for maps)</p>
                <ol className="text-ink-400 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://account.mapbox.com/access-tokens/" target="_blank" className="text-signal underline">account.mapbox.com/access-tokens</a></li>
                  <li>Create or copy your default public token</li>
                  <li>Paste into NEXT_PUBLIC_MAPBOX_TOKEN</li>
                </ol>
              </div>

              <div>
                <p className="text-signal font-mono text-xs mb-2">STEP 4 — Restart dev server</p>
                <div className="bg-ink-800 rounded-xl p-3 font-mono text-xs text-ink-300">
                  npm run dev
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
