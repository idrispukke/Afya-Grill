import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { ActionButton, PageHeader, Pill, StatCard } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações — Painel Afya Grill" },
      { name: "description", content: "Feedback dos clientes e respostas da equipe." },
    ],
  }),
  component: Avaliacoes,
});

function Avaliacoes() {
  const { reviews, answerReview } = useAdmin();
  const media = reviews.reduce((a, r) => a + r.nota, 0) / reviews.length;

  return (
    <>
      <PageHeader title="Avaliações" subtitle="O que os clientes falaram das últimas entregas." />
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <StatCard index={0} label="Nota média" value={media.toFixed(1)} delta="meta: 4,8" />
        <StatCard
          index={1}
          label="Pendentes de resposta"
          value={String(reviews.filter((r) => !r.respondido).length)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r, i) => (
          <motion.article
            key={r.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
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
    </>
  );
}
