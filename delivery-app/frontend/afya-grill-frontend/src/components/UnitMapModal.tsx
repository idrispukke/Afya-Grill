import { AnimatePresence, motion } from "motion/react";
import { Clock, MapPin, Star, X } from "lucide-react";
import { useEffect } from "react";
import type { Unit } from "@/data/units";

function embedUrl(unit: Unit) {
  const delta = 0.006;
  const bbox = [unit.lng - delta, unit.lat - delta, unit.lng + delta, unit.lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${unit.lat},${unit.lng}&layer=mapnik`;
}

export function UnitMapModal({ unit, onClose }: { unit: Unit | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {unit && (
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
            className="relative w-full max-w-2xl overflow-hidden rounded-t-3xl border border-border bg-surface shadow-ember sm:rounded-3xl"
          >
            <button
              onClick={onClose}
              aria-label="Fechar mapa"
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-transform hover:rotate-90"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-64 w-full overflow-hidden sm:h-80">
              <iframe
                title={`Mapa — ${unit.name}`}
                src={embedUrl(unit)}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">
                {unit.especialidade}
              </p>
              <h3 className="mt-2 text-3xl">{unit.name}</h3>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {unit.rating}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {unit.time}
                </span>
              </div>
              <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {unit.endereco}
              </p>

              <a
                href={`https://www.openstreetmap.org/?mlat=${unit.lat}&mlon=${unit.lng}#map=17/${unit.lat}/${unit.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={{ background: "var(--gradient-ember)" }}
              >
                Abrir rota no mapa
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
