import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const brlInt = (v: number) =>
  Math.round(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-border/70 bg-card/90 p-5 shadow-soft sm:p-6"
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">{subtitle}</p>
      </div>
      {action}
    </motion.div>
  );
}

export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      {title && (
        <header className="mb-4">
          <h2 className="font-display text-lg tracking-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </header>
      )}
      {children}
    </motion.section>
  );
}

function useCountUp(target: number, start: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  const lastTarget = useRef(0);

  useEffect(() => {
    if (!start) return;
    const from = lastTarget.current;
    const startTime = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - startTime) / duration);
      setValue(from + (target - from) * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else lastTarget.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return value;
}

export function StatCard({
  label,
  value,
  format,
  delta,
  icon,
  index = 0,
}: {
  label: string;
  value: number | string;
  format?: (n: number) => string;
  delta?: string;
  icon?: ReactNode;
  index?: number;
}) {
  const [inView, setInView] = useState(false);
  const numeric = typeof value === "number";
  const animated = useCountUp(numeric ? value : 0, inView);
  const display = numeric
    ? format
      ? format(animated)
      : Math.round(animated).toLocaleString("pt-BR")
    : value;
  const trend = delta?.startsWith("+")
    ? "up"
    : delta?.startsWith("-")
      ? "down"
      : delta
        ? "neutral"
        : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      onViewportEnter={() => setInView(true)}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-primary transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 whitespace-nowrap font-display text-3xl tracking-tight tabular-nums sm:text-[2rem]">
        {display}
      </p>
      {delta && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-primary" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          {trend === "neutral" && <Minus className="h-3 w-3" />}
          <span className={trend === "up" ? "text-primary" : undefined}>{delta}</span>
        </p>
      )}
    </motion.div>
  );
}

export function LinkCard({
  id,
  icon,
  title,
  metric,
  hint,
  index = 0,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  metric: string;
  hint: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={`#${id}`}
        className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/20"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p title={hint} className="truncate text-xs text-muted-foreground">
            {hint}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-lg tabular-nums">{metric}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
      </a>
    </motion.div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-secondary text-secondary-foreground",
    good: "bg-primary/15 text-primary",
    warn: "bg-gold/15 text-gold",
    bad: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function TableShell({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-3 pb-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="group [&>td]:bg-surface [&>td]:transition-colors [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl [&>td]:px-3 [&>td]:py-3 [&>td]:align-middle group-hover:[&>td]:bg-accent/40"
    >
      {children}
    </motion.tr>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-surface/40 py-14 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </motion.div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl border-border bg-card text-card-foreground shadow-soft">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-border bg-secondary text-foreground hover:bg-accent">
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ActionButton({
  children,
  onClick,
  tone = "ghost",
  type = "button",
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ghost" | "primary" | "danger";
  type?: "button" | "submit";
  "aria-label"?: string;
}) {
  const tones: Record<string, string> = {
    ghost: "bg-secondary hover:bg-accent text-foreground",
    primary: "text-primary-foreground hover:opacity-90",
    danger: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
      style={tone === "primary" ? { background: "var(--gradient-ember)" } : undefined}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-xs">
      <span className="mb-1.5 block text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  label?: string;
  payload?: { name: string; value: number; color?: string }[];
  formatter?: ((v: number) => string) | undefined;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-soft">
      {label && <p className="mb-1 text-muted-foreground">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="font-medium">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function AreaTrend({
  data,
  xKey,
  yKey,
  formatter,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  formatter?: ((v: number) => string) | undefined;
}) {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="areaTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={<ChartTooltip formatter={formatter} />}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#areaTrendFill)"
            animationDuration={900}
            dot={{ r: 3.5, strokeWidth: 0, fill: "var(--primary)" }}
            activeDot={{ r: 5.5, strokeWidth: 0, fill: "var(--gold)" }}
          >
            <LabelList
              dataKey={yKey}
              position="top"
              offset={8}
              formatter={(v: number) => (formatter ? formatter(v) : String(v))}
              fill="var(--foreground)"
              fontSize={9}
              fontWeight={600}
              style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 3 }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const DONUT_COLORS = ["var(--primary)", "var(--gold)", "var(--ember)", "var(--muted-foreground)"];

export function DonutChart({
  data,
  nameKey,
  valueKey,
}: {
  data: Record<string, string | number>[];
  nameKey: string;
  valueKey: string;
}) {
  const total = data.reduce((a, d) => a + Number(d[valueKey] ?? 0), 0);
  return (
    <div className="flex items-center gap-6">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={48}
              outerRadius={72}
              paddingAngle={3}
              animationDuration={900}
              stroke="none"
              labelLine={false}
              label={({ cx, cy, midAngle, outerRadius, percent, index, name }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 16;
                const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="var(--foreground)"
                    textAnchor={x > Number(cx) ? "start" : "end"}
                    dominantBaseline="central"
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      paintOrder: "stroke",
                      stroke: "var(--background)",
                      strokeWidth: 3,
                    }}
                  >
                    {`${String(name)} ${Math.round(Number(percent) * 100)}%`}
                  </text>
                );
              }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2.5 text-sm">
        {data.map((d, i) => (
          <li key={String(d[nameKey])} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              {d[nameKey]}
            </span>
            <span className="font-medium">
              {total ? Math.round((Number(d[valueKey]) / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
