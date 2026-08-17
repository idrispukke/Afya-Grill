import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
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
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import logo from "@/assets/afya-grill-logo.png";
import { useAdmin } from "@/lib/admin";

const nav = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { to: "/admin/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { to: "/admin/casas", label: "Casas parceiras", icon: Store },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/entregadores", label: "Entregadores", icon: Bike },
  { to: "/admin/cupons", label: "Cupons", icon: TicketPercent },
  { to: "/admin/avaliacoes", label: "Avaliações", icon: Star },
  { to: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/equipe", label: "Equipe", icon: UserCog },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const current = nav.find((n) =>
    n.to === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(n.to),
  );

  const Sidebar = (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link to="/" className="mb-4 flex items-center gap-2 px-2 font-display text-lg">
        <img src={logo} alt="Afya Grill" className="h-8 w-8 object-contain" />
        Afya<span className="text-gradient"> Grill</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {nav.map((item) => {
          const active = current?.to === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
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
              <item.icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
            </Link>
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
              Painel <span className="text-foreground">/ {current?.label ?? "Visão geral"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-muted-foreground">Logado como</p>
              <p className="text-xs font-medium">{user}</p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
              style={{ background: "var(--gradient-ember)" }}
            >
              {user?.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
