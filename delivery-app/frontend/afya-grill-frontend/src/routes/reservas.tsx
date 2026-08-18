import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarCheck2,
  CalendarPlus,
  Check,
  Minus,
  Plus,
  Sparkles,
  Store,
  UserCircle2,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/afya-grill-logo.png";
import { Calendar } from "@/components/ui/calendar";
import type { AdminReservation } from "@/data/admin";
import { useAdmin } from "@/lib/admin";

export const Route = createFileRoute("/reservas")({
  head: () => ({
    meta: [
      { title: "Reservar mesa — Afya Grill" },
      {
        name: "description",
        content: "Reserve sua mesa em uma das filiais da Afya Grill em poucos passos.",
      },
    ],
  }),
  component: ReservasPage,
});

const horariosAlmoco = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
const horariosJantar = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

const stepsInfo = [
  { label: "Filial", icon: Store },
  { label: "Data e horário", icon: CalendarIcon },
  { label: "Seus dados", icon: UserCircle2 },
] as const;

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="relative mt-8 flex items-center justify-between">
      {stepsInfo.map((s, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={s.label} className="relative flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                  done || active
                    ? "border-transparent text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground"
                }`}
                style={done || active ? { background: "var(--gradient-ember)" } : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </span>
              <span
                className={`hidden text-[11px] uppercase tracking-widest sm:block ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {n < stepsInfo.length && (
              <span className={`mx-2 h-px flex-1 sm:mx-3 ${done ? "bg-primary" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ReservasPage() {
  const { houses, addReservation } = useAdmin();
  const filiaisAtivas = useMemo(() => houses.filter((h) => h.ativo), [houses]);

  const [step, setStep] = useState(1);
  const [casa, setCasa] = useState<string>("");
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState<string>("");
  const [pessoas, setPessoas] = useState(2);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacao, setObservacao] = useState("");
  const [confirmada, setConfirmada] = useState<AdminReservation | null>(null);

  const podeAvancarStep1 = !!casa;
  const podeAvancarStep2 = !!data && !!hora;
  const podeConfirmar = nome.trim().length > 0 && telefone.trim().length > 0;

  const submit = () => {
    if (!podeConfirmar || !data || !hora || !casa) {
      toast.error("Preencha nome e telefone para confirmar.");
      return;
    }
    const created = addReservation({
      cliente: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim() || undefined,
      casa,
      pessoas,
      data: isoDate(data),
      hora,
      observacao: observacao.trim() || undefined,
      origem: "Site",
    });
    setConfirmada(created);
    toast.success("Reserva enviada!");
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg tracking-tight">
            <img src={logo} alt="Afya Grill" className="h-7 w-7 object-contain" />
            Afya<span className="text-gradient"> Grill</span>
          </Link>
          <Link
            to="/cardapio"
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
          >
            <UtensilsCrossed className="h-3.5 w-3.5" /> Ver cardápio
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl px-4 pt-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-glow opacity-40" />

        <Link
          to="/"
          className="relative inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
        </Link>

        {confirmada ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-8 overflow-hidden rounded-[2rem] border border-primary/30 bg-surface p-8 text-center shadow-ember sm:p-12"
          >
            <div className="pointer-events-none absolute inset-0 bg-glow" />
            <span
              className="relative mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full text-primary-foreground shadow-ember"
              style={{ background: "var(--gradient-ember)" }}
            >
              <Check className="h-7 w-7" />
            </span>
            <h1 className="relative mt-6 text-3xl sm:text-4xl">
              Reserva <span className="text-gradient">enviada</span>
            </h1>
            <p className="relative mt-2 text-sm text-muted-foreground">
              Você vai receber a confirmação por telefone. Guarde seu código:
            </p>
            <p className="relative mt-5 font-display text-4xl tracking-widest text-gold">
              {confirmada.codigo}
            </p>

            <dl className="relative mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4 text-left text-sm">
              <div className="rounded-xl bg-background px-4 py-3">
                <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Filial
                </dt>
                <dd className="mt-1 font-medium">{confirmada.casa}</dd>
              </div>
              <div className="rounded-xl bg-background px-4 py-3">
                <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Pessoas
                </dt>
                <dd className="mt-1 font-medium">{confirmada.pessoas}</dd>
              </div>
              <div className="rounded-xl bg-background px-4 py-3">
                <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Data
                </dt>
                <dd className="mt-1 font-medium">
                  {confirmada.data.split("-").reverse().join("/")}
                </dd>
              </div>
              <div className="rounded-xl bg-background px-4 py-3">
                <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Horário
                </dt>
                <dd className="mt-1 font-medium">{confirmada.hora}</dd>
              </div>
            </dl>

            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => toast.success("Lembrete adicionado ao calendário")}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <CalendarPlus className="h-4 w-4" /> Adicionar ao calendário
              </button>
              <Link
                to="/cardapio"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
                style={{ background: "var(--gradient-ember)" }}
              >
                Ver cardápio enquanto espera
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-5 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.28em]"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" /> reserva de mesa
            </motion.span>
            <h1 className="relative mt-5 text-4xl sm:text-5xl">
              Sua mesa <span className="text-gradient">te espera</span>
            </h1>
            <p className="relative mt-2 max-w-lg text-sm text-muted-foreground">
              Três passos rápidos: filial, horário e seus dados. Confirmamos em minutos.
            </p>

            <Stepper step={step} />

            <div className="relative mt-8 min-h-[360px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.section
                    key="step1"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="mb-3 text-xs uppercase tracking-[0.28em] text-primary">
                      Em qual filial?
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filiaisAtivas.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => setCasa(h.nome)}
                          className={`rounded-2xl border p-4 text-left transition-colors ${
                            casa === h.nome
                              ? "border-primary bg-surface"
                              : "border-border bg-surface/60 hover:border-primary/40"
                          }`}
                        >
                          <p className="font-display text-lg">{h.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {h.cozinha} · {h.bairro}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.section>
                )}

                {step === 2 && (
                  <motion.section
                    key="step2"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="mb-3 text-xs uppercase tracking-[0.28em] text-primary">
                      Dia, horário e quantas pessoas
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                      <div className="w-fit rounded-2xl border border-border bg-surface p-2">
                        <Calendar
                          mode="single"
                          selected={data}
                          onSelect={setData}
                          disabled={{ before: new Date() }}
                        />
                      </div>
                      <div className="rounded-2xl border border-border bg-surface p-4">
                        {data ? (
                          <p className="mb-3 text-xs text-muted-foreground">{formatDate(data)}</p>
                        ) : (
                          <p className="mb-3 text-xs text-muted-foreground">
                            Selecione um dia no calendário
                          </p>
                        )}
                        <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                          Almoço
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {horariosAlmoco.map((h) => (
                            <button
                              key={h}
                              onClick={() => setHora(h)}
                              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                hora === h
                                  ? "text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:text-foreground"
                              }`}
                              style={
                                hora === h ? { background: "var(--gradient-ember)" } : undefined
                              }
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                        <p className="mb-2 mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">
                          Jantar
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {horariosJantar.map((h) => (
                            <button
                              key={h}
                              onClick={() => setHora(h)}
                              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                hora === h
                                  ? "text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:text-foreground"
                              }`}
                              style={
                                hora === h ? { background: "var(--gradient-ember)" } : undefined
                              }
                            >
                              {h}
                            </button>
                          ))}
                        </div>

                        <p className="mb-2 mt-5 text-[11px] uppercase tracking-widest text-muted-foreground">
                          Pessoas
                        </p>
                        <div className="inline-flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-2">
                          <button
                            onClick={() => setPessoas((p) => Math.max(1, p - 1))}
                            aria-label="Diminuir"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center font-display text-xl">{pessoas}</span>
                          <button
                            onClick={() => setPessoas((p) => Math.min(20, p + 1))}
                            aria-label="Aumentar"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}

                {step === 3 && (
                  <motion.section
                    key="step3"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="mb-3 text-xs uppercase tracking-[0.28em] text-primary">
                      Seus dados
                    </h2>

                    <div className="mb-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-3 py-1.5">{casa}</span>
                      <span className="rounded-full bg-secondary px-3 py-1.5">
                        {data && formatDate(data)}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-1.5">{hora}</span>
                      <span className="rounded-full bg-secondary px-3 py-1.5">
                        {pessoas} pessoa(s)
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-xs">
                        <span className="mb-1.5 block text-muted-foreground">Nome completo</span>
                        <input
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Seu nome"
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                      </label>
                      <label className="block text-xs">
                        <span className="mb-1.5 block text-muted-foreground">
                          Telefone / WhatsApp
                        </span>
                        <input
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="(21) 90000-0000"
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                      </label>
                      <label className="block text-xs sm:col-span-2">
                        <span className="mb-1.5 block text-muted-foreground">
                          E-mail (opcional)
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                      </label>
                      <label className="block text-xs sm:col-span-2">
                        <span className="mb-1.5 block text-muted-foreground">
                          Observações (opcional)
                        </span>
                        <textarea
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          placeholder="Aniversário, restrição alimentar, cadeira de bebê..."
                          rows={3}
                          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                      </label>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            <div className="relative mt-8 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 1 && !podeAvancarStep1) {
                      toast.error("Escolha uma filial para continuar.");
                      return;
                    }
                    if (step === 2 && !podeAvancarStep2) {
                      toast.error("Escolha o dia e o horário para continuar.");
                      return;
                    }
                    setStep((s) => s + 1);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
                  style={{ background: "var(--gradient-ember)" }}
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
                  style={{ background: "var(--gradient-ember)" }}
                >
                  <CalendarCheck2 className="h-4 w-4" /> Confirmar reserva
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
