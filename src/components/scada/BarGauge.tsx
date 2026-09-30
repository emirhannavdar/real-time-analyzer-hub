import { cn } from "@/lib/utils";

interface BarGaugeProps {
  value: number;
  min?: number;
  max: number;
  tone?: string;
  className?: string;
}

export function BarGauge({ value, min = 0, max, tone = "bg-signal", className }: BarGaugeProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", tone)}
        style={{ width: `${pct}%`, boxShadow: "0 0 10px currentColor" }}
      />
    </div>
  );
}
