import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, TicketX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ActionButton,
  ConfirmDialog,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  Pill,
  Row,
  TableShell,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

const filtros = ["Todos", "Ativo", "Pausado"] as const;

export function CuponsSection() {
  const { coupons, toggleCoupon, addCoupon, removeCoupon } = useAdmin();
  const [codigo, setCodigo] = useState("");
  const [valor, setValor] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Todos");
  const removeAlvo = coupons.find((c) => c.id === removeId);

  const lista = coupons.filter(
    (c) => filtro === "Todos" || (filtro === "Ativo" ? c.ativo : !c.ativo),
  );

  return (
    <section id="cupons" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader title="Cupons" subtitle="Campanhas promocionais ativas e pausadas." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
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
          </div>

          <TableShell head={["Código", "Tipo", "Valor", "Usos", "Status", "Ação"]}>
            <AnimatePresence initial={false}>
              {lista.map((c) => (
                <Row key={c.id}>
                  <td className="font-display text-base">{c.codigo}</td>
                  <td className="text-muted-foreground">{c.tipo}</td>
                  <td>{c.tipo === "Percentual" ? `${c.valor}%` : `R$ ${c.valor}`}</td>
                  <td>{c.usos}</td>
                  <td>
                    <Pill tone={c.ativo ? "good" : "bad"}>{c.ativo ? "Ativo" : "Pausado"}</Pill>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <ActionButton onClick={() => toggleCoupon(c.id)}>
                        {c.ativo ? "Pausar" : "Ativar"}
                      </ActionButton>
                      <ActionButton
                        tone="danger"
                        onClick={() => setRemoveId(c.id)}
                        aria-label={`Excluir cupom ${c.codigo}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </ActionButton>
                    </div>
                  </td>
                </Row>
              ))}
            </AnimatePresence>
          </TableShell>
          {lista.length === 0 && (
            <EmptyState
              icon={<TicketX className="h-5 w-5" />}
              title="Nenhum cupom neste filtro"
              hint="Tente outro status."
            />
          )}
        </Panel>

        <Panel title="Criar cupom" description="Vale para todas as casas">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addCoupon({
                codigo: codigo.toUpperCase(),
                tipo: "Percentual",
                valor: Number(valor) || 0,
                ativo: true,
              });
              setCodigo("");
              setValor("");
              toast.success("Cupom criado");
            }}
          >
            <Field
              label="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
            <Field
              label="Desconto (%)"
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
            <ActionButton tone="primary" type="submit">
              <Plus className="h-3.5 w-3.5" /> Criar cupom
            </ActionButton>
          </form>
        </Panel>
      </div>

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId(null)}
        title="Excluir cupom?"
        description={`O código ${removeAlvo?.codigo ?? ""} deixa de funcionar imediatamente para os clientes.`}
        confirmLabel="Excluir"
        onConfirm={() => {
          if (removeId) {
            const codigo = removeAlvo?.codigo;
            removeCoupon(removeId);
            toast.success(`Cupom ${codigo} excluído`);
          }
          setRemoveId(null);
        }}
      />
    </section>
  );
}
