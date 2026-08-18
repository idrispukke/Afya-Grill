import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ActionButton,
  Bars,
  PageHeader,
  Panel,
  Pill,
  Row,
  StatCard,
  TableShell,
  brl,
} from "@/components/admin/AdminUI";
import { revenueSeries } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Painel Afya Grill" },
      { name: "description", content: "Repasses às casas, comissões e receita da plataforma." },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  const { payouts, payPayout } = useAdmin();
  const bruto = payouts.reduce((a, p) => a + p.bruto, 0);
  const comissao = payouts.reduce((a, p) => a + (p.bruto * p.taxa) / 100, 0);

  return (
    <>
      <PageHeader title="Financeiro" subtitle="Fechamento quinzenal das casas parceiras." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="GMV do período" value={brl(bruto)} delta="+12,3%" />
        <StatCard index={1} label="Comissão Afya" value={brl(comissao)} />
        <StatCard index={2} label="A repassar" value={brl(bruto - comissao)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Receita diária">
          <Bars data={revenueSeries} />
        </Panel>
        <Panel title="Repasses" description="Quinzena atual">
          <TableShell head={["Casa", "Bruto", "Status", ""]}>
            {payouts.map((p) => (
              <Row key={p.id}>
                <td>
                  <p className="font-medium">{p.casa}</p>
                  <p className="text-xs text-muted-foreground">{p.periodo}</p>
                </td>
                <td>{brl(p.bruto)}</td>
                <td>
                  <Pill tone={p.status === "Pago" ? "good" : "warn"}>{p.status}</Pill>
                </td>
                <td>
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
                </td>
              </Row>
            ))}
          </TableShell>
        </Panel>
      </div>
    </>
  );
}
