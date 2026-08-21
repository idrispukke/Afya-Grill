import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Menu, X, CalendarCheck2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/afya-grill-logo.png";

const links = [
  { href: "/cardapio", label: "Cardápio digital" },
  { href: "/#unidades", label: "Unidades" },
  { href: "/#como", label: "Como funciona" },
  { href: "/#contato", label: "Contato" },
];

export function Navbar() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
          scrolled ? "glass shadow-soft" : "border border-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-tight">
          <img
            src={logo}
            alt="Logo Afya Grill"
            width={1024}
            height={1024}
            className="h-8 w-8 object-contain"
          />
          Afya<span className="text-gradient"> Grill</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/reservas"
            className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground shadow-ember transition-transform hover:scale-105 sm:inline-flex"
            style={{ background: "var(--gradient-ember)" }}
          >
            <CalendarCheck2 className="h-4 w-4" /> Reservar
          </Link>
          <Link
            to="/carrinho"
            className="relative inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium transition-all hover:bg-accent"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Carrinho</span>
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-ember)" }}
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-3 md:hidden"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/reservas"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary-foreground"
              style={{ background: "var(--gradient-ember)" }}
            >
              <CalendarCheck2 className="h-3.5 w-3.5" /> Reservar mesa
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
