import { motion } from "motion/react";
import { Loader2, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { aiParseReservation } from "@/lib/ai";

export type ReservationParsed = {
  casa: string | null;
  data: string | null;
  hora: string | null;
  pessoas: number | null;
  nome: string | null;
  telefone: string | null;
  observacao: string | null;
};

export function ReservationAssistant({
  casas,
  onParsed,
}: {
  casas: string[];
  onParsed: (parsed: ReservationParsed) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const value = text.trim();
    if (!value || loading || casas.length === 0) return;
    setLoading(true);
    try {
      const parsed = await aiParseReservation({ data: { text: value, casas } });
      const preenchidos = [parsed.casa, parsed.data, parsed.hora, parsed.pessoas].filter(
        Boolean,
      ).length;
      if (preenchidos === 0) {
        toast.error("Não consegui entender os detalhes — tenta descrever de outro jeito.");
      } else {
        toast.success("Reserva pré-preenchida! Confira os dados abaixo.");
        onParsed(parsed);
      }
    } catch {
      toast.error("Não consegui processar agora. Tenta de novo em instantes.");
    } finally {
      setLoading(false);
    }
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
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder='Ex: "mesa pra 4, sábado à noite, é aniversário"'
          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={() => void submit()}
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
    </motion.div>
  );
}
