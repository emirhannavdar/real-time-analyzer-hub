import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  source: "sim" | "live" | "demo";
  error: string | null;
  lastUpdate: number | null;
  intervalMs: number;
  baseUrl: string;
}

const SOURCE_LABEL = {
  sim: "SİMÜLATÖR BAĞLI",
  live: "API BAĞLI",
  demo: "DEMO VERİ",
} as const;

export function StatusBar({ source, error, lastUpdate, intervalMs, baseUrl }: StatusBarProps) {
  const live = source !== "demo";
  return (
    <div className="panel-surface flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl px-4 py-3">
      <span
        className={cn(
          "inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase",
          live ? "text-signal" : "text-warning",
        )}
      >
        {live ? <Wifi className="size-4" /> : <WifiOff className="size-4" />}
        {SOURCE_LABEL[source]}
      </span>
      <span className="font-mono text-xs text-muted-foreground">{baseUrl}</span>
      <span className="font-mono text-xs text-muted-foreground">
        Yenileme: {(intervalMs / 1000).toFixed(1)} sn
      </span>
      <span className="font-mono text-xs text-muted-foreground">
        Son güncelleme:{" "}
        {lastUpdate ? new Date(lastUpdate).toLocaleTimeString("tr-TR", { hour12: false }) : "—"}
      </span>
      {error ? (
        <span className="inline-flex items-center gap-2 font-mono text-xs text-warning">
          <AlertTriangle className="size-4" />
          {error}
        </span>
      ) : null}
    </div>
  );
}
