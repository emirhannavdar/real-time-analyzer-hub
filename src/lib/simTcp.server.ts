/**
 * Modbus TCP istemcisi — enerji_analizoru_sim.py'nin sunduğu holding
 * registerları okur: BASE 30000, 44 register, float32 ABCD (big-endian), FC3.
 * Yalnızca sunucuda çalışır (net modülü).
 */
import net from "node:net";
import { REGISTER_BASE, REGISTER_COUNT, REGISTER_MAP, ZERO_MEASUREMENTS, type Measurements } from "./analyzer";

const UNIT_ID = 1;
const TIMEOUT_MS = 2500;

function decodeRegisters(buf: Buffer): Measurements {
  const out: Measurements = { ...ZERO_MEASUREMENTS };
  for (const def of REGISTER_MAP) {
    const byteOffset = def.offset * 2;
    out[def.key] = buf.readFloatBE(byteOffset);
  }
  return out;
}

export async function readSimulatorMeasurements(host: string, port: number): Promise<Measurements> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;
    const chunks: Buffer[] = [];

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };

    socket.setTimeout(TIMEOUT_MS, () => fail(new Error("Simülatör zaman aşımı")));
    socket.once("error", (err) => fail(err instanceof Error ? err : new Error(String(err))));

    socket.connect(port, host, () => {
      // MBAP + PDU: FC3, start=30000, qty=44
      const req = Buffer.alloc(12);
      req.writeUInt16BE(1, 0); // transaction id
      req.writeUInt16BE(0, 2); // protocol id
      req.writeUInt16BE(6, 4); // length
      req.writeUInt8(UNIT_ID, 6);
      req.writeUInt8(3, 7); // function code
      req.writeUInt16BE(REGISTER_BASE, 8);
      req.writeUInt16BE(REGISTER_COUNT, 10);
      socket.write(req);
    });

    socket.on("data", (chunk) => {
      chunks.push(chunk);
      const buf = Buffer.concat(chunks);
      if (buf.length < 9) return;
      const byteCount = buf.readUInt8(8);
      const total = 9 + byteCount;
      if (buf.length < total) return;

      if (settled) return;
      settled = true;
      socket.destroy();

      const fc = buf.readUInt8(7);
      if (fc & 0x80) {
        reject(new Error(`Modbus hata kodu: ${buf.readUInt8(8)}`));
        return;
      }
      if (byteCount !== REGISTER_COUNT * 2) {
        reject(new Error(`Beklenmeyen veri uzunluğu: ${byteCount}`));
        return;
      }
      try {
        resolve(decodeRegisters(buf.subarray(9, total)));
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
  });
}
