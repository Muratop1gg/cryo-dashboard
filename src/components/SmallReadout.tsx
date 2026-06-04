import { ReactNode } from "react";

interface SmallReadoutProps {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
  color: string;
  trend?: "up" | "down" | "stable";
}

export function SmallReadout({ label, value, unit, icon, color, trend }: SmallReadoutProps) {
  return (
    <div
      className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 overflow-hidden"
      style={{
        background: "rgba(0,8,28,0.7)",
        border: `1px solid ${color}25`,
        boxShadow: `inset 0 1px 0 ${color}15, 0 2px 12px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-6 h-6 opacity-60" style={{ color }}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="text-[8px] font-mono tracking-[0.25em] uppercase leading-none mb-1"
          style={{ color: `${color}70` }}
        >
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className="font-mono font-bold leading-none"
            style={{
              fontSize: "clamp(1rem, 1.8vw, 1.4rem)",
              color,
              textShadow: `0 0 12px ${color}88`,
            }}
          >
            {value}
          </span>
          {unit && (
            <span className="font-mono text-[10px]" style={{ color: `${color}60` }}>
              {unit}
            </span>
          )}
          {trend && (
            <span
              className="text-[9px] font-mono ml-1"
              style={{
                color: trend === "up" ? "#f87171" : trend === "down" ? "#34d399" : `${color}50`,
              }}
            >
              {trend === "up" ? "▲" : trend === "down" ? "▼" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Right edge glow */}
      <div
        className="absolute right-0 top-0 bottom-0 w-0.5"
        style={{ background: `linear-gradient(180deg, transparent, ${color}40, transparent)` }}
      />
    </div>
  );
}
