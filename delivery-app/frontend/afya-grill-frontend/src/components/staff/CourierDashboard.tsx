import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bike,
  CheckCircle2,
  Clock,
  Home,
  LogOut,
  MapPin,
  Navigation,
  Package,
  Phone,
  Repeat,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/afya-grill-logo.png";
import { useAdmin } from "@/lib/admin";
import { useNow } from "@/hooks/use-now";
import { formatCountdown, formatElapsed, routeProgress } from "@/lib/orders";
import { units } from "@/data/units";
import { RouteMap } from "@/components/staff/RouteMap";
import type { AdminOrder } from "@/data/admin";

const COURIER_KEY = "afya-motoboy-id";

function originFor(order: AdminOrder) {
  const unit = units.find((u) => u.id === order.unidadeId);
  return unit ? { lat: unit.lat, lng: unit.lng } : { lat: units[0]!.lat, lng: units[0]!.lng };
}

function CourierPicker({ onPick }: { onPick: (id: string) => void }) {
  const { couriers } = useAdmin();
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md text-center">
        <img src={logo} alt="Afya Grill" className="mx-auto h-10 w-10 object-contain" />
        <h1 className="mt-3 font-display text-2xl">
          Quem é <span className="text-gradient">você</span>?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha seu perfil de entregador para ver suas corridas.
        </p>
        <div className="mt-6 space-y-3">
          {couriers.map((c) => (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Bike className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {c.veiculo} · {c.zona}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AvailableCard({ order, onAccept }: { order: AdminOrder; onAccept: () => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-lg">{order.id}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <Wallet className="h-3 w-3" /> {order.pagamento}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{order.casa}</p>
      <p className="mt-2 flex items-start gap-1.5 text-sm">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {order.endereco}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{order.itens}</p>
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="font-display text-lg">
          {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
        <button
          onClick={onAccept}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-ember transition-transform active:scale-95"
          style={{ background: "var(--gradient-ember)" }}
        >
          <Bike className="h-3.5 w-3.5" /> Aceitar corrida
        </button>
      </div>
    </motion.article>
  );
}

function ActiveDelivery({
  order,
  now,
  onDeliver,
}: {
  order: AdminOrder;
  now: number;
  onDeliver: () => void;
}) {
  const origin = originFor(order);
  const progress = order.destino
    ? routeProgress(order.status, order.aceitoEmMs, order.etaMs, now)
    : 0;
  const remainingMs = order.etaMs
    ? Math.max(0, order.etaMs - (now - (order.aceitoEmMs ?? now)))
    : 0;
  const arrived = progress >= 0.98;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/30 bg-card p-4 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-lg">{order.id}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
          <Navigation className="h-3 w-3" /> {arrived ? "Chegando" : "Em rota"}
        </span>
      </div>

      {order.destino && (
        <div className="mt-3">
          <RouteMap origin={origin} destino={order.destino} progress={progress} compact />
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-surface px-3 py-2">
          <p className="text-muted-foreground">ETA</p>
          <p className="font-display text-base">
            {arrived ? "Chegou" : formatCountdown(remainingMs)}
          </p>
        </div>
        <div className="rounded-xl bg-surface px-3 py-2">
          <p className="text-muted-foreground">Pagamento</p>
          <p className="font-display text-base">{order.pagamento}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <p className="flex items-center gap-1.5">
          <Home className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {order.endereco}
        </p>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" /> {order.cliente}
          {order.telefone ? ` · ${order.telefone}` : ""}
        </p>
      </div>

      <button
        onClick={onDeliver}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-ember transition-transform active:scale-[0.98]"
        style={{ background: "var(--gradient-ember)" }}
      >
        <CheckCircle2 className="h-4 w-4" /> Marcar como entregue
      </button>
    </motion.article>
  );
}

export function CourierDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { orders, couriers, acceptDelivery, markDelivered } = useAdmin();
  const now = useNow(1000);
  const [courierId, setCourierId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setCourierId(localStorage.getItem(COURIER_KEY));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  function pickCourier(id: string) {
    try {
      localStorage.setItem(COURIER_KEY, id);
    } catch {
      /* ignore */
    }
    setCourierId(id);
  }

  function switchCourier() {
    try {
      localStorage.removeItem(COURIER_KEY);
    } catch {
      /* ignore */
    }
    setCourierId(null);
  }

  if (!loaded) return null;
  if (!courierId) return <CourierPicker onPick={pickCourier} />;

  const courier = couriers.find((c) => c.id === courierId);
  if (!courier) return <CourierPicker onPick={pickCourier} />;

  const disponiveis = orders.filter(
    (o) => o.channel === "delivery" && o.status === "Pronto" && !o.entregadorId,
  );
  const emRota = orders.filter((o) => o.entregadorId === courierId && o.status === "A caminho");
  const entreguesHoje = orders.filter(
    (o) => o.entregadorId === courierId && o.status === "Entregue",
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Afya Grill" className="h-7 w-7 object-contain" />
          <div>
            <p className="font-display text-lg leading-tight">
              Painel do <span className="text-gradient">Motoboy</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {courier.nome} · {courier.veiculo} · {courier.zona}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={switchCourier}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            <Repeat className="h-3.5 w-3.5" /> Trocar
          </button>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {emRota.length > 0 && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Navigation className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg">Em rota</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {emRota.map((o) => (
                  <ActiveDelivery
                    key={o.id}
                    order={o}
                    now={now}
                    onDeliver={() => {
                      markDelivered(o.id);
                      toast.success(`${o.id} entregue!`);
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        <div className="mb-4 mt-10 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Package className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg">Disponíveis para retirada</h2>
        </div>
        {disponiveis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Nenhuma corrida disponível agora.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {disponiveis.map((o) => (
                <AvailableCard
                  key={o.id}
                  order={o}
                  onAccept={() => {
                    acceptDelivery(o.id, courierId);
                    toast.success(`${o.id} aceito`, { description: "Boa rota!" });
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {entreguesHoje.length > 0 && (
          <>
            <div className="mb-4 mt-10 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg">Entregues hoje ({entreguesHoje.length})</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {entreguesHoje.map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <span>
                    {o.id} · {o.cliente}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatElapsed(now - o.criadoEmMs)} atrás
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
