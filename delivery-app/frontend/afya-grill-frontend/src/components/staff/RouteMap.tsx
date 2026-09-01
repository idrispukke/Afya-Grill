import { Bike, Flag, Store } from "lucide-react";
import { pointOnRoute, type LatLng } from "@/lib/orders";

/**
 * Simulated live map: no external tiles/API, just an SVG "streets" backdrop with the
 * restaurant, the client's address and a bike icon that moves along a curved route as
 * `progress` (0 → 1) advances. Good enough to actually watch a delivery move in real time.
 */
export function RouteMap({
  origin,
  destino,
  progress,
  compact = false,
}: {
  origin: LatLng;
  destino: LatLng;
  progress: number;
  compact?: boolean;
}) {
  const W = 100;
  const H = compact ? 56 : 100;

  // project the lat/lng bounding box (origin/destino) onto the SVG viewport with padding
  const pad = 14;
  const minLat = Math.min(origin.lat, destino.lat);
  const maxLat = Math.max(origin.lat, destino.lat);
  const minLng = Math.min(origin.lng, destino.lng);
  const maxLng = Math.max(origin.lng, destino.lng);
  const spanLat = maxLat - minLat || 0.001;
  const spanLng = maxLng - minLng || 0.001;

  function project(p: LatLng) {
    const x = pad + ((p.lng - minLng) / spanLng) * (W - pad * 2);
    const y = H - pad - ((p.lat - minLat) / spanLat) * (H - pad * 2);
    return { x, y };
  }

  const originXY = project(origin);
  const destXY = project(destino);
  const currentPoint = pointOnRoute(origin, destino, progress);
  const currentXY = project(currentPoint);

  // build the same curved path (in SVG space) that pointOnRoute uses in lat/lng space
  const steps = 24;
  const pathPoints = Array.from({ length: steps + 1 }, (_, i) =>
    project(pointOnRoute(origin, destino, i / steps)),
  );
  const pathD = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const streets = [
    [10, 20, 90, 20],
    [10, 40, 90, 40],
    [10, 60, 90, 60],
    [10, 80, 90, 80],
    [25, 5, 25, 95],
    [50, 5, 50, 95],
    [75, 5, 75, 95],
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        style={{ height: compact ? 140 : 260 }}
      >
        <rect x={0} y={0} width={W} height={H} fill="var(--surface)" />
        {streets.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--border)"
            strokeWidth={0.6}
            opacity={0.6}
          />
        ))}

        <path d={pathD} fill="none" stroke="var(--border)" strokeWidth={2.2} strokeDasharray="0" />
        <path
          d={pathD}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.2}
          strokeDasharray={`${progress * 140} 200`}
          strokeLinecap="round"
        />

        <circle cx={originXY.x} cy={originXY.y} r={3.2} fill="var(--foreground)" />
        <circle cx={destXY.x} cy={destXY.y} r={3.2} fill="var(--primary)" />

        <g transform={`translate(${currentXY.x} ${currentXY.y})`}>
          <circle r={4.6} fill="var(--primary)" opacity={0.25} />
          <circle r={2.6} fill="var(--primary)" stroke="var(--surface)" strokeWidth={0.8} />
        </g>
      </svg>

      <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-background/85 px-2 py-1 text-[10px] font-medium shadow-soft backdrop-blur">
        <Store className="h-3 w-3 text-foreground" /> Restaurante
      </div>
      <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-background/85 px-2 py-1 text-[10px] font-medium text-primary shadow-soft backdrop-blur">
        <Flag className="h-3 w-3" /> Cliente
      </div>
      <div
        className="pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-primary-foreground shadow-ember transition-all duration-500 ease-linear"
        style={{
          left: `${currentXY.x}%`,
          top: `${(currentXY.y / H) * 100}%`,
          background: "var(--gradient-ember)",
        }}
      >
        <Bike className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
