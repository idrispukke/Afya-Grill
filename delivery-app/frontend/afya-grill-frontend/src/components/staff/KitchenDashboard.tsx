import { AnimatePresence, motion } from "motion/react";
import {
  Bike,
  ChefHat,
  Clock,
  Flame,
  LogOut,
  Soup,
  Sparkles,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/afya-grill-logo.png";
import { useAdmin } from "@/lib/admin";
import { useNow } from "@/hooks/use-now";
import { formatElapsed } from "@/lib/orders";
import type { AdminOrder } from "@/data/admin";

function ElapsedBadge({ order, now }: { order: AdminOrder; now: number }) {
  const ms = now - order.criadoEmMs;
  const urgent = ms > 8 * 60_000;
  const warn = ms > 4 * 60_000;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        urgent
          ? "bg-destructive/15 text-destructive"
          : warn
            ? "bg-gold/15 text-gold"
            : "bg-secondary text-muted-foreground"
      }`}
    >
      <Clock className="h-3 w-3" /> {formatElapsed(ms)}
    </span>
  );
}

function OrderCard({
  order,
  now,
  action,
}: {
  order: AdminOrder;
  now: number;
  action: { label: string; onClick?: () => void } | null;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg leading-tight">{order.id}</p>
          <p className="text-xs text-muted-foreground">{order.cliente}</p>
        </div>
        <ElapsedBadge order={order} now={now} />
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {order.channel === "mesa" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
            <UtensilsCrossed className="h-3 w-3" /> Mesa {order.mesa}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
            <Bike className="h-3 w-3" /> Delivery
          </span>
        )}
        <span className="truncate text-[11px] text-muted-foreground">{order.casa}</span>
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
        {(order.itensDetalhados ?? []).map((item, i) => (
          <li key={i} className="flex items-center justify-between text-sm">
            <span>
              <span className="font-semibold text-primary">{item.qtd}x</span> {item.nome}
            </span>
          </li>
        ))}
        {!order.itensDetalhados?.length && (
          <li className="text-sm text-muted-foreground">{order.itens}</li>
        )}
      </ul>

      {action &&
        (action.onClick ? (
          <button
            onClick={action.onClick}
            className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-ember transition-transform active:scale-[0.98]"
            style={{ background: "var(--gradient-ember)" }}
          >
            {action.label}
          </button>
        ) : (
          <p className="mt-4 rounded-xl bg-secondary px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">
            {action.label}
          </p>
        ))}
    </motion.article>
  );
}

function Column({
  title,
  icon,
  tone,
  orders,
  now,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  tone: string;
  orders: AdminOrder[];
  now: number;
  action: (order: AdminOrder) => { label: string; onClick?: () => void } | null;
}) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </span>
        <h2 className="font-display text-lg">{title}</h2>
        <span className="ml-auto rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {orders.length}
        </span>
      </div>
      <div className="flex-1 space-y-3">
        <AnimatePresence mode="popLayout">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} now={now} action={action(o)} />
          ))}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
            Nada por aqui
          </div>
        )}
      </div>
    </div>
  );
}

export function KitchenDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { orders, startPreparing, markReady } = useAdmin();
  const now = useNow(1000);

  const novos = orders.filter((o) => o.status === "Novo");
  const emPreparo = orders.filter((o) => o.status === "Em preparo");
  const prontos = orders.filter((o) => o.status === "Pronto");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Afya Grill" className="h-7 w-7 object-contain" />
          <div>
            <p className="font-display text-lg leading-tight">
              Painel da <span className="text-gradient">Cozinha</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {new Date(now).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
              {novos.length + emPreparo.length} pedido(s) ativos
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <Column
            title="Novos pedidos"
            icon={<Sparkles className="h-4 w-4" />}
            tone="bg-primary/15 text-primary"
            orders={novos}
            now={now}
            action={(o) => ({
              label: "Iniciar preparo",
              onClick: () => {
                startPreparing(o.id);
                toast.success(`${o.id} entrou em preparo`);
              },
            })}
          />
          <Column
            title="Em preparo"
            icon={<Flame className="h-4 w-4" />}
            tone="bg-gold/15 text-gold"
            orders={emPreparo}
            now={now}
            action={(o) => ({
              label: "Marcar como pronto",
              onClick: () => {
                markReady(o.id);
                toast.success(
                  `${o.id} pronto — indo para ${o.channel === "mesa" ? "o garçom" : "o motoboy"}`,
                );
              },
            })}
          />
          <Column
            title="Prontos"
            icon={<Soup className="h-4 w-4" />}
            tone="bg-primary/15 text-primary"
            orders={prontos}
            now={now}
            action={(o) => ({
              label:
                o.channel === "mesa" ? "Aguardando o garçom retirar" : "Aguardando motoboy aceitar",
            })}
          />
        </div>

        {novos.length === 0 && emPreparo.length === 0 && prontos.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
            <ChefHat className="h-10 w-10" />
            <p className="text-sm">Nenhum pedido na cozinha agora. Bom sinal!</p>
          </div>
        )}

        <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
          <XCircle className="h-3.5 w-3.5" />
          Cancelamentos são feitos pelo painel administrativo.
        </div>
      </main>
    </div>
  );
}
