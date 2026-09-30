import { Link } from "@tanstack/react-router";
import { Activity, Cpu, Settings, Table2 } from "lucide-react";

const items = [
  { to: "/", label: "Panel", icon: Activity },
  { to: "/registers", label: "Registerlar", icon: Table2 },
  { to: "/devices", label: "Cihazlar", icon: Cpu },
  { to: "/settings", label: "Ayarlar", icon: Settings },
] as const;

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md border border-primary/40 bg-primary/10">
            <Activity className="size-5 text-primary" />
          </span>
          <span>
            <span className="block font-display text-lg leading-none font-semibold tracking-wide">
              MODBUS SCADA
            </span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              Enerji Analizörü
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
