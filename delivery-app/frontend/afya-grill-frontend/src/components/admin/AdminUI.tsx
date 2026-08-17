import { motion } from "motion/react";
import type { ReactNode } from "react";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-border bg-card p-5 shadow-soft ${className}`}
    >
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

export function StatCard({
  label,
  value,
  delta,
  icon,
  index = 0,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="bg-glow pointer-events-none absolute -right-10 -top-14 h-32 w-32 opacity-60" />
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <p className="mt-3 font-display text-3xl">{value}</p>
      {delta && <p className="mt-1 text-xs text-primary">{delta}</p>}
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
              <th key={h} className="px-3 pb-1 font-medium">
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
      className="[&>td]:bg-surface [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl [&>td]:px-3 [&>td]:py-3 [&>td]:align-middle"
    >
      {children}
    </motion.tr>
  );
}

export function ActionButton({
  children,
  onClick,
  tone = "ghost",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ghost" | "primary" | "danger";
  type?: "button" | "submit";
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
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-95 ${tones[tone]}`}
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
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

export function Bars({ data }: { data: { dia: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor));
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d, i) => (
        <div key={d.dia} className="flex flex-1 flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.valor / max) * 100}%` }}
            transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-t-lg"
            style={{ background: "var(--gradient-ember)" }}
            title={brl(d.valor)}
          />
          <span className="text-[11px] text-muted-foreground">{d.dia}</span>
        </div>
      ))}
    </div>
  );
}
