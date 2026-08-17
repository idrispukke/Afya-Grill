import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ActionButton, Field, PageHeader, Panel, Pill, Row, TableShell, brl } from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/admin/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio — Painel Afya Grill" },
      { name: "description", content: "Gerencie pratos, preços, estoque e disponibilidade." },
    ],
  }),
  component: Cardapio,
});

function Cardapio() {
  const { products, toggleProduct, addProduct, removeProduct } = useAdmin();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  return (
    <>
      <PageHeader
        title="Cardápio"
        subtitle="Itens publicados nas casas parceiras."
        action={
          <ActionButton tone="primary" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Novo prato
          </ActionButton>
        }
      />

      <Panel>
        <TableShell head={["Prato", "Casa", "Categoria", "Preço", "Estoque", "Status", "Ação"]}>
          <AnimatePresence initial={false}>
            {products.map((p) => (
              <Row key={p.id}>
                <td className="font-medium">{p.nome}</td>
                <td className="text-muted-foreground">{p.casa}</td>
                <td>{p.categoria}</td>
                <td>{brl(p.preco)}</td>
                <td>
                  <Pill tone={p.estoque < 10 ? "warn" : "neutral"}>{p.estoque} un</Pill>
                </td>
                <td>
                  <Pill tone={p.ativo ? "good" : "bad"}>{p.ativo ? "Ativo" : "Pausado"}</Pill>
                </td>
                <td>
                  <div className="flex gap-2">
                    <ActionButton onClick={() => toggleProduct(p.id)}>
                      {p.ativo ? "Pausar" : "Ativar"}
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      onClick={() => {
                        removeProduct(p.id);
                        toast.success(`${p.nome} removido`);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </ActionButton>
                  </div>
                </td>
              </Row>
            ))}
          </AnimatePresence>
        </TableShell>
      </Panel>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onSubmit={(e) => {
                e.preventDefault();
                addProduct({
                  nome,
                  casa: "Brasa & Cia",
                  categoria: "Principais",
                  preco: Number(preco) || 0,
                  estoque: 10,
                  ativo: true,
                });
                setNome("");
                setPreco("");
                setOpen(false);
                toast.success("Prato adicionado ao cardápio");
              }}
              className="glass w-full max-w-sm space-y-4 rounded-3xl p-6"
            >
              <h2 className="font-display text-xl">Novo prato</h2>
              <Field label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Field
                label="Preço (R$)"
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <ActionButton onClick={() => setOpen(false)}>Cancelar</ActionButton>
                <ActionButton tone="primary" type="submit">
                  Salvar
                </ActionButton>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
