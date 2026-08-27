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
import { QRCodeSVG } from "qrcode.react";
import heroImg from "@/assets/hero.jpg";
import { Loader } from "@/components/Loader";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { DishCard } from "@/components/DishCard";
import { DishModal } from "@/components/DishModal";
import { UnitMapModal } from "@/components/UnitMapModal";
import { categories, dishes, type Dish } from "@/data/menu";
import { units, type Unit } from "@/data/units";
import { siteOrigin } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afya Grill — nosso restaurante, várias unidades" },
      {
        name: "description",
        content:
          "Afya Grill é um restaurante só, com unidades pela Zona Sul do Rio e em Duque de Caxias: peça em segundos, acompanhe o preparo e receba quente.",
      },
      { property: "og:title", content: "Afya Grill — nosso restaurante, várias unidades" },
      {
        property: "og:description",
        content:
          "O mesmo padrão Afya Grill em cada unidade, pedido em segundos e entrega impecável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "6", label: "unidades no Rio e em Caxias" },
  { value: "28 min", label: "entrega média" },
  { value: "4.9", label: "nota dos clientes" },
  { value: "1.2M", label: "pedidos servidos" },
];

const steps = [
  {
    icon: Search,
    title: "Escolha a unidade",
    text: "Todas as unidades seguem o mesmo padrão Afya Grill de qualidade, direto da nossa cozinha.",
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

const testimonials = [
  {
    name: "Marina Alves",
    role: "Cliente Copacabana",
    text: "É a única entrega onde o prato chega igual ao que eu comeria no salão. Sempre no ponto.",
  },
  {
    name: "Rafael Duarte",
    role: "Pedidos semanais",
    text: "Não importa qual unidade eu peço, o padrão é sempre o mesmo. Nunca teve pedido errado.",
  },
  {
    name: "Chef Lia Prado",
    role: "Cozinha Afya Grill Botafogo",
    text: "O fluxo de comandas é o mais organizado que já trabalhei. Zero pedido perdido.",
  },
];

function Home() {
  const [active, setActive] = useState<(typeof categories)[number]>("Todos");
  const [selected, setSelected] = useState<Dish | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
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
            Afya Grill é o nosso restaurante, com unidades pela Zona Sul do Rio e em Duque de
            Caxias. Pedido em segundos, preparo acompanhado ao vivo e entrega no ponto exato.
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
              {units.map((u) => (
                <span key={`${r}-${u.id}`} className="font-display text-xl text-muted-foreground">
                  {u.name} <span className="text-primary">•</span>
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

      {/* UNIDADES */}
      <section id="unidades" className="scroll-mt-24 border-y border-border bg-surface/40 py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.35em] text-primary">nossas unidades</p>
            <h2 className="mt-4 max-w-2xl text-4xl sm:text-5xl">
              O mesmo padrão Afya Grill. <span className="text-gradient">Em cada endereço.</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((u, i) => (
              <Reveal key={u.id} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-colors hover:border-primary/60"
                >
                  <div className="absolute inset-x-0 -top-px h-px overflow-hidden">
                    <span className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100" />
                  </div>

                  <button onClick={() => setSelectedUnit(u)} className="block w-full p-6 text-left">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {u.especialidade}
                    </span>
                    <p className="mt-3 font-display text-2xl">{u.name}</p>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /> {u.bairro},{" "}
                      {u.cidade}
                    </p>
                    <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-gold text-gold" /> {u.rating}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {u.time}
                      </span>
                      <span className="ml-auto text-primary underline-offset-4 group-hover:underline">
                        Ver no mapa
                      </span>
                    </div>
                  </button>

                  <a
                    href={`tel:+55${u.telefone.replace(/\D/g, "")}`}
                    className="flex items-center gap-2 border-t border-border px-6 py-3.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary" /> {u.telefone}
                  </a>
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

        <Reveal delay={0.06}>
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-surface/60 py-3">
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
              {Array.from({ length: 2 }).map((_, r) => (
                <div key={r} className="flex gap-10">
                  {steps.map((s, i) => (
                    <span
                      key={`${r}-${s.title}`}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground"
                    >
                      <span className="text-primary">0{i + 1}</span> {s.title}
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-full overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-soft transition-shadow duration-300 hover:shadow-ember"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px overflow-hidden">
                  <span className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100" />
                </div>
                <span className="absolute right-6 top-6 font-display text-5xl text-border">
                  0{i + 1}
                </span>
                <span className="relative inline-flex h-12 w-12 items-center justify-center">
                  <span className="absolute h-12 w-12 rounded-2xl border border-primary/40 animate-ring" />
                  <span
                    className="absolute h-12 w-12 rounded-2xl border border-gold/40 animate-ring"
                    style={{ animationDelay: "0.7s" }}
                  />
                  <span
                    className="relative inline-flex h-12 w-12 animate-float items-center justify-center rounded-2xl text-primary-foreground shadow-ember"
                    style={{ background: "var(--gradient-ember)" }}
                  >
                    <s.icon className="h-5 w-5" />
                  </span>
                </span>
                <h3 className="mt-6 text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CARDÁPIO DIGITAL / QR */}
      <section className="mx-auto max-w-6xl px-4 py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.35em] text-primary">na sua mesa</p>
            <h2 className="mt-4 max-w-xl text-4xl sm:text-5xl">
              Escaneie o QR Code <span className="text-gradient">e peça na hora</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Cada mesa, em qualquer unidade, tem o próprio QR Code. Aponte a câmera, veja o
              cardápio completo, chame o garçom ou peça a conta — sem esperar ninguém passar na
              mesa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/cardapio"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
                style={{ background: "var(--gradient-ember)" }}
              >
                Ver cardápio digital <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/reservas"
                className="inline-flex items-center gap-2 rounded-2xl border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Reservar uma mesa
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mx-auto flex max-w-xs items-center justify-center">
              <div className="pointer-events-none absolute -inset-10 bg-glow opacity-70" />
              <motion.div
                whileHover={{ y: -6 }}
                className="relative mt-3 flex flex-col items-center gap-5 rounded-[2rem] border border-border bg-surface p-8 shadow-ember"
              >
                <span className="absolute -top-3 left-1/2 w-max -translate-x-1/2 whitespace-nowrap rounded-full glass px-4 py-1 text-[11px] uppercase tracking-widest">
                  Mesa 12 · Afya Grill Duque de Caxias
                </span>
                <div className="rounded-2xl bg-white p-3">
                  <QRCodeSVG
                    value={`${siteOrigin()}/cardapio?casa=duque-de-caxias&mesa=12`}
                    size={168}
                    level="M"
                    fgColor="#1a1108"
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Aponte a câmera do celular para o código
                </p>
              </motion.div>
            </div>
          </Reveal>
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
                to="/reservas"
                className="rounded-2xl border border-border px-7 py-4 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Reservar uma mesa
              </Link>
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
              Nosso restaurante, com o mesmo padrão de qualidade em cada unidade — da Zona Sul do
              Rio a Duque de Caxias.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/afyagrill",
                  label: "Instagram",
                },
                { Icon: Mail, href: "mailto:ola@afyagrill.com.br", label: "E-mail" },
                { Icon: Phone, href: "tel:+552140028922", label: "Telefone" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
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
      <UnitMapModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  );
}
