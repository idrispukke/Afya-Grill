import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { ActionButton, PageHeader, Pill } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/casas")({
  head: () => ({
    meta: [
      { title: "Casas parceiras — Painel Afya Grill" },
      { name: "description", content: "Restaurantes parceiros, comissões e status de operação." },
    ],
  }),
  component: Casas,
});

function Casas() {
  const { houses, toggleHouse } = useAdmin();

  return (
    <>
      <PageHeader title="Casas parceiras" subtitle="Curadoria de cozinhas ativas na plataforma." />
      <div className="grid gap-4 md:grid-cols-2">
        {houses.map((h, i) => (
          <motion.article
            key={h.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="bg-glow pointer-events-none absolute -right-16 -top-16 h-40 w-40 opacity-50" />
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl">{h.nome}</h2>
                <p className="text-xs text-muted-foreground">{h.bairro}</p>
              </div>
              <Pill tone={h.ativo ? "good" : "bad"}>{h.ativo ? "Aberta" : "Pausada"}</Pill>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-surface py-3">
                <p className="text-[11px] text-muted-foreground">Cozinha</p>
                <p className="text-sm font-medium">{h.cozinha}</p>
              </div>
              <div className="rounded-xl bg-surface py-3">
                <p className="text-[11px] text-muted-foreground">Nota</p>
                <p className="flex items-center justify-center gap-1 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 text-gold" /> {h.nota}
                </p>
              </div>
              <div className="rounded-xl bg-surface py-3">
                <p className="text-[11px] text-muted-foreground">Comissão</p>
                <p className="text-sm font-medium">{h.comissao}%</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <ActionButton
                tone="primary"
                onClick={() => {
                  toggleHouse(h.id);
                  toast.success(`${h.nome} ${h.ativo ? "pausada" : "reaberta"}`);
                }}
              >
                {h.ativo ? "Pausar loja" : "Reabrir loja"}
              </ActionButton>
              <ActionButton onClick={() => toast("Contrato enviado por e-mail")}>
                Ver contrato
              </ActionButton>
            </div>
          </motion.article>
        ))}
      </div>
    </>
  );
}
