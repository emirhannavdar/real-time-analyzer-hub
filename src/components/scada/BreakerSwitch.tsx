import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Led } from "./Led";

interface BreakerSwitchProps {
  on: boolean;
  busy?: boolean;
  onToggle: () => void;
}

/**
 * Fiziksel şalter. Kapatıldığında (OFF) API'ye reset_mode=true gider ve
 * analizör tüm değerleri 0 olarak döner.
 */
export function BreakerSwitch({ on, busy, onToggle }: BreakerSwitchProps) {
  return (
    <div className="panel-surface flex flex-col items-center gap-4 rounded-xl p-5">
      <div className="flex w-full items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Ana Şalter
        </span>
        <Led on={!on} tone="alarm" />
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        aria-label={on ? "Şalteri kapat" : "Şalteri aç"}
        className={cn(
          "relative h-40 w-24 rounded-lg border-2 transition-colors duration-300 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          on
            ? "border-signal/60 bg-signal/10"
            : "border-alarm/60 bg-alarm/10",
          busy && "opacity-70",
        )}
      >
        <span className="absolute inset-x-0 top-2 font-mono text-[10px] tracking-widest text-signal">
          ON
        </span>
        <span className="absolute inset-x-0 bottom-2 font-mono text-[10px] tracking-widest text-alarm">
          OFF
        </span>
        <span className="absolute top-1/2 left-1/2 h-24 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/70" />
        <motion.span
          className={cn(
            "absolute left-1/2 h-12 w-12 -translate-x-1/2 rounded-md border shadow-lg",
            on
              ? "border-signal/50 bg-gradient-to-b from-secondary to-panel"
              : "border-alarm/50 bg-gradient-to-b from-panel to-secondary",
          )}
          animate={{ top: on ? 18 : 108, rotate: on ? -3 : 3 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
        >
          <span className="screw absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        </motion.span>
      </button>

      <div className="text-center">
        <p
          className={cn(
            "font-mono text-sm tracking-[0.2em] uppercase",
            on ? "text-signal text-glow" : "text-alarm text-glow",
          )}
        >
          {on ? "ENERJİ VAR" : "RESET MODU"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {on ? "reset_mode = false" : "reset_mode = true · tüm değerler 0"}
        </p>
      </div>
    </div>
  );
}
