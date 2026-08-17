import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ActionButton, PageHeader, Panel, Pill, Row, TableShell } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/equipe")({
  head: () => ({
    meta: [
      { title: "Equipe — Painel Afya Grill" },
      { name: "description", content: "Usuários internos com acesso ao painel e seus cargos." },
    ],
  }),
  component: Equipe,
});

function Equipe() {
  const { staff, toggleStaff } = useAdmin();

  return (
    <>
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
    </>
  );
}
