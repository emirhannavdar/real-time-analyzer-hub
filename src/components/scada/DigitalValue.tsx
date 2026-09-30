import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatValue } from "@/lib/analyzer";

interface DigitalValueProps {
  value: number;
  decimals?: number;
  unit?: string;
  className?: string;
  unitClassName?: string;
}

/** Değer değişiminde yumuşak geçiş yapan sayaç göstergesi. */
export function DigitalValue({
  value,
  decimals = 2,
  unit,
  className,
  unitClassName,
}: DigitalValueProps) {
  const [shown, setShown] = useState(value);
  const raf = useRef<number | null>(null);
  const from = useRef(value);
  const start = useRef(0);

  useEffect(() => {
    from.current = shown;
    start.current = performance.now();
    const duration = 450;
    const animate = (now: number) => {
      const t = Math.min(1, (now - start.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from.current + (value - from.current) * eased);
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatValue(shown, decimals)}
      {unit ? (
        <span className={cn("ml-1 text-[0.6em] opacity-70", unitClassName)}>{unit}</span>
      ) : null}
    </span>
  );
}
