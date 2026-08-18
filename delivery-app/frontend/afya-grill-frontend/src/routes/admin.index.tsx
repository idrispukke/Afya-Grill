import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, CalendarCheck2, DollarSign, ReceiptText, Star } from "lucide-react";
import {
  AreaTrend,
  Bars,
  DonutChart,
  PageHeader,
  Panel,
  Pill,
  Row,
  StatCard,
  TableShell,
  brl,
} from "@/components/admin/AdminUI";
import { categorySplit, ordersByHour, revenueSeries } from "@/data/admin";
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

const TODAY = "2026-08-17";

function Overview() {
  const { orders, couriers, reviews, reservations } = useAdmin();
  const faturamento = orders.reduce((a, o) => a + o.total, 0);
  const nota = reviews.reduce((a, r) => a + r.nota, 0) / reviews.length;
  const reservasHoje = reservations
    .filter((r) => r.data === TODAY)
    .sort((a, b) => (a.hora < b.hora ? -1 : 1));

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Como a operação está agora em Duque de Caxias." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          index={0}
          label="Pedidos hoje"
          value={String(orders.length)}
          delta="+18% vs ontem"
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <StatCard
          index={1}
          label="Faturamento"
          value={brl(faturamento)}
          delta="+9,4% na semana"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          index={2}
          label="Reservas hoje"
          value={String(reservasHoje.length)}
          delta={`${reservasHoje.reduce((a, r) => a + r.pessoas, 0)} pessoas`}
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatCard
          index={3}
          label="Entregadores ativos"
          value={String(couriers.filter((c) => c.status !== "Offline").length)}
          delta="tempo médio 32 min"
          icon={<Bike className="h-4 w-4" />}
        />
        <StatCard
          index={4}
          label="Nota média"
          value={nota.toFixed(1)}
          delta={`${reviews.length} avaliações`}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Faturamento da semana" description="Últimos 7 dias">
          <Bars data={revenueSeries} />
        </Panel>
        <Panel title="Pedidos por horário" description="Pico do movimento hoje">
          <AreaTrend data={ordersByHour} xKey="hora" yKey="pedidos" />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Categorias mais pedidas" description="Participação nas vendas do mês">
          <DonutChart data={categorySplit} nameKey="categoria" valueKey="valor" />
        </Panel>

        <Panel
          title="Reservas de hoje"
          description={`${reservasHoje.length} agendamento(s) via site e QR Code`}
        >
          {reservasHoje.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma reserva para hoje ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {reservasHoje.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {r.hora} · {r.cliente}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.casa} · {r.pessoas} pessoas
                    </p>
                  </div>
                  <Pill
                    tone={
                      r.status === "Confirmada" ? "good" : r.status === "Cancelada" ? "bad" : "warn"
                    }
                  >
                    {r.status}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/reservas"
            className="mt-4 inline-block text-xs text-primary underline-offset-4 hover:underline"
          >
            Ver todas as reservas →
          </Link>
        </Panel>

        <Panel title="Entregadores" description="Status em tempo real">
          <ul className="space-y-3">
            {couriers.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl bg-surface px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.veiculo} · {c.zona}
                  </p>
                </div>
                <Pill
                  tone={
                    c.status === "Em rota" ? "warn" : c.status === "Disponível" ? "good" : "neutral"
                  }
                >
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
                  <Pill
                    tone={
                      o.status === "Entregue" ? "good" : o.status === "Cancelado" ? "bad" : "warn"
                    }
                  >
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
