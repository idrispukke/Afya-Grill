import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import logo from "@/assets/afya-grill-logo.png";

const SESSION_KEY = "afya-grill:loader-shown";

export function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) === "1" : false,
  );

  useEffect(() => {
    if (done) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(100, ((t - start) / 1700) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          sessionStorage.setItem(SESSION_KEY, "1");
          setDone(true);
        }, 320);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 bg-glow opacity-70" />

          <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute h-24 w-24 rounded-full border border-primary/40 animate-ring" />
            <span
              className="absolute h-24 w-24 rounded-full border border-primary/30 animate-ring"
              style={{ animationDelay: "0.6s" }}
            />
            <motion.span
              className="absolute h-24 w-24 rounded-full border-2 border-transparent border-t-primary border-r-gold"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />
            <motion.img
              src={logo}
              alt="Logo Afya Grill"
              width={1024}
              height={1024}
              className="h-12 w-12 object-contain"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mt-8 font-display text-2xl tracking-tight"
          >
            Afya<span className="text-gradient"> Grill</span>
          </motion.p>
          <p className="relative mt-2 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            preparando a sala
          </p>

          <div className="relative mt-8 h-[3px] w-56 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "var(--gradient-ember)",
                transition: "width 90ms linear",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
