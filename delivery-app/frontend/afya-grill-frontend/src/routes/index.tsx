import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  ChefHat,
  Clock,
  Flame,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import { useRef, useState } from "react";
import heroImg from "@/assets/hero.jpg";
import { Loader } from "@/components/Loader";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { DishCard } from "@/components/DishCard";
import { DishModal } from "@/components/DishModal";
import { categories, dishes, type Dish } from "@/data/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afya Grill — plataforma das melhores cozinhas" },
      {
        name: "description",
        content:
          "Curadoria de restaurantes autorais em um só lugar: peça em segundos, acompanhe o preparo e receba quente. Cardápio, casas parceiras e entrega premium.",
      },
      { property: "og:title", content: "Afya Grill — plataforma das melhores cozinhas" },
      {
        property: "og:description",
        content: "Curadoria de restaurantes autorais, pedido em segundos e entrega impecável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "320+", label: "cozinhas curadas" },
  { value: "28 min", label: "entrega média" },
  { value: "4.9", label: "nota dos clientes" },
  { value: "1.2M", label: "pedidos servidos" },
];

const steps = [
  {
    icon: Search,
    title: "Escolha a casa",
    text: "Curadoria feita por chefs: só entra restaurante que passa na nossa prova de fogo.",
  },
  {
    icon: Utensils,
    title: "Monte o pedido",
    text: "Personalize cada prato, deixe observações e veja o valor atualizar em tempo real.",
  },
  {
    icon: Flame,
    title: "Cozinha em ação",
    text: "A comanda cai direto na cozinha e você acompanha cada etapa do preparo.",
  },
  {
    icon: ChefHat,
    title: "Chegou quente",
    text: "Entregadores com bag térmica selada e rota otimizada para o prato chegar no ponto.",
  },
];

const houses = [
  { name: "Brasa & Cia", type: "Steakhouse", rating: "4.9", time: "25 min" },
  { name: "Osteria Lunare", type: "Italiana", rating: "4.8", time: "35 min" },
  { name: "Kaze Sushi Bar", type: "Japonesa", rating: "5.0", time: "40 min" },
  { name: "Forno Sette", type: "Pizzaria", rating: "4.7", time: "30 min" },
  { name: "Doce Atelier", type: "Confeitaria", rating: "4.9", time: "20 min" },
  { name: "Bar Ébano", type: "Coquetelaria", rating: "4.8", time: "15 min" },
];

const testimonials = [
  {
    name: "Marina Alves",
    role: "Assinante Prime",
    text: "É a única plataforma onde o prato chega igual ao que eu comeria no salão. O tagliatelle veio perfeito.",
  },
  {
    name: "Rafael Duarte",
    role: "Pedidos semanais",
    text: "A curadoria salva. Nunca mais precisei rolar 200 restaurantes ruins pra achar um bom jantar.",
  },
  {
    name: "Chef Lia Prado",
    role: "Osteria Lunare",
    text: "Como restaurante parceiro, o fluxo de comandas é o mais organizado que já usei. Zero pedido perdido.",
  },
];

function Home() {
  const [active, setActive] = useState<(typeof categories)[number]>("Todos");
  const [selected, setSelected] = useState<Dish | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const list = active === "Todos" ? dishes : dishes.filter((d) => d.category === active);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Loader />
      <Navbar />

      {/* HERO */}
      <section ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden">
        <motion.div style={{ y: imgY }} className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Chef finalizando um prato em cozinha de alta gastronomia"
            width={1600}
            height={1200}
            className="h-[115%] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        </motion.div>

        <motion.div style={{ opacity: fade }} className="mx-auto w-full max-w-6xl px-4 pt-28">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.28em]"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" /> curadoria de chefs
          </motion.span>

          <h1 className="mt-6 max-w-3xl text-5xl leading-[1.02] sm:text-7xl lg:text-8xl">
            {["A cidade inteira", "na sua", "mesa."].map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 2 + i * 0.13, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {line === "mesa." ? <span className="text-gradient">mesa.</span> : line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.45, duration: 0.8 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Afya Grill reúne as cozinhas autorais mais desejadas em uma só plataforma. Pedido em
            segundos, preparo acompanhado ao vivo e entrega no ponto exato.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.8 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#menu"
              className="group inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
              style={{ background: "var(--gradient-ember)" }}
            >
              Explorar cardápio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background"
                    style={{ background: "var(--gradient-ember)", opacity: 1 - i * 0.25 }}
                  />
                ))}
              </div>
              <span>
                <strong className="text-foreground">+1.2M</strong> pedidos entregues
              </span>
            </div>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 0.9 }}
            className="mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl text-foreground">{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </section>

      {/* MARQUEE */}
      <div className="relative border-y border-border bg-surface/50 py-5">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, r) => (
            <div key={r} className="flex gap-10">
              {houses.map((h) => (
                <span
                  key={`${r}-${h.name}`}
                  className="font-display text-xl text-muted-foreground"
                >
                  {h.name} <span className="text-primary">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MENU */}
      <section id="menu" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-glow opacity-50" />
        <Reveal>
          <p className="text-xs uppercase tracking-[0.35em] text-primary">o cardápio</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl">
            Pratos que valem <span className="text-gradient">a viagem</span> — sem sair de casa
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`relative rounded-full px-5 py-2 text-sm transition-colors ${
                  active === c
                    ? "text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {active === c && (
                  <motion.span
                    layoutId="chip"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--gradient-ember)" }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d, i) => (
            <DishCard key={d.id} dish={d} index={i} onOpen={setSelected} />
          ))}
        </motion.div>
      </section>

      {/* CASAS */}
      <section id="casas" className="scroll-mt-24 border-y border-border bg-surface/40 py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.35em] text-primary">casas parceiras</p>
            <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl">
              Curadoria fechada. <span className="text-gradient">Nada genérico.</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((h, i) => (
              <Reveal key={h.name} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/60"
                >
                  <div className="absolute inset-x-0 -top-px h-px overflow-hidden">
                    <span className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="font-display text-2xl">{h.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{h.type}</p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold text-gold" /> {h.rating}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {h.time}
                    </span>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.35em] text-primary">como funciona</p>
          <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl">
            Do toque na tela <span className="text-gradient">ao primeiro garfo</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="relative h-full rounded-3xl border border-border bg-surface p-7 shadow-soft">
                <span className="absolute right-6 top-6 font-display text-5xl text-border">
                  0{i + 1}
                </span>
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-ember"
                  style={{ background: "var(--gradient-ember)" }}
                >
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="border-y border-border bg-surface/40 py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="max-w-2xl text-4xl sm:text-5xl">
              Quem senta na <span className="text-gradient">Afya Grill</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure className="h-full rounded-3xl border border-border bg-surface p-7 shadow-soft">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    “{t.text}”
                  </blockquote>
                  <figcaption className="mt-6">
                    <p className="font-display text-lg">{t.name}</p>
                    <p className="text-xs uppercase tracking-widest text-primary">{t.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-4 py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-10 text-center shadow-ember sm:p-16">
            <div className="pointer-events-none absolute inset-0 bg-glow" />
            <span className="relative inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.3em]">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> primeira entrega grátis
            </span>
            <h2 className="relative mt-6 text-4xl sm:text-6xl">
              Sua próxima refeição <span className="text-gradient">memorável</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Comece agora e receba frete grátis no primeiro pedido acima de R$ 80.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#menu"
                className="rounded-2xl px-7 py-4 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
                style={{ background: "var(--gradient-ember)" }}
              >
                Fazer meu pedido
              </a>
              <Link
                to="/carrinho"
                className="rounded-2xl border border-border px-7 py-4 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Ver carrinho
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CONTATO / FOOTER */}
      <footer id="contato" className="scroll-mt-24 border-t border-border bg-surface/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[1.2fr_1fr_1fr]">
          <Reveal>
            <p className="font-display text-3xl">
              Afya<span className="text-gradient"> Grill</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plataforma de restaurantes com curadoria de chefs. Do bistrô de bairro à alta
              gastronomia, tudo em um só lugar.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Mail, Phone].map((Icon, i) => (
                <span
                  key={i}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h3 className="text-xl">Fale com a gente</h3>
            <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <span>
                  (21) 4002-8922
                  <br />
                  seg a dom, 11h às 23h
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <span>ola@afyagrill.com.br</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>
                  Av. Presidente Vargas, 1200 — Centro
                  <br />
                  Duque de Caxias, RJ
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.16}>
            <h3 className="text-xl">Newsletter da casa</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Novas cozinhas, menus sazonais e cupons antes de todo mundo.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex overflow-hidden rounded-xl border border-input bg-background"
            >
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="px-5 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-ember)" }}
              >
                Ok
              </button>
            </form>
          </Reveal>
        </div>
        <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Afya Grill. Todos os direitos reservados.
        </div>
      </footer>

      <DishModal dish={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
