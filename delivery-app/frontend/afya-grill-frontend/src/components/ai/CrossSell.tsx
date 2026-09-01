import { motion } from "motion/react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { brl, dishes, type Dish } from "@/data/menu";
import { aiCrossSell } from "@/lib/ai";
import { useCart, type CartItem } from "@/lib/cart";

export function CrossSell({ items }: { items: CartItem[] }) {
  const { add } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);

  const cartItemIds = items
    .map((i) => i.id)
    .sort()
    .join(",");

  useEffect(() => {
    if (!cartItemIds) {
      setMessage(null);
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    aiCrossSell({ data: { cartItemIds: cartItemIds.split(",") } })
      .then(({ message, itemIds }) => {
        if (cancelled) return;
        setMessage(message || null);
        setSuggestions(
          itemIds.map((id) => dishes.find((d) => d.id === id)).filter((d): d is Dish => Boolean(d)),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setMessage(null);
          setSuggestions([]);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [cartItemIds]);

  if (!loading && suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-primary/25 bg-surface p-4 shadow-soft"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Combina com seu pedido
        </p>
      </div>

      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> pensando em complementos...
        </p>
      ) : (
        <>
          {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
          <div className="mt-3 space-y-2.5">
            {suggestions.map((dish) => (
              <div
                key={dish.id}
                className="flex items-center gap-3 rounded-2xl bg-background p-2.5"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{dish.name}</p>
                  <p className="text-xs text-muted-foreground">{brl(dish.price)}</p>
                </div>
                <button
                  onClick={() => {
                    add(dish);
                    toast.success(`${dish.name} adicionado`);
                  }}
                  aria-label={`Adicionar ${dish.name}`}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary transition-colors hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
