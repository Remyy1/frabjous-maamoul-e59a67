/**
 * Global state store using Zustand.
 * Manages tracking numbers, user preferences, and dashboard data.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrackingData } from './aftership';

interface TrackingStore {
  // Saved tracking numbers (persisted to localStorage)
  savedTrackings: string[];
  addTracking: (tn: string) => void;
  removeTracking: (tn: string) => void;

  // In-session cache of fetched tracking data
  trackingCache: Record<string, TrackingData>;
  setTrackingData: (tn: string, data: TrackingData) => void;

  // Active tracking number being viewed
  activeTracking: string | null;
  setActiveTracking: (tn: string | null) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useTrackingStore = create<TrackingStore>()(
  persist(
    (set) => ({
      savedTrackings: [],
      addTracking: (tn) =>
        set((state) => ({
          savedTrackings: state.savedTrackings.includes(tn)
            ? state.savedTrackings
            : [...state.savedTrackings, tn],
        })),
      removeTracking: (tn) =>
        set((state) => ({
          savedTrackings: state.savedTrackings.filter((t) => t !== tn),
        })),

      trackingCache: {},
      setTrackingData: (tn, data) =>
        set((state) => ({
          trackingCache: { ...state.trackingCache, [tn]: data },
        })),

      activeTracking: null,
      setActiveTracking: (tn) => set({ activeTracking: tn }),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'trackflow-store',
      // Only persist savedTrackings — everything else resets on page load
      partialize: (state) => ({ savedTrackings: state.savedTrackings }),
    }
  )
);
