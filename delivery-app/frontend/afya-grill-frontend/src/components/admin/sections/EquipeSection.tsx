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
  TableShell,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

const cargos = ["Todos", "Administrador", "Gerente", "Atendente"] as const;

export function EquipeSection() {
  const { staff, toggleStaff } = useAdmin();
  const [cargo, setCargo] = useState<(typeof cargos)[number]>("Todos");

  const lista = staff.filter((s) => cargo === "Todos" || s.cargo === cargo);

  return (
    <section id="equipe" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Equipe" subtitle="Contas internas @afyagrill.com com acesso ao painel." />
      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {cargos.map((c) => (
            <button
              key={c}
              onClick={() => setCargo(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                cargo === c
                  ? "text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              style={cargo === c ? { background: "var(--gradient-ember)" } : undefined}
            >
              {c}
            </button>
          ))}
        </div>

        <TableShell head={["Nome", "E-mail", "Cargo", "Acesso", "Ação"]}>
          {lista.map((s) => (
            <Row key={s.id}>
              <td className="font-medium">{s.nome}</td>
              <td className="text-muted-foreground">{s.email}</td>
              <td>{s.cargo}</td>
              <td>
                <Pill tone={s.ativo ? "good" : "bad"}>{s.ativo ? "Liberado" : "Bloqueado"}</Pill>
              </td>
              <td>
                <ActionButton
                  onClick={() => {
                    toggleStaff(s.id);
                    toast.success(`Acesso de ${s.nome} atualizado`);
                  }}
                >
                  {s.ativo ? "Bloquear" : "Liberar"}
                </ActionButton>
              </td>
            </Row>
          ))}
        </TableShell>
        {lista.length === 0 && (
          <EmptyState
            icon={<UserX className="h-5 w-5" />}
            title="Nenhuma conta neste cargo"
            hint="Escolha outro filtro."
          />
        )}
      </Panel>
    </section>
  );
}
