import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCircle2, Clock, LogOut, Soup, Timer, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/afya-grill-logo.png";
import { useAdmin } from "@/lib/admin";
import { useNow } from "@/hooks/use-now";
import { formatElapsed } from "@/lib/orders";

export function WaiterDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { orders, deliverToTable } = useAdmin();
  const now = useNow(1000);

  const mesaOrders = orders.filter((o) => o.channel === "mesa");
  const prontos = mesaOrders.filter((o) => o.status === "Pronto");
  const emPreparo = mesaOrders.filter((o) => o.status === "Novo" || o.status === "Em preparo");
  const entregues = mesaOrders.filter((o) => o.status === "Entregue").slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Afya Grill" className="h-7 w-7 object-contain" />
          <div>
            <p className="font-display text-lg leading-tight">
              Painel do <span className="text-gradient">Garçom</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {prontos.length} pedido(s) prontos para servir
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Bell className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg">Prontos para servir</h2>
        </div>

        {prontos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Nenhum pedido aguardando entrega na mesa agora.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {prontos.map((o) => (
                <motion.article
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-primary/30 bg-card p-5 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-3xl">Mesa {o.mesa}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {formatElapsed(now - o.criadoEmMs)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{o.cliente}</p>
                  <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm">
                    {(o.itensDetalhados ?? []).map((item, i) => (
                      <li key={i}>
                        <span className="font-semibold text-primary">{item.qtd}x</span> {item.nome}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      deliverToTable(o.id);
                      toast.success(`Mesa ${o.mesa} servida`, { description: o.id });
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-ember transition-transform active:scale-[0.98]"
                    style={{ background: "var(--gradient-ember)" }}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Entregar na mesa
                  </button>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="mb-4 mt-10 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Soup className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg">Na cozinha</h2>
        </div>
        {emPreparo.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada em preparo para as mesas agora.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {emPreparo.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Mesa {o.mesa}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.status === "Novo" ? "Aguardando a cozinha" : "Em preparo"}
                    </p>
                  </div>
                </div>
                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {entregues.length > 0 && (
          <>
            <div className="mb-4 mt-10 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg">Servidas recentemente</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {entregues.map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <span>
                    Mesa {o.mesa} · {o.cliente}
                  </span>
                  <span>{o.id}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
