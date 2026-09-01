import { useState } from "react";
import {
  ArrowUpRight,
  Bike,
  CalendarCheck2,
  Clock3,
  DollarSign,
  Flame,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Star,
  Store,
  TicketPercent,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import {
  AreaTrend,
  DonutChart,
  LinkCard,
  PageHeader,
  Panel,
  Pill,
  Row,
  StatCard,
  TableShell,
  brl,
  brlInt,
} from "@/components/admin/AdminUI";
import { RevenueChart } from "@/components/admin/AdminCharts";
import { categorySplit, ordersByHour, revenueSeries } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

const TODAY = "2026-08-17";

const periodos = ["Hoje", "7 dias", "30 dias"] as const;
const fatorPeriodo: Record<(typeof periodos)[number], number> = {
  Hoje: 1,
  "7 dias": 6.5,
  "30 dias": 27,
};
const deltaPeriodo: Record<(typeof periodos)[number], string> = {
  Hoje: "+18% vs ontem",
  "7 dias": "+9,4% na semana",
  "30 dias": "+14% no mês",
};

export function OverviewSection() {
  const {
    orders,
    couriers,
    reviews,
    reservations,
    products,
    houses,
    customers,
    coupons,
    staff,
    payouts,
    tables,
  } = useAdmin();

  const [periodo, setPeriodo] = useState<(typeof periodos)[number]>("Hoje");
  const fator = fatorPeriodo[periodo];

  const pedidosPeriodo = Math.round(orders.length * fator);
  const faturamento = orders.reduce((a, o) => a + o.total, 0) * fator;
  const nota = reviews.reduce((a, r) => a + r.nota, 0) / reviews.length;
  const aRepassar = payouts.filter((p) => p.status === "Pendente").reduce((a, p) => a + p.bruto, 0);
  const pedidosEmAndamento = orders.filter((o) => o.status === "Novo" || o.status === "Preparando");
  const reservasPendentes = reservations.filter((r) => r.status === "Pendente");
  const produtosAtivos = products.filter((p) => p.ativo);
  const casasAbertas = houses.filter((h) => h.ativo);
  const cuponsAtivos = coupons.filter((c) => c.ativo);
  const reviewsPendentes = reviews.filter((r) => !r.respondido);
  const ticketMedio = faturamento / Math.max(pedidosPeriodo, 1);
  const reservasHoje = reservations
    .filter((r) => r.data === TODAY)
    .sort((a, b) => (a.hora < b.hora ? -1 : 1));

  return (
    <section id="dashboard" className="scroll-mt-24">
      <PageHeader
        eyebrow="Afya Grill Admin"
        title="Dashboard"
        subtitle="Toda a operação da Afya Grill num só lugar, com leitura rápida de pedidos, reservas, unidades e financeiro."
      />

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">
                Resumo executivo
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
                O painel ficou mais claro para agir rápido.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
                Aqui você acompanha a operação com menos ruído visual, leitura direta e atalhos
                rápidos para o que realmente muda ao longo do dia.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill tone="good">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  Painel protegido
                </Pill>
                <Pill tone="warn">
                  <Clock3 className="mr-1 h-3.5 w-3.5" />
                  Atualização contínua
                </Pill>
                <Pill tone="neutral">
                  <Flame className="mr-1 h-3.5 w-3.5" />
                  Operação ativa
                </Pill>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px] lg:grid-cols-1">
              <div className="rounded-2xl border border-border/70 bg-surface p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Agora</p>
                <p className="mt-1 font-display text-2xl">{pedidosEmAndamento.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Pedidos em andamento</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Pendências
                </p>
                <p className="mt-1 font-display text-2xl">{reservasPendentes.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Reservas aguardando ação</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-surface p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  Financeiro
                </p>
                <p className="mt-1 font-display text-2xl">{brlInt(aRepassar)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Valor a repassar</p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Leituras rápidas
              </p>
              <h3 className="mt-2 font-display text-xl tracking-tight">Indicadores de atenção</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Ticket médio</p>
                  <p className="text-xs text-muted-foreground">Receita média por pedido</p>
                </div>
                <p className="font-display text-xl">{brl(ticketMedio)}</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Unidades ativas</p>
                  <p className="text-xs text-muted-foreground">Casas abertas agora</p>
                </div>
                <p className="font-display text-xl">
                  {casasAbertas.length}/{houses.length}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Pendências abertas</p>
                  <p className="text-xs text-muted-foreground">Pedidos, reviews e reservas</p>
                </div>
                <p className="font-display text-xl">
                  {pedidosEmAndamento.length + reviewsPendentes.length + reservasPendentes.length}
                </p>
              </div>
            </div>
            <a
              href="#pedidos"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Ir para pedidos
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Panel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {periodos.map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`rounded-full px-4 py-1.5 text-xs transition-all ${
              periodo === p
                ? "text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            style={periodo === p ? { background: "var(--gradient-ember)" } : undefined}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          index={0}
          label={`Pedidos (${periodo})`}
          value={pedidosPeriodo}
          delta={deltaPeriodo[periodo]}
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <StatCard
          index={1}
          label={`Faturamento (${periodo})`}
          value={faturamento}
          format={brl}
          delta="+9,4% na semana"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          index={2}
          label="Reservas hoje"
          value={reservasHoje.length}
          delta={`${reservasHoje.reduce((a, r) => a + r.pessoas, 0)} pessoas`}
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatCard
          index={3}
          label="Entregadores ativos"
          value={couriers.filter((c) => c.status !== "Offline").length}
          delta="tempo médio 32 min"
          icon={<Bike className="h-4 w-4" />}
        />
        <StatCard
          index={4}
          label="Nota média"
          value={nota}
          format={(n) => n.toFixed(1)}
          delta={`${reviews.length} avaliações`}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Faturamento da semana" description="Últimos 7 dias">
          <RevenueChart data={revenueSeries} />
        </Panel>
        <Panel title="Pedidos por horário" description="Pico do movimento hoje">
          <AreaTrend data={ordersByHour} xKey="hora" yKey="pedidos" />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Categorias mais pedidas" description="Participação nas vendas do mês">
          <DonutChart data={categorySplit} nameKey="categoria" valueKey="valor" />
        </Panel>

        <Panel title="Reservas do dia" description={`${reservasHoje.length} agendamento(s)`}>
          {reservasHoje.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma reserva para o dia atual ainda.
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
          <a
            href="#reservas"
            className="mt-4 inline-block text-xs text-primary underline-offset-4 hover:underline"
          >
            Ver todas as reservas →
          </a>
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

      <div className="mb-4 mt-8">
        <h2 className="font-display text-xl tracking-tight">Acompanhe toda a loja</h2>
        <p className="text-sm text-muted-foreground">
          Um resumo rápido de cada área da operação - clique num card para rolar até ela.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LinkCard
          index={0}
          id="reservas"
          icon={<CalendarCheck2 className="h-4.5 w-4.5" />}
          title="Reservas"
          hint="aguardando resposta"
          metric={String(reservasPendentes.length)}
        />
        <LinkCard
          index={1}
          id="cardapio"
          icon={<UtensilsCrossed className="h-4.5 w-4.5" />}
          title="Cardápio"
          hint="itens ativos"
          metric={`${produtosAtivos.length}/${products.length}`}
        />
        <LinkCard
          index={2}
          id="qrcode"
          icon={<QrCode className="h-4.5 w-4.5" />}
          title="Cardápio digital & QR"
          hint="mesas com QR gerado"
          metric={String(tables.length)}
        />
        <LinkCard
          index={3}
          id="casas"
          icon={<Store className="h-4.5 w-4.5" />}
          title="Unidades"
          hint="unidades abertas agora"
          metric={`${casasAbertas.length}/${houses.length}`}
        />
        <LinkCard
          index={4}
          id="clientes"
          icon={<Users className="h-4.5 w-4.5" />}
          title="Clientes"
          hint={`${customers.filter((c) => c.vip).length} no plano VIP`}
          metric={String(customers.length)}
        />
        <LinkCard
          index={5}
          id="cupons"
          icon={<TicketPercent className="h-4.5 w-4.5" />}
          title="Cupons"
          hint="cupons ativos agora"
          metric={String(cuponsAtivos.length)}
        />
        <LinkCard
          index={6}
          id="avaliacoes"
          icon={<Star className="h-4.5 w-4.5" />}
          title="Avaliações"
          hint="aguardando resposta"
          metric={String(reviewsPendentes.length)}
        />
        <LinkCard
          index={7}
          id="financeiro"
          icon={<Wallet className="h-4.5 w-4.5" />}
          title="Financeiro"
          hint="a repassar"
          metric={brlInt(aRepassar)}
        />
        <LinkCard
          index={8}
          id="entregadores"
          icon={<Bike className="h-4.5 w-4.5" />}
          title="Entregadores"
          hint="disponíveis na frota"
          metric={`${couriers.filter((c) => c.status !== "Offline").length}/${couriers.length}`}
        />
        <LinkCard
          index={9}
          id="equipe"
          icon={<UserCog className="h-4.5 w-4.5" />}
          title="Equipe"
          hint="com acesso liberado"
          metric={`${staff.filter((s) => s.ativo).length}/${staff.length}`}
        />
      </div>
    </section>
  );
}
