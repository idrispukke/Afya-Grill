import { AnimatePresence, motion } from "motion/react";
import { Loader2, Plus, Sparkles, Wand2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { brl, dishes, type Dish } from "@/data/menu";
import { aiOrderAssistant } from "@/lib/ai";
import { useCart } from "@/lib/cart";
import { localOrderMessage, searchDishes } from "@/lib/dishSearch";
import { useAiRace } from "@/lib/useAiRace";

const SUGESTOES = [
  "Algo picante e sem carne",
  "Pra duas pessoas por até R$ 60",
  "Uma bebida gelada e leve",
  "O hambúrguer mais pedido",
];

export function OrderAssistant() {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<Dish[] | null>(null);
  const race = useAiRace();

  function ask(text?: string) {
    const q = (text ?? query).trim();
    if (!q || loading) return;
    setQuery(q);
    setLoading(true);
    setMessage(null);
    setResults(null);

    // Se o Gemini não responder em ~2,5s, mostra na hora um resultado calculado local
    // (busca por palavras-chave no cardápio) — e troca pela resposta da IA se ela chegar
    // depois, já que é mais precisa.
    race(
      () => aiOrderAssistant({ data: { query: q } }),
      () => {
        const matched = searchDishes(q, 4);
        return { message: localOrderMessage(matched), itemIds: matched.map((d) => d.id) };
      },
      ({ message, itemIds }) => {
        const matched = itemIds
          .map((id) => dishes.find((d) => d.id === id))
          .filter((d): d is Dish => Boolean(d));
        setMessage(message);
        setResults(matched);
        setLoading(false);
      },
    );
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar assistente de pedido" : "Abrir assistente de pedido"}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 left-5 z-50 flex h-14 items-center gap-2 rounded-full border border-primary/30 bg-surface px-4 text-sm font-semibold shadow-ember"
      >
        {open ? <X className="h-5 w-5" /> : <Wand2 className="h-5 w-5 text-primary" />}
        <span className="hidden sm:inline">{open ? "Fechar" : "O que eu peço?"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="Fechar assistente de pedido"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-background/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 bottom-[9.5rem] top-24 z-50 mx-auto flex max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-ember sm:inset-x-auto sm:left-5 sm:w-[26rem]"
            >
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Assistente de pedido</p>
                  <p className="text-xs text-muted-foreground">
                    Descreva o que você quer e eu escolho pra você
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && ask()}
                    placeholder='Ex: "algo picante e sem carne"'
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => ask()}
                    disabled={loading || !query.trim()}
                    aria-label="Perguntar"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary-foreground disabled:opacity-50"
                    style={{ background: "var(--gradient-ember)" }}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {!message && !loading && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUGESTOES.map((s) => (
                      <button
                        key={s}
                        onClick={() => void ask(s)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {message && (
                  <p className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">
                    {message}
                  </p>
                )}

                {results && results.length === 0 && !loading && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Não achei nada certeiro pra isso — tenta descrever de outro jeito.
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  {results?.map((dish) => (
                    <div
                      key={dish.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        width={64}
                        height={64}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{dish.name}</p>
                        <p className="text-xs text-muted-foreground">{brl(dish.price)}</p>
                      </div>
                      <button
                        onClick={() => {
                          add(dish);
                          toast.success(`${dish.name} adicionado`);
                        }}
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
                      >
                        <Plus className="h-3.5 w-3.5" /> Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
