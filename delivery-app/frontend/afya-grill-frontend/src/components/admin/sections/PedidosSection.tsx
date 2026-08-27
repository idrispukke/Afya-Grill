import { useState } from "react";
import { Bell, Bike, ChefHat, ExternalLink, Inbox, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import {
  ActionButton,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Panel,
  Pill,
  Row,
  TableShell,
  brl,
} from "@/components/admin/AdminUI";
import { statusFlow, type OrderStatus } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

function statusTone(status: OrderStatus): "good" | "bad" | "warn" | "neutral" {
  if (status === "Entregue") return "good";
  if (status === "Cancelado") return "bad";
  return "warn";
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
  const [filtro, setFiltro] = useState<"Todos" | OrderStatus>("Todos");
  const [busca, setBusca] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const lista = orders.filter(
    (o) =>
      (filtro === "Todos" || o.status === filtro) &&
      (o.id + o.cliente + o.casa).toLowerCase().includes(busca.toLowerCase()),
  );

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

  return (
    <section id="pedidos" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader
        title="Pedidos"
        subtitle="Fila operacional com atualização de status, da cozinha até a entrega."
        action={
          <div className="flex flex-wrap gap-2">
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
          </div>
        }
      />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(["Todos", ...statusFlow] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltro(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                filtro === s
                  ? "text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              style={filtro === s ? { background: "var(--gradient-ember)" } : undefined}
            >
              {s}
            </button>
          ))}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pedido, cliente ou casa"
            className="ml-auto w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
          />
        </div>

        <TableShell head={["Pedido", "Cliente", "Canal", "Itens", "Total", "Status", "Ação"]}>
          {lista.map((o) => (
            <Row key={o.id}>
              <td>
                <p className="font-medium">{o.id}</p>
                <p className="text-xs text-muted-foreground">
                  {o.criadoEm} · {o.casa}
                </p>
              </td>
              <td>{o.cliente}</td>
              <td>
                {o.channel === "mesa" ? (
                  <span className="inline-flex items-center gap-1 text-xs">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-primary" /> Mesa {o.mesa}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                    {o.entregador || "sem motoboy"}
                  </span>
                )}
              </td>
              <td className="text-muted-foreground">{o.itens}</td>
              <td>{brl(o.total)}</td>
              <td>
                <Pill tone={statusTone(o.status)}>{o.status}</Pill>
              </td>
              <td>
                <div className="flex gap-2">
                  {o.status !== "Entregue" && o.status !== "Cancelado" && (
                    <ActionButton tone="primary" onClick={() => avancar(o.id)}>
                      Avançar
                    </ActionButton>
                  )}
                  {o.status !== "Entregue" && o.status !== "Cancelado" && (
                    <ActionButton tone="danger" onClick={() => setCancelId(o.id)}>
                      Cancelar
                    </ActionButton>
                  )}
                </div>
              </td>
            </Row>
          ))}
        </TableShell>
        {lista.length === 0 && (
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title="Nenhum pedido neste filtro"
            hint="Ajuste os filtros ou tente outra busca."
          />
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
