import { useState } from "react";
import { Inbox } from "lucide-react";
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

export function PedidosSection() {
  const { orders, setOrderStatus } = useAdmin();
  const [filtro, setFiltro] = useState<"Todos" | OrderStatus>("Todos");
  const [busca, setBusca] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const lista = orders.filter(
    (o) =>
      (filtro === "Todos" || o.status === filtro) &&
      (o.id + o.cliente + o.casa).toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <section id="pedidos" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Pedidos" subtitle="Fila operacional com atualização de status." />

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

        <TableShell head={["Pedido", "Cliente", "Itens", "Pagamento", "Total", "Status", "Ação"]}>
          {lista.map((o) => (
            <Row key={o.id}>
              <td>
                <p className="font-medium">{o.id}</p>
                <p className="text-xs text-muted-foreground">
                  {o.criadoEm} · {o.entregador}
                </p>
              </td>
              <td>{o.cliente}</td>
              <td className="text-muted-foreground">{o.itens}</td>
              <td>{o.pagamento}</td>
              <td>{brl(o.total)}</td>
              <td>
                <Pill
                  tone={
                    o.status === "Entregue" ? "good" : o.status === "Cancelado" ? "bad" : "warn"
                  }
                >
                  {o.status}
                </Pill>
              </td>
              <td>
                <div className="flex gap-2">
                  <ActionButton
                    tone="primary"
                    onClick={() => {
                      const next = statusFlow[Math.min(statusFlow.indexOf(o.status) + 1, 3)];
                      if (!next) return;
                      setOrderStatus(o.id, next);
                      toast.success(`${o.id} agora está "${next}"`);
                    }}
                  >
                    Avançar
                  </ActionButton>
                  <ActionButton tone="danger" onClick={() => setCancelId(o.id)}>
                    Cancelar
                  </ActionButton>
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
