import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Bell,
  CalendarCheck2,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/afya-grill-logo.png";
import { DishCard } from "@/components/DishCard";
import { DishModal } from "@/components/DishModal";
import { categories, dishes, type Dish } from "@/data/menu";
import { units } from "@/data/units";
import { useCart } from "@/lib/cart";
import { slugify } from "@/lib/utils";

const searchSchema = z.object({
  casa: z.string().optional(),
  mesa: z.union([z.string(), z.number()]).optional(),
});

export const Route = createFileRoute("/cardapio")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Cardápio digital — Afya Grill" },
      {
        name: "description",
        content: "Escaneie, veja o cardápio completo e peça direto da mesa com o Afya Grill.",
      },
    ],
  }),
  component: CardapioDigital,
});

function CardapioDigital() {
  const { casa, mesa } = Route.useSearch();
  const { count, subtotal } = useCart();
  const [active, setActive] = useState<(typeof categories)[number]>("Todos");
  const [busca, setBusca] = useState("");
  const [selected, setSelected] = useState<Dish | null>(null);

  // O cardápio é o mesmo em todas as unidades hoje; o "casa" na URL só
  // identifica qual unidade aparece no cabeçalho (vindo do QR Code da mesa).
  const casaNome = useMemo(() => {
    if (!casa) return null;
    return units.find((u) => slugify(u.name) === casa)?.name ?? null;
  }, [casa]);

  const list = dishes.filter(
    (d) =>
      (active === "Todos" || d.category === active) &&
      d.name.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg tracking-tight">
            <img src={logo} alt="Afya Grill" className="h-7 w-7 object-contain" />
            <span className="hidden sm:inline">
              Afya<span className="text-gradient"> Grill</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/reservas"
              className="hidden items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-accent sm:inline-flex"
            >
              <CalendarCheck2 className="h-3.5 w-3.5" /> Reservar mesa
            </Link>
            <Link
              to="/carrinho"
              className="relative inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-primary-foreground"
                    style={{ background: "var(--gradient-ember)" }}
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pt-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-glow opacity-40" />

        <Link
          to="/"
          className="relative inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
        </Link>

        {mesa ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-surface px-5 py-4 shadow-soft"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary">
                Você está na mesa
              </p>
              <p className="mt-1 font-display text-2xl">
                Mesa {mesa}
                {casaNome ? <span className="text-muted-foreground"> · {casaNome}</span> : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  toast.success("Garçom chamado!", {
                    description: "Alguém chega na sua mesa em instantes.",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-medium transition-colors hover:bg-accent"
              >
                <Bell className="h-3.5 w-3.5" /> Chamar garçom
              </button>
              <button
                onClick={() =>
                  toast.success("Conta solicitada", {
                    description: "A equipe já está fechando sua mesa.",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-medium transition-colors hover:bg-accent"
              >
                <Receipt className="h-3.5 w-3.5" /> Pedir a conta
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-5 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.28em]"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />{" "}
            {casaNome ? casaNome : "cardápio digital"}
          </motion.span>
        )}

        <h1 className="relative mt-5 text-4xl sm:text-5xl">
          Escolha e <span className="text-gradient">peça na hora</span>
        </h1>
        <p className="relative mt-2 max-w-lg text-sm text-muted-foreground">
          Toque em um prato para ver detalhes, personalizar e adicionar ao pedido.
        </p>

        <div className="relative mt-6 flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar prato"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`relative rounded-full px-5 py-2 text-sm transition-colors ${
                active === c
                  ? "text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === c && (
                <motion.span
                  layoutId="chip-cardapio"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--gradient-ember)" }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="relative mt-8 grid gap-6 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d, i) => (
            <DishCard key={d.id} dish={d} index={i} onOpen={setSelected} />
          ))}
        </motion.div>

        {list.length === 0 && (
          <p className="relative py-16 text-center text-sm text-muted-foreground">
            Nenhum prato encontrado para essa busca.
          </p>
        )}
      </main>

      <DishModal dish={selected} onClose={() => setSelected(null)} />

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-xl"
          >
            <Link
              to="/carrinho"
              className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember"
              style={{ background: "var(--gradient-ember)" }}
            >
              <span>
                {count} {count === 1 ? "item" : "itens"} na sacola
              </span>
              <span>
                Ver carrinho ·{" "}
                {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
