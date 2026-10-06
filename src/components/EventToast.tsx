// EventToast.tsx
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ToastKey } from "../types";

interface EventToastProps {
  toastKey: ToastKey;
  leaving?: boolean;
  onUnmount?: () => void;
}

const cfg: Record<
  ToastKey,
  {
    icon: string;
    label: string;
    sublabel: string;
    color: string;
    glow: string;
    border: string;
    bg: string;
    direction: "up" | "down" | "alarm";
  }
> = {
  patient_up: {
    icon: "🧊",
    label: "ПАЦИЕНТ",
    sublabel: "ВВЕРХ",
    color: "#67e8f9",
    glow: "rgba(103,232,249,0.3)",
    border: "rgba(103,232,249,0.4)",
    bg: "rgba(0,30,50,0.85)",
    direction: "up",
  },
  patient_down: {
    icon: "🧊",
    label: "ПАЦИЕНТ",
    sublabel: "ВНИЗ",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.3)",
    border: "rgba(56,189,248,0.4)",
    bg: "rgba(0,20,45,0.85)",
    direction: "down",
  },
  patient_alarm: {
    icon: "⚠️",
    label: "ПАЦИЕНТ",
    sublabel: "АВАРИЯ",
    color: "#f87171",
    glow: "rgba(248,113,113,0.35)",
    border: "rgba(248,113,113,0.5)",
    bg: "rgba(50,0,0,0.85)",
    direction: "alarm",
  },
  tube_up: {
    icon: "⬡",
    label: "ТРУБОПОДЪЁМНИК",
    sublabel: "ВВЕРХ",
    color: "#86efac",
    glow: "rgba(134,239,172,0.3)",
    border: "rgba(134,239,172,0.4)",
    bg: "rgba(0,30,20,0.85)",
    direction: "up",
  },
  tube_down: {
    icon: "⬡",
    label: "ТРУБОПОДЪЁМНИК",
    sublabel: "ВНИЗ",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.3)",
    border: "rgba(74,222,128,0.4)",
    bg: "rgba(0,25,15,0.85)",
    direction: "down",
  },
  tube_alarm: {
    icon: "⚠️",
    label: "ТРУБОПОДЪЁМНИК",
    sublabel: "АВАРИЯ",
    color: "#f87171",
    glow: "rgba(248,113,113,0.35)",
    border: "rgba(248,113,113,0.5)",
    bg: "rgba(50,0,0,0.85)",
    direction: "alarm",
  },
};

const ALARM_AUTO_HIDE_MS = 4000;

export function EventToast({ toastKey, leaving = false, onUnmount }: EventToastProps) {
  const c = cfg[toastKey];
  const isAlarm = c.direction === "alarm";

  // Уходящий тост — удаляем через 500ms
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => onUnmount?.(), 500);
    return () => clearTimeout(t);
  }, [leaving, onUnmount]);

  // Авария — авто-скрытие по таймеру
  useEffect(() => {
    if (!isAlarm) return;
    const t = setTimeout(() => onUnmount?.(), ALARM_AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [isAlarm, onUnmount]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, x: -20 }}
      animate={{
        opacity: leaving ? 0 : 1,
        scale: leaving ? 0.9 : 1,
        x: leaving ? 100 : 0,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-2xl overflow-hidden pointer-events-auto"
      style={{ width: "500px" }}
    >
      <div
        className="relative"
        style={{
          background: c.bg,
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          border: `1px solid ${c.border}`,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.06) inset,
            0 12px 40px rgba(0,0,0,0.6),
            0 0 30px ${c.glow},
            0 0 60px ${c.glow}
          `,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${c.color}, transparent)`,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${c.glow} 0%, transparent 60%)`,
            animation: isAlarm
              ? "pulseGlowStop 1s ease-in-out infinite"
              : "pulseGlow 2s ease-in-out infinite",
          }}
        />

        <div className="relative flex gap-10 p-10">
          <div
            className="flex-shrink-0 w-[100px] h-[100px] rounded-2xl flex items-center justify-center text-6xl relative"
            style={{
              background: c.glow,
              border: `1px solid ${c.border}`,
              boxShadow: `0 0 20px ${c.glow}`,
            }}
          >
            <span style={{ filter: `drop-shadow(0 0 8px ${c.color})` }}>
              {c.icon}
            </span>
            <div
              className="absolute -bottom-3 -right-3 w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl"
              style={{
                background: c.color,
                boxShadow: `0 0 8px ${c.color}`,
                color: "#000",
                fontWeight: "bold",
                animation:
                  c.direction === "up"
                    ? "arrowBounceUp 0.8s ease-in-out infinite"
                    : c.direction === "down"
                      ? "arrowBounceDown 0.8s ease-in-out infinite"
                      : "arrowPulse 0.8s ease-in-out infinite",
              }}
            >
              {c.direction === "up" ? "↑" : c.direction === "down" ? "↓" : "!"}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="text-sm tracking-[0.3em] font-mono mb-2 uppercase"
              style={{ color: `${c.color}88` }}
            >
              {c.direction === "alarm" ? "АВАРИЯ" : "ДВИЖЕНИЕ"}
            </div>
            <div
              className="text-3xl font-mono font-bold tracking-wider leading-tight"
              style={{ color: c.color }}
            >
              {c.label}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div
                className="text-xl font-mono tracking-[0.2em] px-4 py-2 rounded-md"
                style={{
                  background: `${c.color}18`,
                  border: `1px solid ${c.color}44`,
                  color: c.color,
                }}
              >
                {c.sublabel}
              </div>
            </div>
          </div>

          <div className="items-end justify-end flex">
            <MotionLines color={c.color} direction={c.direction} />
          </div>
        </div>

        <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${c.color}66, ${c.color})`,
              animation: isAlarm
                ? "progressDrainStop 4s linear forwards"
                : "pulseProgress 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function MotionLines({
  color,
  direction,
}: {
  color: string;
  direction: "up" | "down" | "alarm";
}) {
  if (direction === "alarm") {
    return (
      <div className="flex flex-col gap-2 opacity-60">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: `${Math.min(25 + i * 7.5, 50)}px`,
              height: "5px",
              background: color,
              opacity: 0.3 + i * 0.15,
              animation: "motionLineStop 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 opacity-60">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: `${Math.min(25 + i * 7.5, 50)}px`,
            height: "5px",
            background: color,
            opacity: 0.3 + i * 0.15,
            animation: `motionLine${direction === "up" ? "Up" : "Down"} 1s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}