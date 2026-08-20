import { motion } from "motion/react";
import { useState } from "react";
import { MessageSquareOff, Star } from "lucide-react";
import { toast } from "sonner";
import { ActionButton, EmptyState, PageHeader, Pill, StatCard } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

const filtros = ["Todas", "Respondida", "Aguardando"] as const;

export function AvaliacoesSection() {
  const { reviews, answerReview } = useAdmin();
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todas");
  const media = reviews.reduce((a, r) => a + r.nota, 0) / reviews.length;

  const lista = reviews.filter(
    (r) => filtro === "Todas" || (filtro === "Respondida" ? r.respondido : !r.respondido),
  );

  return (
    <section id="avaliacoes" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Avaliações" subtitle="O que os clientes falaram das últimas entregas." />
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <StatCard
          index={0}
          label="Nota média"
          value={media}
          format={(n) => n.toFixed(1)}
          delta="meta: 4,8"
        />
        <StatCard
          index={1}
          label="Pendentes de resposta"
          value={reviews.filter((r) => !r.respondido).length}
        />
      </div>

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
        {lista.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{r.cliente}</p>
                <p className="text-xs text-muted-foreground">{r.casa}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    className={`h-4 w-4 ${k < r.nota ? "fill-gold text-gold" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">“{r.comentario}”</p>
            <div className="mt-5 flex items-center justify-between">
              <Pill tone={r.respondido ? "good" : "warn"}>
                {r.respondido ? "Respondida" : "Aguardando resposta"}
              </Pill>
              {!r.respondido && (
                <ActionButton
                  tone="primary"
                  onClick={() => {
                    answerReview(r.id);
                    toast.success("Resposta enviada ao cliente");
                  }}
                >
                  Responder
                </ActionButton>
              )}
            </div>
          </motion.article>
        ))}
      </div>
      {lista.length === 0 && (
        <EmptyState
          icon={<MessageSquareOff className="h-5 w-5" />}
          title="Nenhuma avaliação neste filtro"
          hint="Tente outro filtro de status."
        />
      )}
    </section>
  );
}
