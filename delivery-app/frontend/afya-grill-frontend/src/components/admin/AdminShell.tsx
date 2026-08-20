import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  ReceiptText,
  UtensilsCrossed,
  Store,
  Users,
  Bike,
  TicketPercent,
  Star,
  Wallet,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  CalendarCheck2,
  QrCode,
} from "lucide-react";
import logo from "@/assets/afya-grill-logo.png";
import { useAdmin } from "@/lib/admin";

const SECTION_DETECTION_OFFSET = 120;

const nav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pedidos", label: "Pedidos", icon: ReceiptText },
  { id: "reservas", label: "Reservas", icon: CalendarCheck2 },
  { id: "cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { id: "qrcode", label: "Cardápio digital & QR", icon: QrCode },
  { id: "casas", label: "Casas parceiras", icon: Store },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "entregadores", label: "Entregadores", icon: Bike },
  { id: "cupons", label: "Cupons", icon: TicketPercent },
  { id: "avaliacoes", label: "Avaliações", icon: Star },
  { id: "financeiro", label: "Financeiro", icon: Wallet },
  { id: "equipe", label: "Equipe", icon: UserCog },
  { id: "configuracoes", label: "Configurações", icon: Settings },
] as const;

const SECTION_IDS = nav.map((n) => n.id);

const notifications = [
  { id: 1, title: "Novo pedido recebido", detail: "AFY-2043 · Kaze Sushi Bar", time: "agora" },
  {
    id: 2,
    title: "Reserva aguardando confirmação",
    detail: "AFY-R483 · Thiago Andrade",
    time: "40min atrás",
  },
  {
    id: 3,
    title: "Avaliação aguardando resposta",
    detail: "Caio Bentes · Kaze Sushi Bar",
    time: "3h atrás",
  },
];

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

function useScrollSpy(ids: readonly string[]) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    let ticking = false;

    const compute = () => {
      ticking = false;
      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => !!el);
      if (!sections.length) return;

      let current = sections[0]!.id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= SECTION_DETECTION_OFFSET) current = el.id;
        else break;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return activeId;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useClickOutside<HTMLDivElement>(() => setNotifOpen(false));
  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false));

  const activeId = useScrollSpy(SECTION_IDS);
  const current = nav.find((n) => n.id === activeId);

  const Sidebar = (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link to="/" className="mb-4 flex items-center gap-2 px-2 font-display text-lg">
        <img src={logo} alt="Afya Grill" className="h-8 w-8 object-contain" />
        Afya<span className="text-gradient"> Grill</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {nav.map((item) => {
          const active = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-active"
                  className="absolute inset-0 rounded-xl bg-secondary"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <item.icon className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
              <span className="relative">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <button
        onClick={signOut}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-surface lg:block">
        {Sidebar}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface lg:hidden"
            >
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="text-sm text-muted-foreground">
              Painel <span className="text-foreground">/ {current?.label ?? "Dashboard"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setMenuOpen(false);
                }}
                aria-label="Notificações"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-accent"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-12 z-40 w-72 overflow-hidden rounded-2xl border border-border bg-popover shadow-soft"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm font-medium">Notificações</p>
                    </div>
                    <ul className="max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className="border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-accent/40"
                        >
                          <p className="text-sm">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{n.detail}</p>
                          <p className="mt-1 text-[11px] text-primary">{n.time}</p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs text-muted-foreground">Logado como</p>
              <p className="text-xs font-medium">{user}</p>
            </div>

            <div ref={menuRef} className="relative">
              <button
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
                aria-label="Menu da conta"
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-primary-foreground transition-transform hover:scale-105"
                style={{ background: "var(--gradient-ember)" }}
              >
                {user?.slice(0, 2).toUpperCase()}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-2xl border border-border bg-popover shadow-soft"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-xs text-muted-foreground">Logado como</p>
                      <p className="truncate text-xs font-medium">{user}</p>
                    </div>
                    <a
                      href="#configuracoes"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-accent/50"
                    >
                      Configurações
                    </a>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
