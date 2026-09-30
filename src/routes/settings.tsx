import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type ApiSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Ayarlar · Modbus Enerji Analizörü" },
      {
        name: "description",
        content: "API adresi, veri yenileme sıklığı ve demo modu ayarları.",
      },
      { property: "og:title", content: "Ayarlar · Modbus Enerji Analizörü" },
      { property: "og:description", content: "Arayüzün bağlanacağı REST API adresini yapılandırın." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [form, setForm] = useState<ApiSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setForm(loadSettings());
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(form);
    toast.success("Ayarlar kaydedildi", { description: "Yeni ayarlar hemen uygulanıyor." });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <h1 className="font-display text-2xl font-semibold tracking-wide">Ayarlar</h1>

      <form onSubmit={submit} className="panel-surface space-y-6 rounded-xl p-5">
        <div className="space-y-2">
          <Label htmlFor="baseUrl" className="font-mono text-xs tracking-widest uppercase">
            API adresi
          </Label>
          <Input
            id="baseUrl"
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            placeholder="http://192.168.1.34:8000/api/v1"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            REST API'nin kök adresi. Örn. http://127.0.0.1:8000/api/v1
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div className="space-y-2">
            <Label htmlFor="simHost" className="font-mono text-xs tracking-widest uppercase">
              Simülatör IP adresi
            </Label>
            <Input
              id="simHost"
              value={form.simHost}
              onChange={(e) => setForm({ ...form, simHost: e.target.value })}
              placeholder="127.0.0.1"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="simPort" className="font-mono text-xs tracking-widest uppercase">
              Port
            </Label>
            <Input
              id="simPort"
              type="number"
              min={1}
              max={65535}
              value={form.simPort}
              onChange={(e) => setForm({ ...form, simPort: Number(e.target.value) || 5020 })}
              className="font-mono"
            />
          </div>
        </div>
        <p className="-mt-3 text-xs text-muted-foreground">
          enerji_analizoru_sim.py'nin Modbus TCP adresi. Arayüzdeki değerler öncelikle buradan
          okunur (register 30000, 44 adet).
        </p>

        <div className="space-y-2">
          <Label htmlFor="interval" className="font-mono text-xs tracking-widest uppercase">
            Yenileme aralığı (ms)
          </Label>
          <Input
            id="interval"
            type="number"
            min={250}
            step={250}
            value={form.intervalMs}
            onChange={(e) => setForm({ ...form, intervalMs: Number(e.target.value) || 1000 })}
            className="font-mono"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p className="font-medium">Demo modu</p>
            <p className="text-xs text-muted-foreground">
              API'ye hiç bağlanmadan yerleşik simülasyonla çalıştır.
            </p>
          </div>
          <Switch
            checked={form.forceDemo}
            onCheckedChange={(v) => setForm({ ...form, forceDemo: v })}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit">Kaydet</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setForm(DEFAULT_SETTINGS);
              saveSettings(DEFAULT_SETTINGS);
              toast.info("Varsayılan ayarlara dönüldü");
            }}
          >
            Varsayılana dön
          </Button>
        </div>
      </form>
    </div>
  );
}
