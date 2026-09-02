import type { OrderStatus } from "@/data/admin";

export type LatLng = { lat: number; lng: number };

/** Order id in the same visual family as the existing seed data (AFY-2041, ...). */
export function generateOrderId() {
  return `AFY-${Math.floor(2000 + Math.random() * 8000)}`;
}

export function nowMs() {
  return Date.now();
}

export function timeLabel(ms: number) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Random delivery address near the chosen unit, just for the simulated map. */
export function simulateDestination(origin: LatLng): LatLng {
  const angle = Math.random() * Math.PI * 2;
  const distance = 0.006 + Math.random() * 0.018; // ~0.7km a 2.5km
  return {
    lat: origin.lat + Math.cos(angle) * distance,
    lng: origin.lng + Math.sin(angle) * distance,
  };
}

/** How long the simulated ride takes, in ms — fast enough to actually watch it move. */
export function pickEtaMs() {
  return 75_000 + Math.random() * 60_000; // 75s a 135s
}

export function routeProgress(
  status: OrderStatus,
  acceitoEmMs: number | undefined,
  etaMs: number | undefined,
  now: number,
): number {
  if (status === "Entregue") return 1;
  if (status !== "A caminho" || !acceitoEmMs || !etaMs) return 0;
  return Math.min(1, Math.max(0, (now - acceitoEmMs) / etaMs));
}

/** Point along a gentle curve between origin and destination (quadratic bezier). */
export function pointOnRoute(origin: LatLng, destino: LatLng, t: number): LatLng {
  const mx = (origin.lat + destino.lat) / 2;
  const my = (origin.lng + destino.lng) / 2;
  // perpendicular offset for a curved road instead of a straight line
  const dx = destino.lat - origin.lat;
  const dy = destino.lng - origin.lng;
  const bend = 0.35;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;

  const u = 1 - t;
  return {
    lat: u * u * origin.lat + 2 * u * t * cx + t * t * destino.lat,
    lng: u * u * origin.lng + 2 * u * t * cy + t * t * destino.lng,
  };
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  if (total < 60) return `${total}s`;
  return `${Math.floor(total / 60)} min`;
}
