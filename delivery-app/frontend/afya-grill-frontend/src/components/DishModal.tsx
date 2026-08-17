import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Star, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { brl, type Dish } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export function DishModal({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (dish) {
      setQty(1);
      setNote("");
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dish, onClose]);

  return (
    <AnimatePresence>
      {dish && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Fechar"
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 60, scale: 0.94, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 40, scale: 0.96, opacity: 0, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-t-3xl border border-border bg-surface shadow-ember sm:rounded-3xl"
          >
            <button
              onClick={onClose}
              aria-label="Fechar detalhes"
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-transform hover:rotate-90"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid gap-0 sm:grid-cols-2">
              <div className="relative h-56 overflow-hidden sm:h-full">
                <motion.img
                  src={dish.image}
                  alt={dish.name}
                  width={800}
                  height={800}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent sm:bg-gradient-to-r" />
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">{dish.house}</p>
                <h3 className="mt-2 text-3xl">{dish.name}</h3>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {dish.rating}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {dish.time}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {dish.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {dish.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Alguma observação para a cozinha?"
                  className="mt-5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border px-2 py-1.5">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Diminuir"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty((q) => q + 1)}
                      aria-label="Aumentar"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-display text-2xl">{brl(dish.price * qty)}</p>
                </div>

                <button
                  onClick={() => {
                    add(dish, qty, note || undefined);
                    toast.success(`${dish.name} adicionado ao carrinho`);
                    onClose();
                  }}
                  className="mt-5 w-full rounded-xl py-3.5 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-[1.02] active:scale-[0.99]"
                  style={{ background: "var(--gradient-ember)" }}
                >
                  Adicionar ao carrinho
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
