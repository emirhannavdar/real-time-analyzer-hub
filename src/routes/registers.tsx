import { createFileRoute } from "@tanstack/react-router";
import {
  REGISTER_BASE,
  REGISTER_COUNT,
  REGISTER_MAP,
  encodeFloat32,
  formatValue,
  toHex,
} from "@/lib/analyzer";
import { StatusBar } from "@/components/scada/StatusBar";
import { useAnalyzer } from "@/hooks/useAnalyzer";

export const Route = createFileRoute("/registers")({
  head: () => ({
    meta: [
      { title: "Register Haritası · Modbus Enerji Analizörü" },
      {
        name: "description",
        content:
          "30000 adresinden başlayan 44 Modbus registerinin canlı ham değerleri ve float32 çözümlemesi.",
      },
      { property: "og:title", content: "Register Haritası · Modbus Enerji Analizörü" },
      {
        property: "og:description",
        content: "44 register, float32 ABCD, canlı ham ve çözülmüş değerler.",
      },
    ],
  }),
  component: Registers,
});

function Registers() {
  const a = useAnalyzer();

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <StatusBar
        live={a.connected}
        error={a.error}
        lastUpdate={a.lastUpdate}
        intervalMs={a.settings.intervalMs}
        baseUrl={a.settings.baseUrl}
      />

      <div className="panel-surface rounded-xl p-4">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-wide">Register Haritası</h1>
          <p className="font-mono text-xs text-muted-foreground">
            BASE {REGISTER_BASE} · {REGISTER_COUNT} register · float32 ABCD
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                <th className="py-2 pr-4">Adres</th>
                <th className="py-2 pr-4">Açıklama</th>
                <th className="py-2 pr-4">Ham (HI / LO)</th>
                <th className="py-2 pr-4 text-right">Değer</th>
                <th className="py-2 text-right">Birim</th>
              </tr>
            </thead>
            <tbody>
              {REGISTER_MAP.map((r) => {
                const value = a.measurements[r.key];
                const [hi, lo] = encodeFloat32(value);
                return (
                  <tr key={r.offset} className="border-b border-border/50 hover:bg-secondary/40">
                    <td className="py-2 pr-4 font-mono text-primary">
                      {REGISTER_BASE + r.offset}–{REGISTER_BASE + r.offset + 1}
                    </td>
                    <td className="py-2 pr-4">{r.label}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                      {toHex(hi)} {toHex(lo)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono tabular-nums text-signal">
                      {formatValue(value, r.decimals)}
                    </td>
                    <td className="py-2 text-right font-mono text-xs text-muted-foreground">
                      {r.unit || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
