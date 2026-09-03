import { useCallback, useRef } from "react";

/**
 * Corre uma chamada de IA contra um timeout curto. Se a IA não responder a tempo, usa
 * `fallback()` (síncrono, sempre instantâneo) pra nunca deixar o usuário esperando mais
 * que `timeoutMs`. Se a resposta da IA chegar depois — mesmo atrasada — ela ainda
 * substitui o resultado mostrado (quando `upgrade` está ativo), já que é sempre melhor
 * que o fallback local. Chamadas mais novas invalidam automaticamente callbacks de
 * chamadas antigas ainda pendentes (evita sobrescrever com uma resposta desatualizada).
 */
export function useAiRace() {
  const idRef = useRef(0);

  // useCallback com deps fixas ([]) garante que a função retornada tenha identidade
  // estável entre renders — importante porque ela costuma ser chamada de dentro de
  // useEffect, e uma identidade nova a cada render faria o efeito rodar de novo sempre.
  const run = useCallback(
    <T>(
      ai: () => Promise<T>,
      fallback: () => T,
      onResult: (value: T, source: "ai" | "local") => void,
      opts: { timeoutMs?: number; upgrade?: boolean } = {},
    ) => {
      // 4s dá mais espaço pro Gemini responder de verdade antes de cair pro fallback local
      // (mais fraco) — ainda folgado dentro do teto de 5s combinado, e evita trocar uma
      // resposta rica da IA por uma genérica só por causa de meio segundo de diferença.
      const { timeoutMs = 4000, upgrade = true } = opts;
      const id = ++idRef.current;
      let resolved = false;

      const timer = setTimeout(() => {
        if (idRef.current !== id || resolved) return;
        resolved = true;
        onResult(fallback(), "local");
      }, timeoutMs);

      ai()
        .then((value) => {
          if (idRef.current !== id) return;
          clearTimeout(timer);
          if (resolved && !upgrade) return;
          resolved = true;
          onResult(value, "ai");
        })
        .catch(() => {
          if (idRef.current !== id || resolved) return;
          clearTimeout(timer);
          resolved = true;
          onResult(fallback(), "local");
        });
    },
    [],
  );

  return run;
}
