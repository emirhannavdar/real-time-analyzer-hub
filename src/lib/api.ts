import { ZERO_MEASUREMENTS, type Measurements, type Reading } from "./analyzer";

export interface ApiSettings {
  baseUrl: string;
  simHost: string;
  simPort: number;
  intervalMs: number;
  forceDemo: boolean;
}

export const DEFAULT_SETTINGS: ApiSettings = {
  baseUrl: "http://127.0.0.1:8000/api/v1",
  simHost: "192.168.1.34",
  simPort: 503,
  intervalMs: 1000,
  forceDemo: false,
};

const STORAGE_KEY = "scada.settings.v1";

export function loadSettings(): ApiSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<ApiSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ApiSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("scada-settings"));
}

function trimBase(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

async function request(baseUrl: string, path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(`${trimBase(baseUrl)}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

function normalize(raw: Partial<Measurements> | undefined): Measurements {
  return { ...ZERO_MEASUREMENTS, ...(raw ?? {}) };
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  errorMessage?: string;
  message?: string;
}

interface RawReading {
  id: number;
  device_id: number;
  measurements: Partial<Measurements>;
  timestamp: string;
}

export async function fetchReadings(baseUrl: string): Promise<Reading[]> {
  const json = (await request(baseUrl, "/modbus")) as ApiEnvelope<RawReading[]>;
  const rows = json.data ?? [];
  return rows
    .map((row) => ({
      id: row.id,
      deviceId: row.device_id,
      timestamp: new Date(row.timestamp).getTime(),
      measurements: normalize(row.measurements),
    }))
    .sort((a, b) => a.id - b.id);
}

export interface DeviceRow {
  id: number;
  name: string;
  host: string;
  port: number;
  unit_id: number;
}

export async function fetchDevices(baseUrl: string): Promise<DeviceRow[]> {
  const json = (await request(baseUrl, "/devices")) as ApiEnvelope<DeviceRow[] | string>;
  const data = typeof json.data === "string" ? (JSON.parse(json.data) as DeviceRow[]) : json.data;
  return Array.isArray(data) ? data : [];
}

/** reset_mode: true => simülatör değerleri 0 döner (şalter kapalı) */
export async function setResetMode(baseUrl: string, value: boolean): Promise<boolean> {
  const json = (await request(baseUrl, `/modbus/reset?value=${value}`, { method: "PUT" })) as {
    data?: boolean;
  };
  return Boolean(json.data);
}
