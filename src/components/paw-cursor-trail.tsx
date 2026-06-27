import { useEffect, useRef, useState } from "react";

type Paw = { id: number; x: number; y: number; rot: number };

export function PawCursorTrail() {
  const [paws, setPaws] = useState<Paw[]>([]);
  const idRef = useRef(0);
  const lastRef = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    // Skip on touch devices
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    function onMove(e: MouseEvent) {
      const now = performance.now();
      const dx = e.clientX - lastRef.current.x;
      const dy = e.clientY - lastRef.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 38 || now - lastRef.current.t < 60) return;
      lastRef.current = { x: e.clientX, y: e.clientY, t: now };
      const rot = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      const id = ++idRef.current;
      setPaws((p) => [...p.slice(-14), { id, x: e.clientX, y: e.clientY, rot }]);
      window.setTimeout(() => {
        setPaws((p) => p.filter((q) => q.id !== id));
      }, 900);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
      {paws.map((p) => (
        <span
          key={p.id}
          className="absolute text-base"
          style={{
            left: p.x,
            top: p.y,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            animation: "paw-fade 0.9s ease-out forwards",
            color: "color-mix(in oklab, var(--primary) 75%, transparent)",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
          }}
        >
          🐾
        </span>
      ))}
    </div>
  );
}
