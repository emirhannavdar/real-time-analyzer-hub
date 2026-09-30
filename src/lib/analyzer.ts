/**
 * Enerji analizörü veri modeli.
 * Register haritası ve float32 çözümlemesi, sahadaki simülatörle birebir aynıdır:
 * BASE = 30000, 44 register, IEEE754 float32, ABCD (big-endian).
 */

export const REGISTER_BASE = 30000;
export const REGISTER_COUNT = 44;

export type MeasurementKey =
  | "voltage_l1"
  | "voltage_l2"
  | "voltage_l3"
  | "voltage_l1_l2"
  | "voltage_l2_l3"
  | "voltage_l3_l1"
  | "current_l1"
  | "current_l2"
  | "current_l3"
  | "power_l1"
  | "power_l2"
  | "power_l3"
  | "power_total"
  | "reactive_power_l1"
  | "reactive_power_l2"
  | "reactive_power_l3"
  | "reactive_power_total"
  | "apparent_power_total"
  | "power_factor"
  | "frequency"
  | "active_energy"
  | "reactive_energy";

export type Measurements = Record<MeasurementKey, number>;

export interface RegisterDef {
  offset: number;
  key: MeasurementKey;
  label: string;
  unit: string;
  decimals: number;
}

export const REGISTER_MAP: RegisterDef[] = [
  { offset: 0, key: "voltage_l1", label: "Gerilim L1-N", unit: "V", decimals: 2 },
  { offset: 2, key: "voltage_l2", label: "Gerilim L2-N", unit: "V", decimals: 2 },
  { offset: 4, key: "voltage_l3", label: "Gerilim L3-N", unit: "V", decimals: 2 },
  { offset: 6, key: "voltage_l1_l2", label: "Gerilim L1-L2", unit: "V", decimals: 2 },
  { offset: 8, key: "voltage_l2_l3", label: "Gerilim L2-L3", unit: "V", decimals: 2 },
  { offset: 10, key: "voltage_l3_l1", label: "Gerilim L3-L1", unit: "V", decimals: 2 },
  { offset: 12, key: "current_l1", label: "Akım L1", unit: "A", decimals: 2 },
  { offset: 14, key: "current_l2", label: "Akım L2", unit: "A", decimals: 2 },
  { offset: 16, key: "current_l3", label: "Akım L3", unit: "A", decimals: 2 },
  { offset: 18, key: "power_l1", label: "Aktif Güç L1", unit: "kW", decimals: 3 },
  { offset: 20, key: "power_l2", label: "Aktif Güç L2", unit: "kW", decimals: 3 },
  { offset: 22, key: "power_l3", label: "Aktif Güç L3", unit: "kW", decimals: 3 },
  { offset: 24, key: "power_total", label: "Aktif Güç Toplam", unit: "kW", decimals: 3 },
  { offset: 26, key: "reactive_power_l1", label: "Reaktif Güç L1", unit: "kVAr", decimals: 3 },
  { offset: 28, key: "reactive_power_l2", label: "Reaktif Güç L2", unit: "kVAr", decimals: 3 },
  { offset: 30, key: "reactive_power_l3", label: "Reaktif Güç L3", unit: "kVAr", decimals: 3 },
  { offset: 32, key: "reactive_power_total", label: "Reaktif Güç Toplam", unit: "kVAr", decimals: 3 },
  { offset: 34, key: "apparent_power_total", label: "Görünür Güç Toplam", unit: "kVA", decimals: 3 },
  { offset: 36, key: "power_factor", label: "Güç Faktörü Toplam", unit: "", decimals: 3 },
  { offset: 38, key: "frequency", label: "Frekans", unit: "Hz", decimals: 3 },
  { offset: 40, key: "active_energy", label: "Aktif Enerji (İthal)", unit: "kWh", decimals: 2 },
  { offset: 42, key: "reactive_energy", label: "Reaktif Enerji (End.)", unit: "kVArh", decimals: 2 },
];

export const ZERO_MEASUREMENTS: Measurements = REGISTER_MAP.reduce((acc, r) => {
  acc[r.key] = 0;
  return acc;
}, {} as Measurements);

/** float32 -> iki adet uint16 register (ABCD) */
export function encodeFloat32(value: number): [number, number] {
  const buf = new DataView(new ArrayBuffer(4));
  buf.setFloat32(0, value, false);
  return [buf.getUint16(0, false), buf.getUint16(2, false)];
}

export function toHex(word: number): string {
  return "0x" + word.toString(16).toUpperCase().padStart(4, "0");
}

export interface Reading {
  id: number;
  deviceId: number;
  timestamp: number;
  measurements: Measurements;
}

export function formatValue(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "---";
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ------------------------------------------------------------------ */
/* Yerel simülasyon motoru (enerji_analizoru_sim.py mantığının aynısı) */
/* ------------------------------------------------------------------ */

function walk(val: number, step: number, lo: number, hi: number): number {
  const next = val + (Math.random() * 2 - 1) * step;
  return Math.min(Math.max(next, lo), hi);
}

function gauss(sigma: number): number {
  const u = Math.max(Math.random(), 1e-9);
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * sigma;
}

export class AnalyzerSim {
  private v = [230.0, 229.5, 231.0];
  private iBase = 120.0;
  private imb = [1.0, 0.98, 1.02];
  private pf = 0.97;
  private freq = 50.0;
  private eImp = 125000.0;
  private eqInd = 18000.0;
  private last = Date.now();

  step(): Measurements {
    const now = Date.now();
    const dt = (now - this.last) / 1000;
    this.last = now;

    this.v = this.v.map((v) => walk(v, 0.4, 222.0, 238.0));
    const vn = this.v.map((v) => v + gauss(0.08));

    const ang = [0, (-2 * Math.PI) / 3, (2 * Math.PI) / 3];
    const ph = vn.map((v, k) => [v * Math.cos(ang[k]!), v * Math.sin(ang[k]!)] as const);
    const ll = (a: number, b: number) => Math.hypot(ph[a]![0] - ph[b]![0], ph[a]![1] - ph[b]![1]);
    const v12 = ll(0, 1);
    const v23 = ll(1, 2);
    const v31 = ll(2, 0);

    this.iBase = walk(this.iBase, 3.0, 40.0, 200.0);
    this.imb = this.imb.map((x) => walk(x, 0.004, 0.94, 1.06));
    const i = vn.map((_, k) => Math.max(0, this.iBase * this.imb[k]! + gauss(0.3)));

    this.pf = walk(this.pf, 0.004, 0.9, 0.995);
    const pfPh = [0, 1, 2].map(() => Math.min(0.999, Math.max(0.85, this.pf + gauss(0.003))));
    const p = vn.map((v, k) => (v * i[k]! * pfPh[k]!) / 1000);
    const q = vn.map((v, k) => (v * i[k]! * Math.sin(Math.acos(pfPh[k]!))) / 1000);
    const pTot = p.reduce((a, b) => a + b, 0);
    const qTot = q.reduce((a, b) => a + b, 0);
    const sTot = Math.hypot(pTot, qTot);
    const pfTot = sTot > 0 ? pTot / sTot : 1;

    this.freq = walk(this.freq, 0.01, 49.92, 50.08);

    this.eImp += (pTot * dt) / 3600;
    this.eqInd += (qTot * dt) / 3600;

    return {
      voltage_l1: vn[0]!,
      voltage_l2: vn[1]!,
      voltage_l3: vn[2]!,
      voltage_l1_l2: v12,
      voltage_l2_l3: v23,
      voltage_l3_l1: v31,
      current_l1: i[0]!,
      current_l2: i[1]!,
      current_l3: i[2]!,
      power_l1: p[0]!,
      power_l2: p[1]!,
      power_l3: p[2]!,
      power_total: pTot,
      reactive_power_l1: q[0]!,
      reactive_power_l2: q[1]!,
      reactive_power_l3: q[2]!,
      reactive_power_total: qTot,
      apparent_power_total: sTot,
      power_factor: pfTot,
      frequency: this.freq,
      active_energy: this.eImp,
      reactive_energy: this.eqInd,
    };
  }
}
