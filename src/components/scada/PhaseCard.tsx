import { cn } from "@/lib/utils";
import type { Measurements } from "@/lib/analyzer";
import { BarGauge } from "./BarGauge";
import { DigitalValue } from "./DigitalValue";
import { Led } from "./Led";

interface PhaseCardProps {
  phase: 1 | 2 | 3;
  m: Measurements;
  energized: boolean;
}

export function PhaseCard({ phase, m, energized }: PhaseCardProps) {
  const voltage = m[`voltage_l${phase}` as const];
  const current = m[`current_l${phase}` as const];
  const power = m[`power_l${phase}` as const];
  const reactive = m[`reactive_power_l${phase}` as const];
  const tone = `phase-${phase}` as const;

  return (
    <div className="panel-surface rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className={cn("font-display text-lg font-semibold tracking-wide", `text-${tone}`)}>
          FAZ L{phase}
        </span>
        <Led on={energized} tone={tone} />
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
              GERİLİM
            </span>
            <DigitalValue value={voltage} decimals={2} unit="V" className="text-xl" />
          </div>
          <BarGauge value={voltage} max={260} tone={`bg-${tone}`} className="mt-1.5" />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] tracking-widest text-muted-foreground">AKIM</span>
            <DigitalValue value={current} decimals={2} unit="A" className="text-xl" />
          </div>
          <BarGauge value={current} max={220} tone={`bg-${tone}`} className="mt-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">AKTİF</p>
            <DigitalValue value={power} decimals={2} unit="kW" className="text-base text-primary" />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground">REAKTİF</p>
            <DigitalValue
              value={reactive}
              decimals={2}
              unit="kVAr"
              className="text-base text-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
