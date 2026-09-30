import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnalyzerSim,
  ZERO_MEASUREMENTS,
  type Measurements,
  type Reading,
} from "@/lib/analyzer";
import {
  DEFAULT_SETTINGS,
  fetchReadings,
  loadSettings,
  setResetMode,
  type ApiSettings,
} from "@/lib/api";
import { readSimulator } from "@/lib/simTcp.functions";
import { setResetModeServer } from "@/lib/reset.functions";
import { toast } from "sonner";

export type Source = "sim" | "live" | "demo";

export interface AnalyzerState {
  measurements: Measurements;
  history: Reading[];
  source: Source;
  connected: boolean;
  error: string | null;
  lastUpdate: number | null;
  breakerOn: boolean;
  toggling: boolean;
  settings: ApiSettings;
  toggleBreaker: () => void;
}

const HISTORY_LIMIT = 60;

export function useSettings(): ApiSettings {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    const sync = () => setSettings(loadSettings());
    sync();
    window.addEventListener("scada-settings", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("scada-settings", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return settings;
}

export function useAnalyzer(): AnalyzerState {
  const settings = useSettings();
  const [measurements, setMeasurements] = useState<Measurements>(ZERO_MEASUREMENTS);
  const [history, setHistory] = useState<Reading[]>([]);
  const [source, setSource] = useState<Source>("demo");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [breakerOn, setBreakerOn] = useState(true);
  const [toggling, setToggling] = useState(false);

  const simRef = useRef<AnalyzerSim | null>(null);
  const breakerRef = useRef(true);
  const seqRef = useRef(0);
  breakerRef.current = breakerOn;

  const push = useCallback((values: Measurements, ts: number) => {
    setMeasurements(values);
    setLastUpdate(ts);
    seqRef.current += 1;
    setHistory((prev) => {
      const next = [...prev, { id: seqRef.current, deviceId: 1, timestamp: ts, measurements: values }];
      return next.slice(-HISTORY_LIMIT);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!simRef.current) simRef.current = new AnalyzerSim();

    const tickDemo = (reason: string | null) => {
      const values = breakerRef.current ? simRef.current!.step() : { ...ZERO_MEASUREMENTS };
      if (cancelled) return;
      setSource("demo");
      setError(reason);
      push(values, Date.now());
    };

    const tick = async () => {
      if (settings.forceDemo) {
        tickDemo(null);
        return;
      }
      // 1) Simülatör (Modbus TCP) — arayüzdeki değerlerin birincil kaynağı
      try {
        const res = await readSimulator({ data: { host: settings.simHost, port: settings.simPort } });
        if (cancelled) return;
        setSource("sim");
        setError(null);
        push(res.measurements, res.timestamp);
        return;
      } catch {
        if (cancelled) return;
      }
      // 2) REST API (veritabanındaki son ölçümler)
      try {
        const rows = await fetchReadings(settings.baseUrl);
        if (cancelled) return;
        const latest = rows[rows.length - 1];
        if (!latest) {
          tickDemo("API'den ölçüm verisi gelmedi.");
          return;
        }
        setSource("live");
        setError(null);
        setMeasurements(latest.measurements);
        setLastUpdate(Date.now());
        setHistory(rows.slice(-HISTORY_LIMIT));
      } catch (e) {
        if (cancelled) return;
        void e;
        tickDemo("Simülatöre ve API'ye ulaşılamadı — yerleşik simülasyon verisi gösteriliyor.");
      }
    };

    // API cevabı beklenirken ekran boş kalmasın: hemen bir demo örneği üret.
    tickDemo(null);
    void tick();
    const id = setInterval(() => void tick(), Math.max(250, settings.intervalMs));
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [settings.baseUrl, settings.simHost, settings.simPort, settings.intervalMs, settings.forceDemo, push]);

  const toggleBreaker = useCallback(() => {
    const next = !breakerRef.current;
    setBreakerOn(next);
    breakerRef.current = next;
    if (!next) setMeasurements({ ...ZERO_MEASUREMENTS });
    if (settings.forceDemo) return;
    setToggling(true);
    // şalter kapalı => reset_mode true => simülatör 0 döner
    void setResetModeServer({ data: { baseUrl: settings.baseUrl, value: !next } })
      .then(() => toast.success(next ? "Şalter açıldı (reset_mode = false)" : "Şalter kapatıldı (reset_mode = true)"))
      .catch(async (err) => {
        // sunucu yolu başarısızsa tarayıcıdan doğrudan dene
        try {
          await setResetMode(settings.baseUrl, !next);
          toast.success("reset_mode güncellendi");
        } catch {
          toast.error("Şalter komutu API'ye iletilemedi", {
            description: err instanceof Error ? err.message : String(err),
          });
        }
      })
      .finally(() => setToggling(false));
  }, [settings.baseUrl, settings.forceDemo]);

  return {
    measurements,
    history,
    source,
    connected: source === "sim" || source === "live",
    error,
    lastUpdate,
    breakerOn,
    toggling,
    settings,
    toggleBreaker,
  };
}
