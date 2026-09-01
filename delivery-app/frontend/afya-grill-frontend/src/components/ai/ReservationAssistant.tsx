import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  Clock,
  Loader2,
  Sparkles,
  Store,
  StickyNote,
  Users,
  WandSparkles,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { aiParseReservation } from "@/lib/ai";
import { parseReservationLocally, type ReservationParsed } from "@/lib/reservationParser";
import { useAiRace } from "@/lib/useAiRace";

export type { ReservationParsed };

function formatDataChip(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground"
    >
      {icon}
      {children}
    </motion.span>
  );
}

export function ReservationAssistant({
  casas,
  onParsed,
}: {
  casas: string[];
  onParsed: (parsed: ReservationParsed) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ReservationParsed | null>(null);
  const race = useAiRace();

  function submit() {
    const value = text.trim();
    if (!value || loading || casas.length === 0) return;
    setLoading(true);
    setPreview(null);

    // Se o Gemini demorar mais que ~2,5s, extrai os campos localmente (data/hora/pessoas
    // por regex) e já mostra a prévia — trocando pela leitura da IA se ela chegar depois,
    // que entende frases mais soltas.
    race(
      () => aiParseReservation({ data: { text: value, casas } }),
      () => parseReservationLocally(value, casas),
      (parsed) => {
        setLoading(false);
        const preenchidos = [parsed.casa, parsed.data, parsed.hora, parsed.pessoas].filter(
          Boolean,
        ).length;
        if (preenchidos === 0) {
          setPreview(null);
          toast.error("Não consegui entender os detalhes — tenta descrever de outro jeito.");
          return;
        }
        setPreview(parsed);
        toast.success("Reserva pré-preenchida! Confira os dados abaixo.");
        onParsed(parsed);
      },
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-6 rounded-2xl border border-primary/25 bg-surface p-4"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Reserva rápida por texto
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Descreva sua reserva e a gente preenche o formulário pra você.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder='Ex: "mesa pra 4, sábado à noite, é aniversário"'
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-ember transition-opacity disabled:opacity-50"
          style={{ background: "var(--gradient-ember)" }}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <WandSparkles className="h-3.5 w-3.5" />
          )}
          Preencher
        </button>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-wrap gap-2">
              {preview.casa && <Chip icon={<Store className="h-3 w-3" />}>{preview.casa}</Chip>}
              {preview.data && (
                <Chip icon={<CalendarDays className="h-3 w-3" />}>
                  {formatDataChip(preview.data)}
                </Chip>
              )}
              {preview.hora && <Chip icon={<Clock className="h-3 w-3" />}>{preview.hora}</Chip>}
              {preview.pessoas && (
                <Chip icon={<Users className="h-3 w-3" />}>{preview.pessoas} pessoa(s)</Chip>
              )}
              {preview.observacao && (
                <Chip icon={<StickyNote className="h-3 w-3" />}>{preview.observacao}</Chip>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
