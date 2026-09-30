import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Reading } from "@/lib/analyzer";

interface TrendChartProps {
  history: Reading[];
  metric: "voltage" | "current" | "power";
}

const config = {
  voltage: {
    title: "Gerilim Trendi (V)",
    keys: ["voltage_l1", "voltage_l2", "voltage_l3"] as const,
  },
  current: {
    title: "Akım Trendi (A)",
    keys: ["current_l1", "current_l2", "current_l3"] as const,
  },
  power: {
    title: "Aktif Güç Trendi (kW)",
    keys: ["power_l1", "power_l2", "power_l3"] as const,
  },
};

const colors = ["var(--color-phase-1)", "var(--color-phase-2)", "var(--color-phase-3)"];

export function TrendChart({ history, metric }: TrendChartProps) {
  const cfg = config[metric];
  const data = history.map((r) => ({
    t: new Date(r.timestamp).toLocaleTimeString("tr-TR", { hour12: false }),
    L1: Number(r.measurements[cfg.keys[0]].toFixed(2)),
    L2: Number(r.measurements[cfg.keys[1]].toFixed(2)),
    L3: Number(r.measurements[cfg.keys[2]].toFixed(2)),
  }));

  return (
    <div className="panel-surface rounded-xl p-4">
      <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {cfg.title}
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <XAxis dataKey="t" hide />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={46}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
            />
            {(["L1", "L2", "L3"] as const).map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={colors[i]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
