import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bike, MapPin } from "lucide-react";
import { ActionButton, PageHeader, Pill } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/entregadores")({
  head: () => ({
    meta: [
      { title: "Entregadores — Painel Afya Grill" },
      { name: "description", content: "Frota de entrega, zonas atendidas e disponibilidade." },
    ],
  }),
  component: Entregadores,
});

function Entregadores() {
  const { couriers, cycleCourier } = useAdmin();

  return (
    <>
      <PageHeader title="Entregadores" subtitle="Frota em Duque de Caxias e região." />
      <div className="grid gap-4 md:grid-cols-2">
        {couriers.map((c, i) => (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
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
    </>
  );
}
