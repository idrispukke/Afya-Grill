import { useCallback, useEffect, useState } from "react";

/**
 * State that persists to localStorage and stays in sync across every open tab/window
 * (kitchen screen, waiter screen, courier screen, admin panel) via the native `storage`
 * event. Each tab keeps its own React state but converges to the same value whenever
 * any tab writes a new one.
 */
export function useSyncedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupted storage */
    }

    function onStorage(e: StorageEvent) {
      if (e.key !== key || e.newValue == null) return;
      try {
        setState(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore */
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore quota errors */
        }
        return next;
      });
    },
    [key],
  );

  return [state, update] as const;
}
