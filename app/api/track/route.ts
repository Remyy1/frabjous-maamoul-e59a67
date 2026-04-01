/**
 * /api/track — Server-side EasyPost tracking proxy.
 *
 * ─── API KEY SETUP ──────────────────────────────────────────────────────────
 * Add to .env.local (never commit this file):
 *
 *   EASYPOST_API_KEY=YOUR_EASYPOST_API_KEY
 *
 * Test keys start with "EZTKtest_..." (free, simulated data).
 * Production keys start with "EZTKprod_..." (billed per tracker created).
 *
 * Get your key: https://www.easypost.com/account/api-keys
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Why server-side?
 * EasyPost keys are secret-key credentials (unlike AfterShip's publishable
 * keys). They MUST stay server-side and should never be in NEXT_PUBLIC_ vars.
 * This route acts as a secure proxy — the browser never sees the key.
 *
 * The response shape is identical to the old AfterShip proxy so no front-end
 * code needs to change.
 */

import { NextRequest, NextResponse } from 'next/server';

const EASYPOST_BASE = 'https://api.easypost.com/v2';

// ── Carrier auto-detection ───────────────────────────────────────────────────

/**
 * Map our detected slug to the EasyPost carrier string.
 * EasyPost expects title-cased carrier names, not lowercase slugs.
 */
const CARRIER_MAP: Record<string, string> = {
  fedex: 'FedEx',
  ups: 'UPS',
  usps: 'USPS',
  dhl: 'DHLExpress',
  amazon: 'AmazonMws',
  ontrac: 'OnTrac',
};

/**
 * EasyPost status values → our normalized status keys.
 * These match the STATUS_LABELS keys exported from easypost.ts.
 */
const STATUS_MAP: Record<string, string> = {
  unknown: 'Pending',
  pre_transit: 'InfoReceived',
  in_transit: 'InTransit',
  out_for_delivery: 'OutForDelivery',
  delivered: 'Delivered',
  available_for_pickup: 'AvailableForPickup',
  return_to_sender: 'Exception',
  failure: 'AttemptFail',
  cancelled: 'Expired',
  error: 'Exception',
};

/**
 * Detect carrier from tracking number format.
 * Returns a lowercase internal slug, or empty string to let EasyPost decide.
 */
function detectCarrierSlug(tn: string): string {
  const t = tn.replace(/\s/g, '').toUpperCase();

  // FedEx: 12, 15, 20, or 22 digits
  if (
    /^\d{12}$/.test(t) ||
    /^\d{15}$/.test(t) ||
    /^\d{20}$/.test(t) ||
    /^\d{22}$/.test(t)
  ) return 'fedex';

  // UPS: starts with 1Z + 16 alphanumeric chars
  if (/^1Z[A-Z0-9]{16}$/.test(t)) return 'ups';

  // USPS: IMpb barcodes with service-type prefixes
  if (/^(94|93|92|91|90)\d{18,20}$/.test(t)) return 'usps';
  // USPS: international format (e.g. LZ123456789US)
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(t)) return 'usps';

  // DHL Express: 10–11 digit waybill
  if (/^\d{10,11}$/.test(t)) return 'dhl';

  // Amazon Logistics
  if (/^TBA\d{12}$/.test(t)) return 'amazon';

  return ''; // Let EasyPost auto-detect
}

// ── EasyPost HTTP helpers ────────────────────────────────────────────────────

/**
 * Build the Basic Auth header for EasyPost.
 * EasyPost uses HTTP Basic Auth: API key = username, password = empty string.
 *
 * ⚠️  Set EASYPOST_API_KEY=YOUR_EASYPOST_API_KEY in .env.local
 */
function buildAuthHeader(): string | null {
  const apiKey =
    process.env.EASYPOST_API_KEY ||         // preferred: server-only env var
    process.env.NEXT_PUBLIC_TRACKING_API_KEY; // fallback for backwards compat

  if (!apiKey || apiKey === 'YOUR_EASYPOST_API_KEY') return null;

  // EasyPost Basic Auth: base64("apiKey:") — note the trailing colon
  const encoded = Buffer.from(`${apiKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Make an authenticated request to the EasyPost API.
 * Returns parsed JSON. Non-2xx responses throw an Error with EasyPost's message.
 * Returns { _apiKeyMissing: true } if no API key is configured.
 */
async function easypostFetch(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object
): Promise<any> {
  const auth = buildAuthHeader();
  if (!auth) {
    return { _apiKeyMissing: true };
  }

  const res = await fetch(`${EASYPOST_BASE}${path}`, {
    method,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    // EasyPost error shape: { error: { code, message, errors } }
    const message = data?.error?.message || `EasyPost HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ── Response normalizer ──────────────────────────────────────────────────────

/**
 * Normalize a raw EasyPost Tracker object into our standard response shape.
 * Shape is identical to what the old AfterShip proxy returned — all front-end
 * components (TrackingResult, LiveMap, invoice generator, etc.) work unchanged.
 *
 * EasyPost Tracker fields used:
 *   tracking_code, carrier, status, status_detail, est_delivery_date,
 *   signed_by, weight (oz), created_at, carrier_detail, tracking_details[]
 */
function normalizeTracker(raw: any) {
  if (!raw) return null;

  const details: any[] = raw.tracking_details || [];

  // Build events — most recent first
  const events = details
    .slice()
    .reverse()
    .map((d: any) => {
      const loc = d.tracking_location || {};
      return {
        timestamp: d.datetime || raw.created_at || new Date().toISOString(),
        status: STATUS_MAP[d.status] || 'InTransit',
        message: d.message || d.status || 'Package update',
        location: [loc.city, loc.state, loc.country].filter(Boolean).join(', ') || 'Unknown',
        city: loc.city || '',
        state: loc.state || '',
        country: loc.country || '',
        coordinates: null, // EasyPost free tier doesn't return GPS coordinates
      };
    });

  // Latest raw detail (last in the array = most recent before reversing)
  const latestDetail = details[details.length - 1];
  const latestLoc = latestDetail?.tracking_location || {};
  const currentLocation =
    [latestLoc.city, latestLoc.state, latestLoc.country].filter(Boolean).join(', ') ||
    'Unknown';

  const normalizedStatus = STATUS_MAP[raw.status] || 'Pending';
  const rawCarrier = raw.carrier || 'unknown';

  // EasyPost weight is in ounces — convert for display
  const weightDisplay = raw.weight
    ? `${(raw.weight / 16).toFixed(2)} lbs (${raw.weight} oz)`
    : null;

  return {
    trackingNumber: raw.tracking_code || '',
    carrier: rawCarrier.toUpperCase(),
    carrierSlug: rawCarrier.toLowerCase().replace(/\s+/g, ''),
    status: normalizedStatus,
    statusDescription: raw.status_detail || normalizedStatus,
    estimatedDelivery: raw.est_delivery_date || null,
    // carrier_detail contains origin/destination when available
    origin: raw.carrier_detail?.origin_location || '',
    destination: raw.carrier_detail?.destination_location || '',
    events,
    currentLocation,
    currentCoordinates: null,
    destinationCoordinates: null,
    weight: weightDisplay,
    signedBy: raw.signed_by || null,
    shipDate: raw.created_at || null,
  };
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get('tn');

  if (!trackingNumber) {
    return NextResponse.json(
      { error: 'MISSING_PARAM', message: 'Missing tracking number' },
      { status: 400 }
    );
  }

  const tn = trackingNumber.trim().replace(/\s/g, '');
  const slug = detectCarrierSlug(tn);

  let raw: any = null;

  // ── Step 1: Search for an existing tracker ──────────────────────────────
  // EasyPost bills per tracker created in production — searching first
  // avoids creating duplicates for tracking numbers we've seen before.
  try {
    const searchResult = await easypostFetch(
      `/trackers?tracking_code=${encodeURIComponent(tn)}&page_size=1`
    );

    if (searchResult._apiKeyMissing) {
      return NextResponse.json(
        {
          error: 'API_KEY_MISSING',
          message:
            'Add EASYPOST_API_KEY to .env.local — get a free key at easypost.com/account/api-keys',
        },
        { status: 401 }
      );
    }

    // EasyPost list response: { trackers: [...] }
    if (searchResult?.trackers?.length > 0) {
      raw = searchResult.trackers[0];
    }
  } catch (err: any) {
    // Search failure is non-fatal — fall through to create
    console.error('[TrackFlow] EasyPost search error:', err.message);
  }

  // ── Step 2: Create a new tracker if none found ──────────────────────────
  if (!raw) {
    try {
      const createBody: any = {
        tracker: {
          tracking_code: tn,
        },
      };

      // Providing a carrier hint speeds up EasyPost's lookup
      if (slug && CARRIER_MAP[slug]) {
        createBody.tracker.carrier = CARRIER_MAP[slug];
      }

      const createResult = await easypostFetch('/trackers', 'POST', createBody);

      if (createResult._apiKeyMissing) {
        return NextResponse.json(
          {
            error: 'API_KEY_MISSING',
            message:
              'Add EASYPOST_API_KEY to .env.local — get a free key at easypost.com/account/api-keys',
          },
          { status: 401 }
        );
      }

      // EasyPost create response is the Tracker object directly (not nested)
      raw = createResult;
    } catch (err: any) {
      console.error('[TrackFlow] EasyPost create error:', err.message);
      return NextResponse.json(
        {
          error: 'NOT_FOUND',
          message: err.message || 'Could not find tracking for this number',
        },
        { status: 404 }
      );
    }
  }

  // ── Step 3: Normalize and return ────────────────────────────────────────
  const normalized = normalizeTracker(raw);

  if (!normalized) {
    return NextResponse.json(
      { error: 'PARSE_ERROR', message: 'Received empty response from EasyPost' },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: normalized });
}
