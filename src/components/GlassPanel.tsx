import { useEffect, useRef } from "react";

type PanelColor = "cyan" | "blue" | "teal" | "ice" | "emerald" | "indigo" | "amber" | "violet";
type PanelSize = "normal" | "large";

interface GlassPanelProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  color: PanelColor;
  size: PanelSize;
  trend?: "up" | "down" | "stable";
  showBar?: boolean;
  isStatus?: boolean;
}

const colorMap: Record<PanelColor, {
  glow: string;
  accent: string;
  text: string;
  border: string;
  bg: string;
  barFill: string;
}> = {
  cyan: {
    glow: "rgba(34,211,238,0.12)",
    accent: "rgba(34,211,238,0.7)",
    text: "text-cyan-300",
    border: "rgba(34,211,238,0.25)",
    bg: "rgba(0,30,50,0.45)",
    barFill: "#22d3ee",
  },
  blue: {
    glow: "rgba(96,165,250,0.12)",
    accent: "rgba(96,165,250,0.7)",
    text: "text-blue-300",
    border: "rgba(96,165,250,0.25)",
    bg: "rgba(0,15,50,0.45)",
    barFill: "#60a5fa",
  },
  teal: {
    glow: "rgba(45,212,191,0.12)",
    accent: "rgba(45,212,191,0.7)",
    text: "text-teal-300",
    border: "rgba(45,212,191,0.25)",
    bg: "rgba(0,30,40,0.45)",
    barFill: "#2dd4bf",
  },
  ice: {
    glow: "rgba(186,230,253,0.1)",
    accent: "rgba(186,230,253,0.8)",
    text: "text-sky-100",
    border: "rgba(186,230,253,0.2)",
    bg: "rgba(5,20,50,0.5)",
    barFill: "#bae6fd",
  },
  emerald: {
    glow: "rgba(52,211,153,0.12)",
    accent: "rgba(52,211,153,0.7)",
    text: "text-emerald-300",
    border: "rgba(52,211,153,0.25)",
    bg: "rgba(0,30,20,0.45)",
    barFill: "#34d399",
  },
  indigo: {
    glow: "rgba(129,140,248,0.12)",
    accent: "rgba(129,140,248,0.7)",
    text: "text-indigo-300",
    border: "rgba(129,140,248,0.25)",
    bg: "rgba(10,10,50,0.45)",
    barFill: "#818cf8",
  },
  amber: {
    glow: "rgba(251,191,36,0.1)",
    accent: "rgba(251,191,36,0.7)",
    text: "text-amber-300",
    border: "rgba(251,191,36,0.2)",
    bg: "rgba(30,20,0,0.45)",
    barFill: "#fbbf24",
  },
  violet: {
    glow: "rgba(167,139,250,0.12)",
    accent: "rgba(167,139,250,0.7)",
    text: "text-violet-300",
    border: "rgba(167,139,250,0.25)",
    bg: "rgba(20,0,50,0.45)",
    barFill: "#a78bfa",
  },
};

export function GlassPanel({
  title,
  value,
  unit,
  icon,
  color,
  showBar,
  isStatus,
  trend,
}: GlassPanelProps) {
  const c = colorMap[color];
  const panelRef = useRef<HTMLDivElement>(null);

  // Mouse parallax glow
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  const barValue = showBar ? parseFloat(value) || 0 : 0;

  return (
    <div
      ref={panelRef}
      className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-5 transition-transform duration-300 hover:scale-[1.02] group"
      style={{
        background: c.bg,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${c.border}`,
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.04) inset,
          0 8px 32px rgba(0,0,0,0.4),
          0 0 40px ${c.glow}
        `,
      }}
    >
      {/* Top highlight — Aero glass shine */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
          opacity: 0.6,
        }}
      />
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[40%] rounded-b-full pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)`,
        }}
      />

      {/* Mouse-tracking inner glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${c.glow} 0%, transparent 60%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] tracking-[0.25em] uppercase font-mono"
          style={{ color: c.accent, opacity: 0.85 }}
        >
          {title}
        </span>
        <span className="text-white/30 text-xs font-mono">{icon}</span>
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-center">
        {isStatus ? (
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: c.barFill,
                boxShadow: `0 0 12px ${c.barFill}`,
              }}
            />
            <span
              className={`text-xl font-mono font-bold tracking-wider ${c.text}`}
            >
              {value}
            </span>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <span
              className={`font-mono font-bold leading-none ${c.text}`}
              style={{
                fontSize: "clamp(1.5rem, 2.5vw, 2.8rem)",
                textShadow: `0 0 20px ${c.barFill}55`,
              }}
            >
              {value}
            </span>
            {unit && (
              <span
                className="font-mono text-sm mb-1 opacity-60"
                style={{ color: c.barFill }}
              >
                {unit}
              </span>
            )}
            {trend && (
              <span
                className="text-xs mb-1 opacity-80"
                style={{
                  color:
                    trend === "up"
                      ? "#f87171"
                      : trend === "down"
                        ? "#34d399"
                        : c.barFill,
                }}
              >
                {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {showBar && (
        <div className="mt-3">
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(barValue, 100)}%`,
                background: `linear-gradient(90deg, ${c.barFill}88, ${c.barFill})`,
                boxShadow: `0 0 8px ${c.barFill}66`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] font-mono opacity-30 text-white">
              0
            </span>
            <span className="text-[9px] font-mono opacity-30 text-white">
              100
            </span>
          </div>
        </div>
      )}

      {/* Bottom separator line */}
      <div
        className="absolute bottom-0 left-[20%] right-[20%] h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${c.accent}44, transparent)`,
        }}
      />
    </div>
  );
}
