import { motion } from "motion/react";
import { Star, Clock, Plus } from "lucide-react";
import { brl, type Dish } from "@/data/menu";

export function DishCard({
  dish,
  index,
  onOpen,
}: {
  dish: Dish;
  index: number;
  onOpen: (d: Dish) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      onClick={() => onOpen(dish)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition-colors hover:border-primary/50"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-widest text-foreground">
          {dish.category}
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full glass px-3 py-1 text-[11px]">
          <Star className="h-3 w-3 fill-gold text-gold" /> {dish.rating}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-2xl">{dish.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{dish.description}</p>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="font-display text-xl">{brl(dish.price)}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {dish.time}
            </p>
          </div>
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-primary-foreground shadow-ember transition-transform duration-300 group-hover:rotate-90"
            style={{ background: "var(--gradient-ember)" }}
          >
            <Plus className="h-5 w-5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
