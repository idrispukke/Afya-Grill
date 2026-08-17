import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ActionButton, PageHeader, Panel, Pill, Row, StatCard, TableShell, brl } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Painel Afya Grill" },
      { name: "description", content: "Base de clientes, ticket médio e programa VIP." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const { customers, toggleVip } = useAdmin();
  const gasto = customers.reduce((a, c) => a + c.gasto, 0);
  const pedidos = customers.reduce((a, c) => a + c.pedidos, 0);

  return (
    <>
      <PageHeader title="Clientes" subtitle="Quem pede, quanto pede e com que frequência." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Clientes" value={String(customers.length)} />
        <StatCard index={1} label="Receita da base" value={brl(gasto)} />
        <StatCard index={2} label="Ticket médio" value={brl(gasto / pedidos)} />
      </div>

      <Panel>
        <TableShell head={["Cliente", "Contato", "Pedidos", "Gasto total", "Plano", "Ação"]}>
          {customers.map((c) => (
            <Row key={c.id}>
              <td className="font-medium">{c.nome}</td>
              <td className="text-muted-foreground">
                <p>{c.email}</p>
                <p className="text-xs">{c.telefone}</p>
              </td>
              <td>{c.pedidos}</td>
              <td>{brl(c.gasto)}</td>
              <td>
                <Pill tone={c.vip ? "warn" : "neutral"}>{c.vip ? "VIP" : "Padrão"}</Pill>
              </td>
              <td>
                <ActionButton
                  onClick={() => {
                    toggleVip(c.id);
                    toast.success(`${c.nome} ${c.vip ? "voltou ao plano padrão" : "agora é VIP"}`);
                  }}
                >
                  {c.vip ? "Remover VIP" : "Tornar VIP"}
                </ActionButton>
              </td>
            </Row>
          ))}
        </TableShell>
      </Panel>
    </>
  );
}
