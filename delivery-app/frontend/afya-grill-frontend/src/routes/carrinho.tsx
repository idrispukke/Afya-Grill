import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Bike,
  User,
  Phone,
  MapPin,
  Home,
  Store,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/lib/cart";
import { brl } from "@/data/menu";
import { units } from "@/data/units";

type DeliveryForm = {
  unidade: string;
  nome: string;
  telefone: string;
  endereco: string;
  complemento: string;
};

const emptyDeliveryForm: DeliveryForm = {
  unidade: "",
  nome: "",
  telefone: "",
  endereco: "",
  complemento: "",
};

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — Afya Grill" },
      {
        name: "description",
        content:
          "Revise seu pedido, ajuste quantidades e finalize a entrega das melhores cozinhas da cidade com o Afya Grill.",
      },
      { property: "og:title", content: "Carrinho — Afya Grill" },
      {
        property: "og:description",
        content: "Revise seu pedido e finalize a entrega com o Afya Grill.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, clear, subtotal, count } = useCart();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState<DeliveryForm>(emptyDeliveryForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DeliveryForm, boolean>>>({});

  const delivery = subtotal > 0 ? (subtotal >= 150 ? 0 : 12.9) : 0;
  const discount = applied ? subtotal * 0.1 : 0;
  const total = subtotal + delivery - discount;

  function updateForm<K extends keyof DeliveryForm>(key: K, value: DeliveryForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: false }));
  }

  function onFinalizarPedido() {
    const errors: Partial<Record<keyof DeliveryForm, boolean>> = {
      unidade: form.unidade.trim().length === 0,
      nome: form.nome.trim().length === 0,
      telefone: form.telefone.trim().length < 8,
      endereco: form.endereco.trim().length === 0,
    };
    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      toast.error("Confirma a unidade e seus dados de entrega antes de finalizar");
      return;
    }
    toast.success("Pedido enviado para a cozinha!", {
      description: `${form.unidade} · entrega para ${form.nome} em ${form.endereco}${form.complemento ? `, ${form.complemento}` : ""}.`,
    });
    clear();
    setForm(emptyDeliveryForm);
    setFormErrors({});
    setApplied(false);
    setCoupon("");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-glow opacity-60" />

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-32">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Continuar escolhendo
        </Link>

        <h1 className="mt-6 text-4xl sm:text-5xl">
          Seu <span className="text-gradient">carrinho</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {count > 0 ? `${count} item(ns) reservados na cozinha` : "Ainda não há nada por aqui"}
        </p>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 rounded-3xl border border-border bg-surface p-14 text-center shadow-soft"
          >
            <p className="font-display text-2xl">Mesa vazia</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha um prato no cardápio e ele aparece aqui na hora.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
              style={{ background: "var(--gradient-ember)" }}
            >
              Ver cardápio
            </Link>
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-4 overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-soft"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">
                            {item.house}
                          </p>
                          <h2 className="font-display text-xl">{item.name}</h2>
                          {item.note && (
                            <p className="mt-1 text-xs italic text-muted-foreground">
                              “{item.note}”
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          aria-label={`Remover ${item.name}`}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-xl border border-border px-2 py-1.5">
                          <button
                            onClick={() => setQty(item.id, item.qty - 1)}
                            aria-label="Diminuir"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.id, item.qty + 1)}
                            aria-label="Aumentar"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="font-display text-lg">{brl(item.price * item.qty)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={() => {
                  clear();
                  toast("Carrinho esvaziado");
                }}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Esvaziar carrinho
              </button>
            </div>

            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="h-fit rounded-3xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-28"
            >
              <h2 className="font-display text-2xl">Resumo</h2>

              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Dados de entrega
                </p>

                <label className="block text-xs">
                  <div
                    className={`flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:border-primary ${
                      formErrors.unidade ? "border-destructive" : "border-input"
                    }`}
                  >
                    <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <select
                      value={form.unidade}
                      onChange={(e) => updateForm("unidade", e.target.value)}
                      style={{ colorScheme: "dark" }}
                      className="w-full appearance-none bg-transparent py-2.5 text-sm text-foreground outline-none"
                    >
                      <option value="" disabled>
                        Escolha a unidade
                      </option>
                      {units.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <label className="block text-xs">
                  <div
                    className={`flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:border-primary ${
                      formErrors.nome ? "border-destructive" : "border-input"
                    }`}
                  >
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={form.nome}
                      onChange={(e) => updateForm("nome", e.target.value)}
                      placeholder="Nome completo"
                      autoComplete="name"
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                  </div>
                </label>

                <label className="block text-xs">
                  <div
                    className={`flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:border-primary ${
                      formErrors.telefone ? "border-destructive" : "border-input"
                    }`}
                  >
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={form.telefone}
                      onChange={(e) => updateForm("telefone", e.target.value)}
                      type="tel"
                      placeholder="Telefone com DDD"
                      autoComplete="tel"
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                  </div>
                </label>

                <label className="block text-xs">
                  <div
                    className={`flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:border-primary ${
                      formErrors.endereco ? "border-destructive" : "border-input"
                    }`}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={form.endereco}
                      onChange={(e) => updateForm("endereco", e.target.value)}
                      placeholder="Endereço (rua, número e bairro)"
                      autoComplete="street-address"
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                  </div>
                </label>

                <label className="block text-xs">
                  <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
                    <Home className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={form.complemento}
                      onChange={(e) => updateForm("complemento", e.target.value)}
                      placeholder="Complemento (opcional)"
                      autoComplete="address-line2"
                      className="w-full bg-transparent py-2.5 text-sm outline-none"
                    />
                  </div>
                </label>

                {Object.values(formErrors).some(Boolean) && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Escolha a unidade e preencha
                    nome, telefone e endereço para continuar
                  </p>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Cupom (MESA10)"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => {
                    if (coupon.trim().toUpperCase() === "MESA10") {
                      setApplied(true);
                      toast.success("Cupom aplicado: 10% off");
                    } else {
                      toast.error("Cupom inválido");
                    }
                  }}
                  className="rounded-xl bg-secondary px-4 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Aplicar
                </button>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd className="text-foreground">{brl(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Entrega</dt>
                  <dd className={delivery === 0 ? "text-primary" : "text-foreground"}>
                    {delivery === 0 ? "Grátis" : brl(delivery)}
                  </dd>
                </div>
                {applied && (
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Desconto MESA10</dt>
                    <dd className="text-primary">-{brl(discount)}</dd>
                  </div>
                )}
                <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="font-display text-3xl">{brl(total)}</dd>
                </div>
              </dl>

              <button
                onClick={onFinalizarPedido}
                className="mt-6 w-full rounded-xl py-3.5 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={{ background: "var(--gradient-ember)" }}
              >
                Finalizar pedido
              </button>

              <div className="mt-5 flex flex-col gap-2 text-xs text-muted-foreground">
                <p className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Pagamento protegido
                </p>
                <p className="inline-flex items-center gap-2">
                  <Bike className="h-3.5 w-3.5 text-primary" /> Frete grátis acima de R$ 150
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </main>
    </div>
  );
}
