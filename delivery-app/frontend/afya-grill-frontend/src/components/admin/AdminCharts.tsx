import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { brl } from "./AdminUI";

const fullValue = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { dia: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground">{point.payload.dia}</p>
      <p className="mt-0.5 font-display text-sm font-semibold text-primary">{brl(point.value)}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: { dia: string; valor: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 26, right: 8, left: 8, bottom: 0 }}
          barCategoryGap="30%"
        >
          <defs>
            <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--ember)" />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="4 8"
            opacity={0.5}
          />
          <XAxis
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            dy={8}
          />
          <Tooltip content={<RevenueTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.35 }} />
          <Bar
            dataKey="valor"
            radius={[8, 8, 0, 0]}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((d) => (
              <Cell key={d.dia} fill="url(#revenueBar)" />
            ))}
            <LabelList
              dataKey="valor"
              position="top"
              offset={8}
              formatter={(v: number) => fullValue(v)}
              fill="var(--foreground)"
              fontSize={11}
              fontWeight={600}
              style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 3 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
