import { useCallback, useEffect, useState } from "react";

export const STAFF_EMAIL = "admin@afyagrill.com";
export const STAFF_PASSWORD = "afya1234@";

export type StaffRole = "cozinha" | "garcom" | "motoboy";

const roleLabels: Record<StaffRole, string> = {
  cozinha: "Painel da cozinha",
  garcom: "Painel do garçom",
  motoboy: "Painel do motoboy",
};

export function staffRoleLabel(role: StaffRole) {
  return roleLabels[role];
}

/**
 * Cada papel (cozinha / garçom / motoboy) tem sua própria sessão independente,
 * então dá pra estar logado nos três painéis ao mesmo tempo em abas ou dispositivos
 * diferentes. As credenciais são únicas por enquanto (mesmo e-mail e senha para os
 * três times), só a sessão é separada.
 */
export function useStaffSession(role: StaffRole) {
  const key = `afya-staff-session-${role}`;
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    try {
      setUser(localStorage.getItem(key));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  const signIn = useCallback(
    (email: string, password: string) => {
      const mail = email.trim().toLowerCase();
      if (mail !== STAFF_EMAIL) {
        return { ok: false, error: "E-mail não reconhecido pela equipe Afya Grill" };
      }
      if (password !== STAFF_PASSWORD) {
        return { ok: false, error: "Senha incorreta" };
      }
      try {
        localStorage.setItem(key, mail);
      } catch {
        /* ignore */
      }
      setUser(mail);
      return { ok: true };
    },
    [key],
  );

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, [key]);

  return { ready, user, signIn, signOut };
}
