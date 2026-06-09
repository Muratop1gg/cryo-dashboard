// EventToast.tsx
import { useEffect } from "react";
import { CapsuleEvent, EventType } from "../types";
import { motion } from "framer-motion";

interface EventToastProps {
  event: CapsuleEvent;
  leaving?: boolean;
  onUnmount?: () => void;
}

const eventConfig: Record<
  EventType,
  {
    icon: string;
    label: string;
    sublabel: string;
    color: string;
    glow: string;
    border: string;
    bg: string;
    direction: "up" | "down" | "stop";
  }
> = {
  patient_lift_up: {
    icon: "🧊",
    label: "ЛИФТ ПАЦИЕНТА",
    sublabel: "ПОДЪЁМ",
    color: "#67e8f9",
    glow: "rgba(103,232,249,0.3)",
    border: "rgba(103,232,249,0.4)",
    bg: "rgba(0,30,50,0.85)",
    direction: "up",
  },
  patient_lift_down: {
    icon: "🧊",
    label: "ЛИФТ ПАЦИЕНТА",
    sublabel: "СПУСК",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.3)",
    border: "rgba(56,189,248,0.4)",
    bg: "rgba(0,20,45,0.85)",
    direction: "down",
  },
  patient_lift_stop: {
    icon: "⏹️",
    label: "ЛИФТ ПАЦИЕНТА",
    sublabel: "СТОП",
    color: "#f97316",
    glow: "rgba(249,115,22,0.3)",
    border: "rgba(249,115,22,0.4)",
    bg: "rgba(50,20,0,0.85)",
    direction: "stop",
  },
  tube_lift_up: {
    icon: "⬡",
    label: "ТРУБОПОДЪЁМНИК",
    sublabel: "ПОДЪЁМ",
    color: "#86efac",
    glow: "rgba(134,239,172,0.3)",
    border: "rgba(134,239,172,0.4)",
    bg: "rgba(0,30,20,0.85)",
    direction: "up",
  },
  tube_lift_down: {
    icon: "⬡",
    label: "ТРУБОПОДЪЁМНИК",
    sublabel: "СПУСК",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.3)",
    border: "rgba(74,222,128,0.4)",
    bg: "rgba(0,25,15,0.85)",
    direction: "down",
  },
  tube_lift_stop: {
    icon: "⏹️",
    label: "ТРУБОПОДЪЁМНИК",
    sublabel: "СТОП",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.3)",
    border: "rgba(251,146,60,0.4)",
    bg: "rgba(50,25,0,0.85)",
    direction: "stop",
  },
};

export function EventToast({ event, leaving = false, onUnmount }: EventToastProps) {
  const cfg = eventConfig[event.type];
  const isStopEvent = event.type.includes("stop");

  useEffect(() => {
    if (!leaving) return;

    const timer = setTimeout(() => {
      onUnmount?.();
    }, 500);

    return () => clearTimeout(timer);
  }, [leaving, onUnmount]);

  useEffect(() => {
    if (!isStopEvent) return;

    const timer = setTimeout(() => {
      onUnmount?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isStopEvent, onUnmount]);

  return <motion.div
    layout
    initial={{
      opacity: 0,
      scale: 0.95,
      x: -20,
    }}
    animate={{
      opacity: leaving ? 0 : 1,
      scale: leaving ? 0.9 : 1,
      x: leaving ? 100 : 0,
    }}
    transition={{
      duration: 0.5,
      ease: "easeOut",
    }}
    className="relative rounded-2xl overflow-hidden pointer-events-auto"
    style={{
      width: "500px", // 300 * 2.5
    }}
  >
    <div
      className="relative"
      style={{
        background: cfg.bg,
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
        border: `1px solid ${cfg.border}`,
        boxShadow: `
                        0 0 0 1px rgba(255,255,255,0.06) inset,
                        0 12px 40px rgba(0,0,0,0.6),
                        0 0 30px ${cfg.glow},
                        0 0 60px ${cfg.glow}
                    `,
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
        }}
      />

      {/* Animated background pulse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow} 0%, transparent 60%)`,
          animation: cfg.direction === "stop"
            ? "pulseGlowStop 1s ease-in-out infinite"
            : "pulseGlow 2s ease-in-out infinite",
        }}
      />

      <div className="relative flex gap-10 p-10"> {/* Увеличенные отступы */}
        {/* Icon container - увеличен в 2.5 раза */}
        <div
          className="flex-shrink-0 w-[100px] h-[100px] rounded-2xl flex items-center justify-center text-6xl relative" // 56*2.5=140, 28*2.5=70 → text-6xl
          style={{
            background: `${cfg.glow}`,
            border: `1px solid ${cfg.border}`,
            boxShadow: `0 0 20px ${cfg.glow}`,
          }}
        >
          <span style={{ filter: `drop-shadow(0 0 8px ${cfg.color})` }}>
            {cfg.icon}
          </span>
          {/* Direction indicator */}
          <div
            className="absolute -bottom-3 -right-3 w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl" // 5*2.5=12.5 → -bottom-3, 20*2.5=50, text-2xl
            style={{
              background: cfg.direction === "stop" ? "#f97316" : cfg.color,
              boxShadow: `0 0 8px ${cfg.direction === "stop" ? "#f97316" : cfg.color}`,
              color: "#000",
              fontWeight: "bold",
              animation: cfg.direction === "up"
                ? "arrowBounceUp 0.8s ease-in-out infinite"
                : cfg.direction === "down"
                  ? "arrowBounceDown 0.8s ease-in-out infinite"
                  : "arrowPulse 0.8s ease-in-out infinite",
            }}
          >
            {cfg.direction === "up" ? "↑" : cfg.direction === "down" ? "↓" : "■"}
          </div>
        </div>

        {/* Text - увеличен */}
        <div className="flex-1 min-w-0">
          <div
            className="text-sm tracking-[0.3em] font-mono mb-2 uppercase" // 9*2.5=22.5 → text-sm, mb-2
            style={{ color: `${cfg.color}88` }}
          >
            {cfg.direction === "stop" ? "ОСТАНОВКА" : "ДВИЖЕНИЕ"}
          </div>
          <div
            className="text-3xl font-mono font-bold tracking-wider leading-tight" // 14*2.5=35 → text-3xl
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </div>
          <div className="flex items-center gap-2 mt-4"> {/* mt-1.5*2.5=3.75 → mt-4 */}
            <div
              className="text-xl font-mono tracking-[0.2em] px-4 py-2 rounded-md" // 12*2.5=30 → text-xl, px-4 py-2
              style={{
                background: `${cfg.color}18`,
                border: `1px solid ${cfg.color}44`,
                color: cfg.color,
              }}
            >
              {cfg.sublabel}
            </div>
          </div>
        </div>

        {/* Right motion lines - увеличены */}
        <div className="items-end justify-end flex">
          <MotionLines color={cfg.color} direction={cfg.direction} />
        </div>

      </div>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.05)" }}> {/* h-0.5*2.5=1.25 → h-1 */}
        <div
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${cfg.color}66, ${cfg.color})`,
            animation: isStopEvent
              ? "progressDrainStop 2s linear forwards"
              : "pulseProgress 2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  </motion.div>
}

function MotionLines({
  color,
  direction,
}: {
  color: string;
  direction: "up" | "down" | "stop";
}) {
  if (direction === "stop") {
    return (
      <div className="flex flex-col gap-2 opacity-60"> {/* gap-1*2.5=2.5 → gap-2 */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: `${Math.min(25 + i * 7.5, 50)}px`, // (10+i*3)*2.5
              height: "5px", // 2*2.5
              background: color,
              opacity: 0.3 + i * 0.15,
              animation: `motionLineStop 1.5s ease-in-out infinite`,
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
            width: `${Math.min(25 + i * 7.5, 50)}px`, // (10+i*3)*2.5
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