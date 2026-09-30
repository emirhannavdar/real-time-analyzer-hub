import { cn } from "@/lib/utils";
import type { Measurements } from "@/lib/analyzer";
import { DigitalValue } from "./DigitalValue";
import { Led } from "./Led";

interface AnalyzerDeviceProps {
  m: Measurements;
  energized: boolean;
  live: boolean;
}

const rows = [
  { label: "L1-N", key: "voltage_l1", unit: "V", decimals: 1, tone: "phase-1" },
  { label: "L2-N", key: "voltage_l2", unit: "V", decimals: 1, tone: "phase-2" },
  { label: "L3-N", key: "voltage_l3", unit: "V", decimals: 1, tone: "phase-3" },
] as const;

export function AnalyzerDevice({ m, energized, live }: AnalyzerDeviceProps) {
  return (
    <div className="panel-surface relative rounded-2xl p-5 sm:p-7">
      <span className="screw absolute top-3 left-3 size-3" />
      <span className="screw absolute top-3 right-3 size-3" />
      <span className="screw absolute bottom-3 left-3 size-3" />
      <span className="screw absolute right-3 bottom-3 size-3" />

      <div className="mb-4 flex items-center justify-between px-2">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            Sanal Enerji Analizörü
          </p>
          <p className="text-2xl font-semibold tracking-wide">EA-3000 · 3P4W</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Led on={energized} tone="signal" label={energized ? "RUN" : "HALT"} />
          <Led on={live} tone="warning" label={live ? "LINK" : "DEMO"} />
        </div>
      </div>

      {/* LCD */}
      <div
        className={cn(
          "lcd-screen relative overflow-hidden rounded-lg px-4 py-5 transition-opacity duration-500 sm:px-6",
          energized ? "opacity-100" : "opacity-60",
        )}
      >
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 sweep-line bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.key} className="flex items-baseline justify-between gap-3">
                <span className={cn("font-mono text-xs tracking-widest", `text-${r.tone}`)}>
                  {r.label}
                </span>
                <DigitalValue
                  value={m[r.key]}
                  decimals={r.decimals}
                  unit={r.unit}
                  className="text-lcd-foreground text-glow text-2xl"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-2 border-t border-lcd-foreground/15 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs tracking-widest text-lcd-foreground/70">P.TOT</span>
              <DigitalValue
                value={m.power_total}
                decimals={2}
                unit="kW"
                className="text-lcd-foreground text-glow text-3xl"
              />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs tracking-widest text-lcd-foreground/70">PF</span>
              <DigitalValue
                value={m.power_factor}
                decimals={3}
                className="text-lcd-foreground text-glow text-xl"
              />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs tracking-widest text-lcd-foreground/70">FREQ</span>
              <DigitalValue
                value={m.frequency}
                decimals={2}
                unit="Hz"
                className="text-lcd-foreground text-glow text-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-1 sm:grid-cols-4">
        {[
          { l: "S Toplam", v: m.apparent_power_total, u: "kVA", d: 2 },
          { l: "Q Toplam", v: m.reactive_power_total, u: "kVAr", d: 2 },
          { l: "Aktif Enerji", v: m.active_energy, u: "kWh", d: 1 },
          { l: "Reaktif Enerji", v: m.reactive_energy, u: "kVArh", d: 1 },
        ].map((x) => (
          <div key={x.l} className="rounded-lg border border-border bg-background/40 px-3 py-2">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              {x.l}
            </p>
            <DigitalValue value={x.v} decimals={x.d} unit={x.u} className="text-lg text-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}
