import { useMemo, useState } from "react";
import {
  Bell,
  Bike,
  ChefHat,
  ExternalLink,
  GripVertical,
  Inbox,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Panel,
  Pill,
  brl,
} from "@/components/admin/AdminUI";
import { statusFlow, type AdminOrder, type OrderStatus } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

const columnMeta: Record<
  OrderStatus,
  { tone: "neutral" | "good" | "warn" | "bad"; accent: string }
> = {
  Novo: { tone: "neutral", accent: "border-border/70 bg-surface/70" },
  "Em preparo": { tone: "warn", accent: "border-gold/30 bg-gold/5" },
  Pronto: { tone: "warn", accent: "border-primary/25 bg-primary/5" },
  "A caminho": { tone: "good", accent: "border-primary/30 bg-primary/10" },
  Entregue: { tone: "good", accent: "border-primary/20 bg-primary/5" },
  Cancelado: { tone: "bad", accent: "border-destructive/30 bg-destructive/5" },
};

function matchesSearch(order: AdminOrder, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [order.id, order.cliente, order.casa, order.itens, order.entregador, order.status]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function OrderCard({
  order,
  onAdvance,
  onCancel,
  draggable = true,
  onDragStart,
  onDragEnd,
}: {
  order: AdminOrder;
  onAdvance: (id: string) => void;
  onCancel: (id: string) => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const done = order.status === "Entregue" || order.status === "Cancelado";
  const meta = columnMeta[order.status];

  return (
    <article
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", order.id);
        onDragStart?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      className="group rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {draggable && <GripVertical className="h-4 w-4 text-muted-foreground/70" />}
            <p className="font-display text-lg tracking-tight">{order.id}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.criadoEm} · {order.casa}
          </p>
        </div>
        <Pill tone={meta.tone}>{order.status}</Pill>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl bg-surface px-3 py-2">
          <p className="text-sm font-medium">{order.cliente}</p>
          {order.channel === "mesa" ? (
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <UtensilsCrossed className="h-3.5 w-3.5 text-primary" /> Mesa {order.mesa}
            </span>
          ) : (
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Bike className="h-3.5 w-3.5" /> {order.entregador || "sem motoboy"}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{order.itens}</span>
          <span className="font-medium text-foreground">{brl(order.total)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{order.pagamento}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAdvance(order.id)}
              disabled={done}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--gradient-ember)" }}
            >
              Avançar
            </button>
            <button
              type="button"
              onClick={() => onCancel(order.id)}
              disabled={done}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/15 text-destructive transition-colors hover:bg-destructive/25 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Cancelar pedido"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PedidosSection() {
  const {
    orders,
    couriers,
    setOrderStatus,
    startPreparing,
    markReady,
    deliverToTable,
    acceptDelivery,
    markDelivered,
  } = useAdmin();
  const [busca, setBusca] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "lista">("kanban");

  const filtrados = useMemo(() => orders.filter((o) => matchesSearch(o, busca)), [orders, busca]);

  const grouped = useMemo(
    () =>
      statusFlow.reduce(
        (acc, status) => {
          acc[status] = filtrados.filter((order) => order.status === status);
          return acc;
        },
        {} as Record<OrderStatus, AdminOrder[]>,
      ),
    [filtrados],
  );

  // Avança o pedido para o próximo passo real do fluxo (cozinha -> pronto -> mesa/motoboy -> entregue),
  // chamando a mesma ação usada pelos painéis de cozinha/garçom/motoboy — nunca troca o status "no braço",
  // pra manter a sincronização entre as telas sempre consistente.
  function avancar(id: string) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    if (order.status === "Novo") {
      startPreparing(id);
      toast.success(`${id} entrou em preparo`);
      return;
    }
    if (order.status === "Em preparo") {
      markReady(id);
      toast.success(`${id} está pronto`);
      return;
    }
    if (order.status === "Pronto" && order.channel === "mesa") {
      deliverToTable(id);
      toast.success(`${id} entregue na mesa`);
      return;
    }
    if (order.status === "Pronto" && order.channel === "delivery") {
      const livre = couriers.find((c) => c.status === "Disponível");
      if (!livre) {
        toast.error("Nenhum motoboy disponível agora", {
          description: "Abra o painel do motoboy ou libere um entregador.",
        });
        return;
      }
      acceptDelivery(id, livre.id);
      toast.success(`${id} saiu com ${livre.nome}`);
      return;
    }
    if (order.status === "A caminho") {
      markDelivered(id);
      toast.success(`${id} entregue`);
    }
  }

  // Arrastar solta o pedido sobre uma coluna, mas o efeito é sempre "avançar um passo real" —
  // nunca um salto arbitrário de status — pra não pular a atribuição de motoboy nem descolar da
  // cozinha/garçom/motoboy. Soltar sobre "Cancelado" abre a confirmação de cancelamento.
  function onDropToColumn(id: string, column: OrderStatus) {
    const order = orders.find((o) => o.id === id);
    if (!order || column === order.status) return;
    if (column === "Cancelado") {
      setCancelId(id);
      return;
    }
    avancar(id);
  }

  return (
    <section id="pedidos" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader
        title="Pedidos"
        subtitle="Fila operacional com atualização de status, da cozinha até a entrega."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/cozinha"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              <ChefHat className="h-3.5 w-3.5" /> Cozinha <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="/garcom"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              <Bell className="h-3.5 w-3.5" /> Garçom <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="/motoboy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
            >
              <Bike className="h-3.5 w-3.5" /> Motoboy <ExternalLink className="h-3 w-3" />
            </a>
            <div className="ml-1 flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
              <button
                type="button"
                onClick={() => setView("kanban")}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  view === "kanban" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setView("lista")}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  view === "lista" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        }
      />

      <Panel>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {statusFlow.map((s) => (
            <span
              key={s}
              className="rounded-full bg-secondary px-3.5 py-1.5 text-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pedido, cliente ou casa"
            className="ml-auto w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
          />
        </div>

        {view === "kanban" ? (
          <div className="-mx-5 overflow-x-auto px-5 pb-2">
            <div className="flex min-w-max gap-4">
              {statusFlow.map((status) => {
                const items = grouped[status];
                const meta = columnMeta[status];
                return (
                  <div
                    key={status}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggingId) onDropToColumn(draggingId, status);
                      setDraggingId(null);
                    }}
                    className={`min-h-[24rem] w-64 shrink-0 rounded-3xl border p-3 sm:w-72 ${meta.accent}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium">{status}</p>
                      <Pill tone={meta.tone}>{items.length}</Pill>
                    </div>

                    <div className="space-y-3">
                      {items.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onAdvance={avancar}
                          onCancel={setCancelId}
                          onDragStart={() => setDraggingId(order.id)}
                          onDragEnd={() => setDraggingId(null)}
                        />
                      ))}
                    </div>

                    {items.length === 0 && (
                      <div className="mt-3 rounded-2xl border border-dashed border-border/70 bg-surface/50 p-5 text-center text-xs text-muted-foreground">
                        Solte pedidos aqui
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={avancar}
                onCancel={setCancelId}
                draggable={false}
              />
            ))}
            {filtrados.length === 0 && (
              <EmptyState
                icon={<Inbox className="h-5 w-5" />}
                title="Nenhum pedido neste filtro"
                hint="Ajuste a busca ou troque de visão."
              />
            )}
          </div>
        )}
      </Panel>

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(v) => !v && setCancelId(null)}
        title="Cancelar pedido?"
        description={`O pedido ${cancelId} será marcado como cancelado. Essa ação não pode ser desfeita.`}
        confirmLabel="Cancelar pedido"
        onConfirm={() => {
          if (cancelId) {
            setOrderStatus(cancelId, "Cancelado");
            toast.error(`${cancelId} cancelado`);
          }
          setCancelId(null);
        }}
      />
    </section>
  );
}
