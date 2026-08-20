import { motion } from "motion/react";
import { useState } from "react";
import { Bike, BikeIcon, MapPin } from "lucide-react";
import { ActionButton, EmptyState, PageHeader, Pill } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

const filtros = ["Todos", "Disponível", "Em rota", "Offline"] as const;

export function EntregadoresSection() {
  const { couriers, cycleCourier } = useAdmin();
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos");

  const lista = couriers.filter((c) => filtro === "Todos" || c.status === filtro);

  return (
    <section id="entregadores" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Entregadores" subtitle="Frota em Duque de Caxias e região." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
              filtro === f
                ? "text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            style={filtro === f ? { background: "var(--gradient-ember)" } : undefined}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {lista.map((c, i) => (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Bike className="h-5 w-5 text-primary" />
                {c.status === "Em rota" && (
                  <span className="animate-ring absolute inset-0 rounded-full border border-primary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg">{c.nome}</h2>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {c.zona} · {c.veiculo}
                </p>
              </div>
              <Pill
                tone={
                  c.status === "Em rota" ? "warn" : c.status === "Disponível" ? "good" : "neutral"
                }
              >
                {c.status}
              </Pill>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-surface px-4 py-3">
              <span className="text-xs text-muted-foreground">Entregas hoje</span>
              <span className="font-display text-2xl">{c.entregasHoje}</span>
            </div>
            <div className="mt-4">
              <ActionButton tone="primary" onClick={() => cycleCourier(c.id)}>
                Alternar status
              </ActionButton>
            </div>
          </motion.article>
        ))}
      </div>
      {lista.length === 0 && (
        <EmptyState
          icon={<BikeIcon className="h-5 w-5" />}
          title="Nenhum entregador neste filtro"
          hint="Tente outro status."
        />
      )}
    </section>
  );
}
