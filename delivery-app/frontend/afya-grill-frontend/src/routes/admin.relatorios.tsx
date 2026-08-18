import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  ActionButton,
  Bars,
  PageHeader,
  Panel,
  Row,
  StatCard,
  TableShell,
  brl,
} from "@/components/admin/AdminUI";
import { revenueSeries } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Painel Afya Grill" },
      { name: "description", content: "Desempenho por período, casas e categorias de prato." },
    ],
  }),
  component: Relatorios,
});

const periodos = ["7 dias", "30 dias", "Trimestre"] as const;

function Relatorios() {
  const { products, houses } = useAdmin();
  const [periodo, setPeriodo] = useState<(typeof periodos)[number]>("7 dias");
  const fator = periodo === "7 dias" ? 1 : periodo === "30 dias" ? 4.2 : 12.6;
  const total = revenueSeries.reduce((a, d) => a + d.valor, 0) * fator;

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Analise a operação por período."
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
              periodo === p ? "text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
            style={periodo === p ? { background: "var(--gradient-ember)" } : undefined}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label={`Receita (${periodo})`} value={brl(total)} />
        <StatCard
          index={1}
          label="Pedidos"
          value={Math.round(148 * fator).toLocaleString("pt-BR")}
        />
        <StatCard index={2} label="Tempo médio" value="32 min" delta="-4 min vs período anterior" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Curva de receita">
          <Bars data={revenueSeries.map((d) => ({ ...d, valor: d.valor * fator }))} />
        </Panel>
        <Panel title="Ranking" description="Casas e pratos com melhor desempenho">
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
    </>
  );
}
