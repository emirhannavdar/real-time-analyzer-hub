import { cn } from "@/lib/utils";

interface LedProps {
  on?: boolean;
  tone?: "signal" | "warning" | "alarm" | "phase-1" | "phase-2" | "phase-3";
  className?: string;
  label?: string;
}

const toneClass: Record<NonNullable<LedProps["tone"]>, string> = {
  signal: "text-signal",
  warning: "text-warning",
  alarm: "text-alarm",
  "phase-1": "text-phase-1",
  "phase-2": "text-phase-2",
  "phase-3": "text-phase-3",
};

export function Led({ on = true, tone = "signal", className, label }: LedProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "size-2.5 rounded-full bg-current transition-opacity duration-500",
          toneClass[tone],
          on ? "led-pulse opacity-100" : "opacity-20",
          className,
        )}
      />
      {label ? (
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
      ) : null}
    </span>
  );
}
