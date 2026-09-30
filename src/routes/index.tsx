import { createFileRoute } from "@tanstack/react-router";
import { AnalyzerDevice } from "@/components/scada/AnalyzerDevice";
import { BreakerSwitch } from "@/components/scada/BreakerSwitch";
import { PhaseCard } from "@/components/scada/PhaseCard";
import { StatusBar } from "@/components/scada/StatusBar";
import { TrendChart } from "@/components/scada/TrendChart";
import { useAnalyzer } from "@/hooks/useAnalyzer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canlı Panel · Modbus Enerji Analizörü" },
      {
        name: "description",
        content:
          "3 fazlı enerji analizörünün canlı gerilim, akım, güç ve enerji değerleri; şalter ile reset modu kontrolü.",
      },
      { property: "og:title", content: "Canlı Panel · Modbus Enerji Analizörü" },
      {
        property: "og:description",
        content: "Modbus TCP enerji analizörü için endüstriyel canlı izleme paneli.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
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

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <AnalyzerDevice m={a.measurements} energized={a.breakerOn} live={a.connected} />
        <BreakerSwitch on={a.breakerOn} busy={a.toggling} onToggle={a.toggleBreaker} />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <PhaseCard phase={1} m={a.measurements} energized={a.breakerOn} />
        <PhaseCard phase={2} m={a.measurements} energized={a.breakerOn} />
        <PhaseCard phase={3} m={a.measurements} energized={a.breakerOn} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <TrendChart history={a.history} metric="voltage" />
        <TrendChart history={a.history} metric="current" />
        <TrendChart history={a.history} metric="power" />
      </div>
    </div>
  );
}
