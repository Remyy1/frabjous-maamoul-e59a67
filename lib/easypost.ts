/**
 * EasyPost API Integration
 * Docs: https://www.easypost.com/docs/api
 *
 * ─── API KEY SETUP ──────────────────────────────────────────────────────────
 * Add this to your .env.local file (never commit this file):
 *
 *   EASYPOST_API_KEY=YOUR_EASYPOST_API_KEY
 *
 * Get your key at: https://www.easypost.com/account/api-keys
 * Test keys start with "EZTKtest_..." — use these in development.
 * Production keys start with "EZTKprod_..." — use these in production.
 *
 * NOTE: Unlike AfterShip, the EasyPost key is server-only (no NEXT_PUBLIC_
 * prefix needed) because all calls go through /api/track on the server.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * This file is a drop-in replacement for aftership.ts.
 * All exported types, constants, and function signatures are IDENTICAL
 * so no front-end code needs to change.
 */

// ── EasyPost carrier slugs differ from AfterShip slugs.
// EasyPost uses: "FedEx", "UPS", "USPS", "DHL" (title-case or specific codes).
// We map our internal normalized slugs to EasyPost carrier strings here.
const CARRIER_MAP: Record<string, string> = {
  fedex: 'FedEx',
  ups: 'UPS',
  usps: 'USPS',
  dhl: 'DHLExpress',
  amazon: 'AmazonMws',
  ontrac: 'OnTrac',
  lasership: 'LaserShip',
  purolator: 'Purolator',
};

// ── EasyPost status values → our normalized status keys ─────────────────────
// EasyPost statuses: "unknown", "pre_transit", "in_transit", "out_for_delivery",
//                   "delivered", "available_for_pickup", "return_to_sender",
//                   "failure", "cancelled", "error"
const EASYPOST_STATUS_MAP: Record<string, string> = {
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

// ── Public types — identical to aftership.ts exports ────────────────────────

export interface TrackingEvent {
  timestamp: string;
  status: string;
  message: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: [number, number]; // [lng, lat]
}

export interface TrackingData {
  trackingNumber: string;
  carrier: string;
  carrierSlug: string;
  status: string;
  statusDescription: string;
  estimatedDelivery: string | null;
  origin: string;
  destination: string;
  events: TrackingEvent[];
  currentLocation: string;
  currentCoordinates: [number, number] | null;
  destinationCoordinates: [number, number] | null;
  weight?: string;
  signedBy?: string;
  shipDate?: string;
}

export type TrackingStatus =
  | 'InfoReceived'
  | 'InTransit'
  | 'OutForDelivery'
  | 'AttemptFail'
  | 'Delivered'
  | 'AvailableForPickup'
  | 'Exception'
  | 'Expired'
  | 'Pending';

// Status display labels — same keys as before so UI components are unaffected
export const STATUS_LABELS: Record<string, string> = {
  InfoReceived: 'Info Received',
  InTransit: 'In Transit',
  OutForDelivery: 'Out for Delivery',
  AttemptFail: 'Delivery Attempted',
  Delivered: 'Delivered',
  AvailableForPickup: 'Available for Pickup',
  Exception: 'Exception',
  Expired: 'Shipment Expired',
  Pending: 'Pending',
};

export const STATUS_COLORS: Record<string, string> = {
  InfoReceived: '#9999aa',
  InTransit: '#F5A623',
  OutForDelivery: '#00E5A0',
  AttemptFail: '#FF3B5C',
  Delivered: '#00E5A0',
  AvailableForPickup: '#00E5A0',
  Exception: '#FF3B5C',
  Expired: '#666680',
  Pending: '#9999aa',
};

// ── Carrier detection — same regex patterns as aftership.ts ─────────────────

/**
 * Auto-detect carrier from tracking number format.
 * Returns our internal lowercase slug (e.g. "fedex", "ups", "usps").
 * EasyPost can also auto-detect on creation, but providing the carrier
 * speeds up the API call and improves accuracy.
 */
export function detectCarrier(trackingNumber: string): string {
  const tn = trackingNumber.replace(/\s/g, '').toUpperCase();

  // FedEx: 12, 15, 20, or 22 digits
  if (
    /^\d{12}$/.test(tn) ||
    /^\d{15}$/.test(tn) ||
    /^\d{20}$/.test(tn) ||
    /^\d{22}$/.test(tn)
  ) {
    return 'fedex';
  }

  // UPS: always starts with 1Z followed by 16 alphanumeric chars
  if (/^1Z[A-Z0-9]{16}$/.test(tn)) return 'ups';

  // USPS: 20–22 digit IMpb barcodes with specific service-type prefixes
  if (/^(94|93|92|91|90)\d{18,20}$/.test(tn)) return 'usps';
  // USPS: international format — two letters, 9 digits, two letters
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(tn)) return 'usps';

  // DHL Express: 10–11 digit waybill
  if (/^\d{10,11}$/.test(tn)) return 'dhl';

  // Amazon Logistics: TBA + 12 digits
  if (/^TBA\d{12}$/.test(tn)) return 'amazon';

  // Let EasyPost auto-detect if we can't determine the carrier
  return '';
}

// ── EasyPost-specific helpers (internal, not exported) ──────────────────────

const EASYPOST_BASE = 'https://api.easypost.com/v2';

/**
 * Returns the Authorization header value for EasyPost.
 * EasyPost uses HTTP Basic Auth: the API key is the username, password is empty.
 *
 * ⚠️  Replace YOUR_EASYPOST_API_KEY below with your actual key,
 *     OR set EASYPOST_API_KEY in .env.local (recommended).
 */
function getAuthHeader(): string {
  // Reads from .env.local — set EASYPOST_API_KEY=YOUR_EASYPOST_API_KEY there.
  // Fallback to the NEXT_PUBLIC_ variant for backwards compatibility with the
  // existing .env.example, though server-only env vars are preferred.
  const apiKey =
    process.env.EASYPOST_API_KEY ||
    process.env.NEXT_PUBLIC_TRACKING_API_KEY ||
    'YOUR_EASYPOST_API_KEY'; // ← hard-code here only for local testing (not recommended)

  if (apiKey === 'YOUR_EASYPOST_API_KEY' || !apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  // EasyPost Basic Auth: base64("apiKey:")
  const encoded = Buffer.from(`${apiKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Make an authenticated EasyPost API request.
 */
async function easypostRequest(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object
): Promise<any> {
  let authHeader: string;
  try {
    authHeader = getAuthHeader();
  } catch (e: any) {
    return { error: 'API_KEY_MISSING', message: 'Please add EASYPOST_API_KEY to .env.local' };
  }

  const res = await fetch(`${EASYPOST_BASE}${path}`, {
    method,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const data = await res.json();

  // EasyPost returns { error: { code, message } } on failure
  if (!res.ok) {
    const message = data?.error?.message || 'EasyPost API error';
    throw new Error(message);
  }

  return data;
}

/**
 * Create a new Tracker object in EasyPost.
 * EasyPost auto-detects the carrier if none is provided.
 *
 * EasyPost Tracker POST body:
 * {
 *   tracker: {
 *     tracking_code: "1Z...",
 *     carrier: "UPS"  // optional — EasyPost auto-detects
 *   }
 * }
 */
async function createEasyPostTracker(
  trackingNumber: string,
  carrierSlug?: string
): Promise<any> {
  const body: any = {
    tracker: {
      tracking_code: trackingNumber,
    },
  };

  // Map our slug to the EasyPost carrier name if we detected one
  if (carrierSlug && CARRIER_MAP[carrierSlug]) {
    body.tracker.carrier = CARRIER_MAP[carrierSlug];
  }

  return easypostRequest('/trackers', 'POST', body);
}

/**
 * Retrieve an existing Tracker by its EasyPost tracker ID.
 * Note: EasyPost trackers are looked up by their internal ID ("trk_..."),
 * not by tracking number. We get the ID from the create response.
 */
async function getEasyPostTracker(trackerId: string): Promise<any> {
  return easypostRequest(`/trackers/${trackerId}`);
}

/**
 * Search EasyPost trackers by tracking number.
 * Useful for re-fetching a tracker we previously created.
 * Returns the first matching tracker.
 */
async function findTrackerByNumber(trackingNumber: string): Promise<any> {
  // EasyPost supports ?tracking_code= query parameter for listing
  const data = await easypostRequest(
    `/trackers?tracking_code=${encodeURIComponent(trackingNumber)}&page_size=1`
  );
  // Response: { trackers: [...] }
  return data?.trackers?.[0] || null;
}

// ── Response normalizer ──────────────────────────────────────────────────────

/**
 * Parse a raw EasyPost Tracker object into our normalized TrackingData shape.
 *
 * EasyPost Tracker shape (relevant fields):
 * {
 *   id: "trk_...",
 *   tracking_code: "1Z...",
 *   carrier: "UPS",
 *   status: "in_transit",              // see EASYPOST_STATUS_MAP
 *   status_detail: "...",
 *   est_delivery_date: "2024-...",
 *   signed_by: "...",
 *   weight: 12.5,                      // in ounces
 *   created_at: "...",
 *   tracking_details: [                // array of tracking events
 *     {
 *       datetime: "...",
 *       message: "...",
 *       status: "in_transit",
 *       tracking_location: {
 *         city: "...",
 *         state: "...",
 *         country: "...",
 *         zip: "..."
 *       }
 *     }
 *   ]
 * }
 */
function normalizeEasyPostTracker(raw: any): TrackingData {
  if (!raw) throw new Error('Empty tracker response from EasyPost');

  const details: any[] = raw.tracking_details || [];

  // Build events array — most recent first
  const events: TrackingEvent[] = details
    .slice()
    .reverse()
    .map((d: any) => {
      const loc = d.tracking_location || {};
      const locationParts = [loc.city, loc.state, loc.country].filter(Boolean);
      return {
        timestamp: d.datetime || raw.created_at || new Date().toISOString(),
        status: EASYPOST_STATUS_MAP[d.status] || 'InTransit',
        message: d.message || d.status || 'Package update',
        location: locationParts.join(', ') || 'Unknown',
        city: loc.city || '',
        state: loc.state || '',
        country: loc.country || '',
        // EasyPost does not return GPS coordinates in tracking details
        coordinates: undefined,
      };
    });

  // Most recent event is the first after reversing
  const latestEvent = events[0];
  const latestDetail = details[details.length - 1];
  const latestLoc = latestDetail?.tracking_location || {};

  const currentLocation =
    [latestLoc.city, latestLoc.state, latestLoc.country].filter(Boolean).join(', ') ||
    'Unknown';

  // Normalize carrier name to a slug for internal use
  const rawCarrier = raw.carrier || 'unknown';
  const carrierSlug = rawCarrier.toLowerCase().replace(/\s+/g, '');

  // EasyPost weight is in ounces — convert to lbs for display
  const weightDisplay = raw.weight
    ? `${(raw.weight / 16).toFixed(2)} lbs (${raw.weight} oz)`
    : undefined;

  // Map EasyPost status to our normalized status key
  const normalizedStatus = EASYPOST_STATUS_MAP[raw.status] || 'Pending';

  return {
    trackingNumber: raw.tracking_code || '',
    carrier: rawCarrier.toUpperCase(),
    carrierSlug,
    status: normalizedStatus,
    statusDescription:
      raw.status_detail ||
      STATUS_LABELS[normalizedStatus] ||
      normalizedStatus,
    estimatedDelivery: raw.est_delivery_date || null,
    // EasyPost doesn't always expose origin/destination country directly
    origin: raw.carrier_detail?.origin_location || '',
    destination: raw.carrier_detail?.destination_location || '',
    events,
    currentLocation,
    currentCoordinates: null, // EasyPost free tier doesn't expose GPS coords
    destinationCoordinates: null,
    weight: weightDisplay,
    signedBy: raw.signed_by || undefined,
    shipDate: raw.created_at || undefined,
  };
}

// ── Public API — same signatures as aftership.ts ─────────────────────────────

/**
 * Track a shipment by tracking number.
 * Creates a new EasyPost Tracker (or retrieves existing) and returns
 * normalized TrackingData identical in shape to what AfterShip returned.
 *
 * This is the primary function called by the front-end via /api/track.
 */
export async function trackShipment(trackingNumber: string): Promise<TrackingData> {
  const tn = trackingNumber.trim().replace(/\s/g, '');
  const slug = detectCarrier(tn);

  let raw: any = null;

  // Step 1: Try to create a new tracker.
  // EasyPost is idempotent for test tracking codes but creates a new paid
  // tracker in production for each call — so we search first.
  try {
    // Try finding an existing tracker first to avoid duplicate billing
    raw = await findTrackerByNumber(tn);
  } catch {
    // Search failed or no existing tracker — that's fine, we'll create one
  }

  // Step 2: Create a new tracker if we didn't find an existing one
  if (!raw) {
    try {
      raw = await createEasyPostTracker(tn, slug || undefined);
    } catch (err: any) {
      if (err.message === 'API_KEY_MISSING') throw err;
      // Creation failed — try one more search as fallback
      try {
        raw = await findTrackerByNumber(tn);
      } catch {
        throw new Error('Could not create or find tracking for this number');
      }
    }
  }

  if (!raw) {
    throw new Error('Could not find tracking information for this number');
  }

  return normalizeEasyPostTracker(raw);
}

/**
 * Fetch tracking data for multiple tracking numbers (dashboard view).
 * Runs in parallel; failed lookups are silently dropped.
 * Signature is identical to the AfterShip version.
 */
export async function fetchDashboardTrackings(
  trackingNumbers: string[]
): Promise<TrackingData[]> {
  const results = await Promise.allSettled(
    trackingNumbers.map((tn) => trackShipment(tn))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<TrackingData> => r.status === 'fulfilled')
    .map((r) => r.value);
}
