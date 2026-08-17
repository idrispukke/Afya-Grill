import { createFileRoute } from "@tanstack/react-router";
import { Bike, DollarSign, ReceiptText, Star } from "lucide-react";
import { Bars, PageHeader, Panel, Pill, Row, StatCard, TableShell, brl } from "@/components/admin/AdminUI";
import { revenueSeries } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Visão geral — Painel Afya Grill" },
      { name: "description", content: "Indicadores em tempo real da operação Afya Grill." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { orders, couriers, reviews } = useAdmin();
  const faturamento = orders.reduce((a, o) => a + o.total, 0);
  const nota = reviews.reduce((a, r) => a + r.nota, 0) / reviews.length;

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Como a operação está agora em Duque de Caxias." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Pedidos hoje" value={String(orders.length)} delta="+18% vs ontem" icon={<ReceiptText className="h-4 w-4" />} />
        <StatCard index={1} label="Faturamento" value={brl(faturamento)} delta="+9,4% na semana" icon={<DollarSign className="h-4 w-4" />} />
        <StatCard index={2} label="Entregadores ativos" value={String(couriers.filter((c) => c.status !== "Offline").length)} delta="tempo médio 32 min" icon={<Bike className="h-4 w-4" />} />
        <StatCard index={3} label="Nota média" value={nota.toFixed(1)} delta={`${reviews.length} avaliações`} icon={<Star className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Faturamento da semana" description="Últimos 7 dias">
          <Bars data={revenueSeries} />
        </Panel>
        <Panel title="Entregadores" description="Status em tempo real">
          <ul className="space-y-3">
            {couriers.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl bg-surface px-3 py-3">
                <div>
                  <p className="text-sm font-medium">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.veiculo} · {c.zona}
                  </p>
                </div>
                <Pill tone={c.status === "Em rota" ? "warn" : c.status === "Disponível" ? "good" : "neutral"}>
                  {c.status}
                </Pill>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Pedidos recentes" description="Atualizado agora">
          <TableShell head={["Pedido", "Cliente", "Casa", "Total", "Status"]}>
            {orders.map((o) => (
              <Row key={o.id}>
                <td className="font-medium">{o.id}</td>
                <td>{o.cliente}</td>
                <td className="text-muted-foreground">{o.casa}</td>
                <td>{brl(o.total)}</td>
                <td>
                  <Pill tone={o.status === "Entregue" ? "good" : o.status === "Cancelado" ? "bad" : "warn"}>
                    {o.status}
                  </Pill>
                </td>
              </Row>
            ))}
          </TableShell>
        </Panel>
      </div>
    </>
  );
}
