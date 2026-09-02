import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
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
  brl,
} from "@/components/admin/AdminUI";
import { useAdmin } from "@/lib/admin";

const categorias = ["Todas", "Destaques", "Principais", "Doces", "Drinks"] as const;

export function CardapioSection() {
  const { products, toggleProduct, addProduct, removeProduct } = useAdmin();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<(typeof categorias)[number]>("Todas");
  const [busca, setBusca] = useState("");
  const removeAlvo = products.find((p) => p.id === removeId);

  const lista = products.filter(
    (p) =>
      (categoria === "Todas" || p.categoria === categoria) &&
      (p.nome + p.casa).toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <section id="cardapio" className="mt-14 scroll-mt-24 border-t border-border/60 pt-14">
      <PageHeader
        title="Cardápio"
        subtitle="Itens publicados nas unidades."
        action={
          <ActionButton tone="primary" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Novo prato
          </ActionButton>
        }
      />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                categoria === c
                  ? "text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              style={categoria === c ? { background: "var(--gradient-ember)" } : undefined}
            >
              {c}
            </button>
          ))}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar prato ou casa"
            className="ml-auto w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-64"
          />
        </div>

        <TableShell head={["Prato", "Casa", "Categoria", "Preço", "Estoque", "Status", "Ação"]}>
          <AnimatePresence initial={false}>
            {lista.map((p) => (
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
                      onClick={() => setRemoveId(p.id)}
                      aria-label={`Remover ${p.nome}`}
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
            icon={<UtensilsCrossed className="h-5 w-5" />}
            title="Nenhum prato neste filtro"
            hint="Ajuste a categoria ou tente outra busca."
          />
        )}
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
                  casa: "Afya Grill Duque de Caxias",
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

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId(null)}
        title="Remover prato?"
        description={`${removeAlvo?.nome ?? "Este item"} sai do cardápio e para de aparecer nas unidades.`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (removeId) {
            const nome = removeAlvo?.nome;
            removeProduct(removeId);
            toast.success(`${nome} removido`);
          }
          setRemoveId(null);
        }}
      />
    </section>
  );
}
