import { motion } from "motion/react";
import { useState } from "react";
import { Star, StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { ActionButton, EmptyState, PageHeader, Pill } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

const filtros = ["Todas", "Abertas", "Pausadas"] as const;

export function CasasSection() {
  const { houses, toggleHouse } = useAdmin();
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todas");
  const [busca, setBusca] = useState("");

  const lista = houses.filter(
    (h) =>
      (filtro === "Todas" || (filtro === "Abertas" ? h.ativo : !h.ativo)) &&
      (h.nome + h.cozinha + h.bairro).toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <section id="casas" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Unidades" subtitle="Unidades da Afya Grill em operação." />

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
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, cozinha ou bairro"
          className="ml-auto w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {lista.map((h, i) => (
          <motion.article
            key={h.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
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
      {lista.length === 0 && (
        <EmptyState
          icon={<StoreIcon className="h-5 w-5" />}
          title="Nenhuma casa neste filtro"
          hint="Ajuste os filtros ou tente outra busca."
        />
      )}
    </section>
  );
}
