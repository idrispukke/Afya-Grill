import { toast } from "sonner";
import { ActionButton, PageHeader, Panel, Pill, Row, TableShell } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

export function EquipeSection() {
  const { staff, toggleStaff } = useAdmin();

  return (
    <section id="equipe" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Equipe" subtitle="Contas internas @afyagrill.com com acesso ao painel." />
      <Panel>
        <TableShell head={["Nome", "E-mail", "Cargo", "Acesso", "Ação"]}>
          {staff.map((s) => (
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
      </Panel>
    </section>
  );
}
