import { useState } from "react";
import { UserX } from "lucide-react";
import { toast } from "sonner";
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  Pill,
  Row,
  StatCard,
  TableShell,
  brl,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

const filtros = ["Todos", "VIP", "Padrão"] as const;

export function ClientesSection() {
  const { customers, toggleVip } = useAdmin();
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos");
  const [busca, setBusca] = useState("");
  const gasto = customers.reduce((a, c) => a + c.gasto, 0);
  const pedidos = customers.reduce((a, c) => a + c.pedidos, 0);

  const lista = customers.filter(
    (c) =>
      (filtro === "Todos" || (filtro === "VIP" ? c.vip : !c.vip)) &&
      (c.nome + c.email).toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <section id="clientes" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Clientes" subtitle="Quem pede, quanto pede e com que frequência." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Clientes" value={customers.length} />
        <StatCard index={1} label="Receita da base" value={gasto} format={brl} />
        <StatCard index={2} label="Ticket médio" value={gasto / pedidos} format={brl} />
      </div>

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filtros.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                filtro === f
                  ? "text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              style={filtro === f ? { background: "var(--gradient-ember)" } : undefined}
            >
              {f}
            </button>
          ))}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="ml-auto w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
          />
        </div>

        <TableShell head={["Cliente", "Contato", "Pedidos", "Gasto total", "Plano", "Ação"]}>
          {lista.map((c) => (
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
        {lista.length === 0 && (
          <EmptyState
            icon={<UserX className="h-5 w-5" />}
            title="Nenhum cliente encontrado"
            hint="Ajuste o filtro ou tente outra busca."
          />
        )}
      </Panel>
    </section>
  );
}
