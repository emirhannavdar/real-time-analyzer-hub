import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * reset_mode isteğini sunucu tarafından API'ye iletir.
 * Tarayıcıdan doğrudan PUT isteği CORS nedeniyle engellenebildiği için
 * istek sunucu üzerinden gönderilir.
 */
export const setResetModeServer = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ baseUrl: z.string().min(1).max(500), value: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const url = `${data.baseUrl.replace(/\/+$/, "")}/modbus/reset?value=${data.value}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(url, { method: "PUT", signal: controller.signal });
      const text = await res.text();
      if (!res.ok) throw new Error(`API HTTP ${res.status}: ${text.slice(0, 200)}`);
      let json: { success?: boolean; data?: unknown; errorMessage?: string } = {};
      try {
        json = JSON.parse(text);
      } catch {
        /* boş */
      }
      if (json.success === false) throw new Error(json.errorMessage ?? "API başarısız döndü");
      return { ok: true, value: data.value };
    } finally {
      clearTimeout(timer);
    }
  });
