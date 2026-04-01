import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function getRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

// Simulate a route path between two coordinates
// Used when real GPS path isn't available from the API
export function simulateRoute(
  origin: [number, number],
  destination: [number, number],
  steps = 8
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add gentle arc/curve to make it look like a real route
    const lat = origin[1] + (destination[1] - origin[1]) * t;
    const lng = origin[0] + (destination[0] - origin[0]) * t;
    const arc = Math.sin(t * Math.PI) * 3; // slight arc
    points.push([lng + (Math.random() - 0.5) * 0.5, lat + arc]);
  }
  return points;
}

// Known city coordinates for common US cities (fallback when API doesn't return coords)
export const CITY_COORDS: Record<string, [number, number]> = {
  'New York': [-74.006, 40.7128],
  'Los Angeles': [-118.2437, 34.0522],
  'Chicago': [-87.6298, 41.8781],
  'Houston': [-95.3698, 29.7604],
  'Miami': [-80.1918, 25.7617],
  'San Francisco': [-122.4194, 37.7749],
  'Seattle': [-122.3321, 47.6062],
  'Dallas': [-96.797, 32.7767],
  'Atlanta': [-84.388, 33.749],
  'Boston': [-71.0589, 42.3601],
  'Memphis': [-90.049, 35.1495], // FedEx hub
  'Louisville': [-85.7585, 38.2527], // UPS hub
  'Cincinnati': [-84.512, 39.1031],
  'Newark': [-74.1724, 40.7357],
};
