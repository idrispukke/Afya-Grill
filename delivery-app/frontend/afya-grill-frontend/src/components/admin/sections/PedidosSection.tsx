import { useMemo, useState } from "react";
import { Inbox, ChevronLeft, ChevronRight, GripVertical, X } from "lucide-react";
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

const flow: OrderStatus[] = ["Novo", "Preparando", "A caminho", "Entregue", "Cancelado"];

const columnMeta: Record<OrderStatus, { tone: "neutral" | "good" | "warn" | "bad"; accent: string }> =
  {
    Novo: { tone: "neutral", accent: "border-border/70 bg-surface/70" },
    Preparando: { tone: "warn", accent: "border-gold/30 bg-gold/5" },
    "A caminho": { tone: "good", accent: "border-primary/30 bg-primary/5" },
    Entregue: { tone: "good", accent: "border-primary/20 bg-primary/5" },
    Cancelado: { tone: "bad", accent: "border-destructive/30 bg-destructive/5" },
  };

function getNextStatus(status: OrderStatus) {
  const idx = flow.indexOf(status);
  return flow[Math.min(idx + 1, flow.length - 1)] ?? status;
}

function getPrevStatus(status: OrderStatus) {
  const idx = flow.indexOf(status);
  return flow[Math.max(idx - 1, 0)] ?? status;
}

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
  onBack,
  onCancel,
  draggable = true,
  onDragStart,
  onDragEnd,
}: {
  order: AdminOrder;
  onAdvance: (id: string) => void;
  onBack: (id: string) => void;
  onCancel: (id: string) => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
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
            <GripVertical className="h-4 w-4 text-muted-foreground/70" />
            <p className="font-display text-lg tracking-tight">{order.id}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.criadoEm} · {order.entregador}
          </p>
        </div>
        <Pill tone={meta.tone}>{order.status}</Pill>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl bg-surface px-3 py-2">
          <p className="text-sm font-medium">{order.cliente}</p>
          <p className="text-xs text-muted-foreground">{order.casa}</p>
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
              onClick={() => onBack(order.id)}
              disabled={order.status === "Novo"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Voltar status"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onAdvance(order.id)}
              disabled={order.status === "Entregue" || order.status === "Cancelado"}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--gradient-ember)" }}
            >
              Avançar
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onCancel(order.id)}
              disabled={order.status === "Cancelado"}
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
  const { orders, setOrderStatus } = useAdmin();
  const [busca, setBusca] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [view, setView] = useState<"kanban" | "lista">("kanban");

  const filtrados = useMemo(
    () => orders.filter((o) => matchesSearch(o, busca)),
    [orders, busca],
  );

  const grouped = useMemo(
    () =>
      flow.reduce(
        (acc, status) => {
          acc[status] = filtrados.filter((order) => order.status === status);
          return acc;
        },
        {} as Record<OrderStatus, AdminOrder[]>,
      ),
    [filtrados],
  );

  const onAdvance = (id: string) => {
    const current = orders.find((o) => o.id === id);
    if (!current || current.status === "Entregue" || current.status === "Cancelado") return;
    const next = getNextStatus(current.status);
    setOrderStatus(id, next);
    toast.success(`${id} movido para ${next}`);
  };

  const onBack = (id: string) => {
    const current = orders.find((o) => o.id === id);
    if (!current || current.status === "Novo") return;
    const prev = getPrevStatus(current.status);
    setOrderStatus(id, prev);
    toast.success(`${id} voltou para ${prev}`);
  };

  const onDropToStatus = (id: string, status: OrderStatus) => {
    const current = orders.find((o) => o.id === id);
    if (!current || current.status === status) return;
    setOrderStatus(id, status);
    toast.success(`${id} movido para ${status}`);
  };

  return (
    <section id="pedidos" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader
        title="Pedidos"
        subtitle="Arraste os pedidos entre as colunas ou use os controles rápidos para avançar o fluxo."
        action={
          <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1 text-xs">
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
        }
      />

      <Panel>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(["Todos", ...statusFlow] as const).map((s) => (
              <span
                key={s}
                className="rounded-full bg-secondary px-3.5 py-1.5 text-xs text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pedido, cliente, casa ou item"
            className="ml-auto w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-72"
          />
        </div>

        {view === "kanban" ? (
          <div className="grid gap-4 xl:grid-cols-5">
            {flow.map((status) => {
              const items = grouped[status];
              const meta = columnMeta[status];
              return (
                <div
                  key={status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggingId) onDropToStatus(draggingId, status);
                    setDraggingId(null);
                  }}
                  className={`min-h-[24rem] rounded-3xl border p-3 ${meta.accent}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{status}</p>
                      <p className="text-xs text-muted-foreground">{items.length} pedido(s)</p>
                    </div>
                    <Pill tone={meta.tone}>{items.length}</Pill>
                  </div>

                  <div className="space-y-3">
                    {items.map((order) => (
                      <div
                        key={order.id}
                      >
                        <OrderCard
                          order={order}
                          onAdvance={onAdvance}
                          onBack={onBack}
                          onCancel={setCancelId}
                          onDragStart={() => setDraggingId(order.id)}
                          onDragEnd={() => setDraggingId(null)}
                        />
                      </div>
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
        ) : (
          <div className="space-y-3">
            {filtrados.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={onAdvance}
                onBack={onBack}
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
