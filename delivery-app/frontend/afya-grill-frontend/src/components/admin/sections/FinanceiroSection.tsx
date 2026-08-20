import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  ActionButton,
  PageHeader,
  Panel,
  Pill,
  Row,
  StatCard,
  TableShell,
  brl,
} from "@/components/admin/AdminUI";
import { RevenueChart } from "@/components/admin/AdminCharts";
import { revenueSeries } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

const periodos = ["7 dias", "30 dias", "Trimestre"] as const;

export function FinanceiroSection() {
  const { payouts, payPayout, products, houses } = useAdmin();
  const [periodo, setPeriodo] = useState<(typeof periodos)[number]>("7 dias");
  const fator = periodo === "7 dias" ? 1 : periodo === "30 dias" ? 4.2 : 12.6;

  const bruto = payouts.reduce((a, p) => a + p.bruto, 0);
  const comissao = payouts.reduce((a, p) => a + (p.bruto * p.taxa) / 100, 0);
  const receitaPeriodo = revenueSeries.reduce((a, d) => a + d.valor, 0) * fator;
  const pedidosPeriodo = Math.round(148 * fator);
  const curva = revenueSeries.map((d) => ({ ...d, valor: Math.round(d.valor * fator) }));

  return (
    <section id="financeiro" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader
        title="Financeiro"
        subtitle="Receita, repasses às casas parceiras e desempenho da operação."
        action={
          <ActionButton tone="primary" onClick={() => toast.success("Relatório exportado em CSV")}>
            <Download className="h-3.5 w-3.5" /> Exportar
          </ActionButton>
        }
      />

      <div className="mb-4 flex gap-2">
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

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          index={0}
          label={`Receita (${periodo})`}
          value={receitaPeriodo}
          format={brl}
          delta="+12,3%"
        />
        <StatCard index={1} label="Pedidos" value={pedidosPeriodo} />
        <StatCard index={2} label="Comissão Afya" value={comissao} format={brl} />
        <StatCard index={3} label="A repassar" value={bruto - comissao} format={brl} />
        <StatCard index={4} label="Tempo médio" value="32 min" delta="-4 min vs período anterior" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Curva de receita"
          description={`Período: ${periodo}`}
        >
          <RevenueChart data={curva} />
        </Panel>
        <Panel title="Repasses" description="Quinzena atual">
          <div className="space-y-3">
            {payouts.map((p) => (
              <div key={p.id} className="rounded-xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.casa}</p>
                    <p className="text-xs text-muted-foreground">{p.periodo}</p>
                  </div>
                  <Pill tone={p.status === "Pago" ? "good" : "warn"}>{p.status}</Pill>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-lg">{brl(p.bruto)}</span>
                  {p.status === "Pendente" && (
                    <ActionButton
                      tone="primary"
                      onClick={() => {
                        payPayout(p.id);
                        toast.success(`Repasse de ${p.casa} liberado`);
                      }}
                    >
                      Pagar
                    </ActionButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Ranking" description="Casas e pratos com melhor desempenho no período">
          <TableShell head={["Casa", "Nota", "Prato destaque", "Preço"]}>
            {houses.map((h, i) => (
              <Row key={h.id}>
                <td className="font-medium">{h.nome}</td>
                <td>{h.nota}</td>
                <td className="text-muted-foreground">{products[i]?.nome ?? "—"}</td>
                <td>{products[i] ? brl(products[i]!.preco) : "—"}</td>
              </Row>
            ))}
          </TableShell>
        </Panel>
      </div>
    </section>
  );
}
