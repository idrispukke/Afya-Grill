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
  ChevronDown,
  Check,
  Copy,
  QrCode,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
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

type MetodoPagamento = "pix" | "credito" | "debito";

type CartaoForm = {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
};

const emptyCartaoForm: CartaoForm = { numero: "", nome: "", validade: "", cvv: "" };

function gerarCodigoPix(total: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 40; i++) random += chars[Math.floor(Math.random() * chars.length)];
  const valor = total.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136afyagrill-${random.slice(0, 8)}5204000053039865406${valor}5802BR5913Afya Grill6009Sao Paulo62${random.slice(8, 20)}6304${random.slice(20, 24).toUpperCase()}`;
}

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
  const [unidadeAberta, setUnidadeAberta] = useState(false);
  const [pagamento, setPagamento] = useState<MetodoPagamento>("pix");
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [cartao, setCartao] = useState<CartaoForm>(emptyCartaoForm);
  const [cartaoErrors, setCartaoErrors] = useState<Partial<Record<keyof CartaoForm, boolean>>>({});

  const delivery = subtotal > 0 ? (subtotal >= 150 ? 0 : 12.9) : 0;
  const discount = applied ? subtotal * 0.1 : 0;
  const total = subtotal + delivery - discount;

  function updateForm<K extends keyof DeliveryForm>(key: K, value: DeliveryForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: false }));
  }

  function updateCartao<K extends keyof CartaoForm>(key: K, value: CartaoForm[K]) {
    setCartao((prev) => ({ ...prev, [key]: value }));
    setCartaoErrors((prev) => ({ ...prev, [key]: false }));
  }

  useEffect(() => {
    setPixCode((prev) => prev ?? gerarCodigoPix(total));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selecionarPagamento(metodo: MetodoPagamento) {
    setPagamento(metodo);
    if (metodo === "pix" && !pixCode) setPixCode(gerarCodigoPix(total));
  }

  function copiarPix() {
    if (!pixCode) return;
    navigator.clipboard
      .writeText(pixCode)
      .then(() => toast.success("Código Pix copiado"))
      .catch(() => toast.error("Não foi possível copiar o código"));
  }

  function onFinalizarPedido() {
    const errors: Partial<Record<keyof DeliveryForm, boolean>> = {
      unidade: form.unidade.trim().length === 0,
      nome: form.nome.trim().length === 0,
      telefone: form.telefone.trim().length < 8,
      endereco: form.endereco.trim().length === 0,
    };
    const cErrors: Partial<Record<keyof CartaoForm, boolean>> =
      pagamento === "pix"
        ? {}
        : {
            numero: cartao.numero.replace(/\D/g, "").length < 16,
            nome: cartao.nome.trim().length === 0,
            validade: !/^\d{2}\/\d{2}$/.test(cartao.validade),
            cvv: cartao.cvv.trim().length < 3,
          };

    if (Object.values(errors).some(Boolean) || Object.values(cErrors).some(Boolean)) {
      setFormErrors(errors);
      setCartaoErrors(cErrors);
      toast.error("Confirma a unidade, seus dados e a forma de pagamento antes de finalizar");
      return;
    }

    const pagamentoLabel =
      pagamento === "pix"
        ? "Pix"
        : pagamento === "credito"
          ? "Cartão de crédito"
          : "Cartão de débito";
    toast.success("Pedido enviado para a cozinha!", {
      description: `${form.unidade} · ${pagamentoLabel} · entrega para ${form.nome} em ${form.endereco}${form.complemento ? `, ${form.complemento}` : ""}.`,
    });
    clear();
    setForm(emptyDeliveryForm);
    setFormErrors({});
    setApplied(false);
    setCoupon("");
    setPagamento("pix");
    setPixCode(null);
    setCartao(emptyCartaoForm);
    setCartaoErrors({});
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

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUnidadeAberta((v) => !v)}
                    className={`flex w-full items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-left text-sm outline-none focus:border-primary ${
                      formErrors.unidade ? "border-destructive" : "border-input"
                    }`}
                  >
                    <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className={form.unidade ? "text-foreground" : "text-muted-foreground"}>
                      {form.unidade || "Escolha a unidade"}
                    </span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${unidadeAberta ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {unidadeAberta && (
                      <>
                        <button
                          type="button"
                          aria-label="Fechar seleção de unidade"
                          onClick={() => setUnidadeAberta(false)}
                          className="fixed inset-0 z-10 cursor-default"
                        />
                        <motion.ul
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-auto rounded-xl border border-border bg-surface p-1.5 shadow-ember"
                        >
                          {units.map((u) => (
                            <li key={u.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  updateForm("unidade", u.name);
                                  setUnidadeAberta(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                              >
                                {u.name === form.unidade && (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                )}
                                <span className={u.name === form.unidade ? "" : "pl-[22px]"}>
                                  {u.name}
                                </span>
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      </>
                    )}
                  </AnimatePresence>
                </div>

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

              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Forma de pagamento
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => selecionarPagamento("pix")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                      pagamento === "pix"
                        ? "border-primary bg-secondary text-foreground"
                        : "border-input text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <QrCode className="h-4 w-4" /> Pix
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarPagamento("credito")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                      pagamento === "credito"
                        ? "border-primary bg-secondary text-foreground"
                        : "border-input text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarPagamento("debito")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                      pagamento === "debito"
                        ? "border-primary bg-secondary text-foreground"
                        : "border-input text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Débito
                  </button>
                </div>

                {pagamento === "pix" && pixCode && (
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[11px] text-muted-foreground">
                      Código Pix copia e cola (simulado)
                    </p>
                    <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-foreground">
                      {pixCode}
                    </p>
                    <button
                      type="button"
                      onClick={copiarPix}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copiar código
                    </button>
                  </div>
                )}

                {(pagamento === "credito" || pagamento === "debito") && (
                  <div className="space-y-2.5">
                    <input
                      value={cartao.numero}
                      onChange={(e) => updateCartao("numero", e.target.value)}
                      placeholder="Número do cartão"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary ${
                        cartaoErrors.numero ? "border-destructive" : "border-input"
                      }`}
                    />
                    <input
                      value={cartao.nome}
                      onChange={(e) => updateCartao("nome", e.target.value)}
                      placeholder="Nome impresso no cartão"
                      autoComplete="cc-name"
                      className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary ${
                        cartaoErrors.nome ? "border-destructive" : "border-input"
                      }`}
                    />
                    <div className="flex gap-2.5">
                      <input
                        value={cartao.validade}
                        onChange={(e) => updateCartao("validade", e.target.value)}
                        placeholder="Validade (MM/AA)"
                        autoComplete="cc-exp"
                        className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary ${
                          cartaoErrors.validade ? "border-destructive" : "border-input"
                        }`}
                      />
                      <input
                        value={cartao.cvv}
                        onChange={(e) => updateCartao("cvv", e.target.value)}
                        placeholder="CVV"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary ${
                          cartaoErrors.cvv ? "border-destructive" : "border-input"
                        }`}
                      />
                    </div>
                    {Object.values(cartaoErrors).some(Boolean) && (
                      <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Confira os dados do cartão
                      </p>
                    )}
                  </div>
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
