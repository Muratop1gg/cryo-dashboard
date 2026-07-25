import { ReactNode } from "react";

interface LcdDisplayProps {
  label: string;
  value: string;
  unit: string;
  iconSvg: ReactNode;
  color: string;
  trend?: "up" | "down" | "stable";
}

// Simulates a 7-segment / LCD digit look with CSS
export function LcdDisplay({ label, value, unit, iconSvg, color, trend }: LcdDisplayProps) {
  return (
    <div
      className="relative rounded-xl flex flex-col overflow-hidden"
      style={{
        background: "rgba(0, 8, 28, 0.80)",
        border: `1px solid ${color}30`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.03) inset, inset 0 1px 0 ${color}20, 0 4px 24px rgba(0,0,0,0.5), 0 0 20px ${color}12`,
      }}
    >
      {/* Inner top shine */}
      <div
        className="absolute top-0 left-[5%] right-[5%] h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
      />

      {/* Label bar */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2"
        style={{ borderBottom: `1px solid ${color}18` }}
      >
        <span
          className="text-[9px] tracking-[0.35em] font-mono uppercase"
          style={{ color: `${color}90` }}
        >
          {label}
        </span>
        {trend && (
          <span
            className="text-[10px] font-mono"
            style={{
              color: trend === "up" ? "#f87171" : trend === "down" ? "#34d399" : `${color}60`,
            }}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "◆"}
          </span>
        )}
      </div>

      {/* Main display area */}
      <div className="flex items-center gap-4 px-5 py-4 flex-1">
        {/* Icon */}
        <div
          className="shrink-0 w-10 h-10 opacity-70"
          style={{ color }}
        >
          {iconSvg}
        </div>

        {/* LCD number */}
        <div className="flex items-end gap-2 flex-1">
          <div
            className="font-mono leading-none flex-1"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              color,
              textShadow: `0 0 20px ${color}99, 0 0 40px ${color}44`,
              fontVariantNumeric: "tabular-nums",
              // Ghost digits behind — the "unlit segments" trick
              filter: "drop-shadow(0 0 8px " + color + "66)",
            }}
          >
            {/* Ghost layer */}
            <span
              className="absolute font-mono select-none pointer-events-none"
              style={{
                color: `${color}12`,
                fontSize: "inherit",
              }}
            >
              {value.replace(/[^.]/g, "8")}
            </span>
            {value}
          </div>
          {unit && (
            <span
              className="font-mono text-lg mb-1 shrink-0"
              style={{ color: `${color}80` }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Bottom glow bar */}
      <div
        className="h-0.5 mx-4 mb-3 rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
        }}
      />
    </div>
  );
}
