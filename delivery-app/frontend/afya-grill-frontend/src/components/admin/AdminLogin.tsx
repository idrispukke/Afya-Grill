import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/afya-grill-logo.png";
import { ADMIN_EMAIL, ADMIN_PASSWORD, useAdmin } from "@/lib/admin";

export function AdminLogin() {
  const { signIn } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const res = signIn(email, password);
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Não foi possível entrar");
        return;
      }
      toast.success("Bem-vindo ao painel Afya Grill");
    }, 550);
  }

  function fillDemoCredentials() {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setError(null);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="bg-glow pointer-events-none absolute inset-0 opacity-70" />

      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o site
      </Link>

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative w-full max-w-sm rounded-3xl p-7 shadow-ember"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.img
            src={logo}
            alt="Afya Grill"
            className="h-14 w-14 object-contain"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <h1 className="mt-3 font-display text-2xl">
            Painel <span className="text-gradient">Afya Grill</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">Acesso restrito à equipe interna</p>
        </div>

        <label className="mb-3 block text-xs">
          <span className="mb-1.5 block text-muted-foreground">E-mail corporativo</span>
          <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="admin@afyagrill.com"
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
          </div>
        </label>

        <label className="block text-xs">
          <span className="mb-1.5 block text-muted-foreground">Senha</span>
          <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:border-primary">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: [0, -6, 6, 0] }}
            className="mt-3 flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: "var(--gradient-ember)" }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Verificando..." : "Entrar no painel"}
        </button>

        <button
          type="button"
          onClick={fillDemoCredentials}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Usar credenciais de demonstração
        </button>
      </motion.form>
    </div>
  );
}
