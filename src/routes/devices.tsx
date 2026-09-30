import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Cpu } from "lucide-react";
import { fetchDevices, type DeviceRow } from "@/lib/api";
import { useSettings } from "@/hooks/useAnalyzer";
import { Led } from "@/components/scada/Led";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "Cihazlar · Modbus Enerji Analizörü" },
      {
        name: "description",
        content: "Kayıtlı Modbus TCP cihazları: ad, host, port ve unit ID bilgileri.",
      },
      { property: "og:title", content: "Cihazlar · Modbus Enerji Analizörü" },
      { property: "og:description", content: "Sahadaki Modbus cihazlarının listesi ve durumu." },
    ],
  }),
  component: Devices,
});

const FALLBACK: DeviceRow[] = [
  { id: 1, name: "Sanal Enerji Analizörü", host: "192.168.1.34", port: 503, unit_id: 1 },
];

function Devices() {
  const settings = useSettings();
  const [devices, setDevices] = useState<DeviceRow[]>(FALLBACK);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDevices(settings.baseUrl)
      .then((rows) => {
        if (cancelled) return;
        setDevices(rows.length ? rows : FALLBACK);
        setLive(rows.length > 0);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setDevices(FALLBACK);
        setLive(false);
        setError("API'ye ulaşılamadı — örnek cihaz gösteriliyor.");
      });
    return () => {
      cancelled = true;
    };
  }, [settings.baseUrl]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-wide">Cihazlar</h1>
        {error ? <p className="font-mono text-xs text-warning">{error}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((d) => (
          <div key={d.id} className="panel-surface rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-md border border-primary/40 bg-primary/10">
                <Cpu className="size-5 text-primary" />
              </span>
              <Led on={live} tone={live ? "signal" : "warning"} label={live ? "KAYITLI" : "ÖRNEK"} />
            </div>
            <p className="font-display text-lg font-semibold">{d.name}</p>
            <dl className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between">
                <dt>ID</dt>
                <dd className="text-foreground">{d.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt>HOST</dt>
                <dd className="text-foreground">{d.host}</dd>
              </div>
              <div className="flex justify-between">
                <dt>PORT</dt>
                <dd className="text-foreground">{d.port}</dd>
              </div>
              <div className="flex justify-between">
                <dt>UNIT ID</dt>
                <dd className="text-foreground">{d.unit_id}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
