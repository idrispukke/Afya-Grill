import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dish } from "@/data/menu";

export type CartItem = {
  id: string;
  name: string;
  house: string;
  price: number;
  image: string;
  qty: number;
  note?: string | undefined;
};

type CartCtx = {
  items: CartItem[];
  add: (dish: Dish, qty?: number, note?: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "mesa-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value = useMemo<CartCtx>(() => {
    const add: CartCtx["add"] = (dish, qty = 1, note) =>
      setItems((prev) => {
        const found = prev.find((i) => i.id === dish.id);
        if (found)
          return prev.map((i) =>
            i.id === dish.id ? { ...i, qty: i.qty + qty, note: note ?? i.note } : i,
          );
        return [
          ...prev,
          {
            id: dish.id,
            name: dish.name,
            house: dish.house,
            price: dish.price,
            image: dish.image,
            qty,
            note,
          },
        ];
      });

    return {
      items,
      add,
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.id !== id)
            : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
        ),
      clear: () => setItems([]),
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
    };
  }, [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart precisa estar dentro de CartProvider");
  return ctx;
}
