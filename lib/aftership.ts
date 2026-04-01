/**
 * Re-export everything from easypost.ts, which is the drop-in replacement
 * for the original AfterShip integration. This barrel file keeps all
 * existing `@/lib/aftership` imports working without changes.
 */
export {
  type TrackingEvent,
  type TrackingData,
  type TrackingStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  detectCarrier,
  trackShipment,
  fetchDashboardTrackings,
} from './easypost';
