import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { CapsuleEvent } from "./types";
import { ToastManager } from "./components/ToastManager";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [events, setEvents] = useState<CapsuleEvent[]>([]);
  const { sensorData, isConnected } = useWebSocket(); // Это для данных сенсоров

  const handleEvent = useCallback((event: CapsuleEvent) => {
    const id = Date.now().toString();
    setEvents((prev) => [...prev, { ...event, id }]);
    setTimeout(() => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }, 4500);
  }, []);

  // Используем хук только для событий (не для сенсоров)
  useWebSocket(handleEvent); // <-- Используем правильный хук

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-display">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="./background.mp4"
        autoPlay loop muted playsInline
      />

      {/* Soft dark overlay */}
      <div className="absolute inset-0 bg-black opacity-45" />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.12)_3px,rgba(0,0,0,0.12)_4px)]" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Layout */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 gap-5">

        {/* TOP ROW: header + big values */}
        <div className="flex justify-between gap-5">

          {/* Header card */}
          <GlassCard style={{ minWidth: 220, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
            <div className="text-xs uppercase opacity-95 text-white tracking-[0.3em]">
              CryoOne
            </div>
            <Label>{isConnected ? "Подключен" : "Отключен"}</Label>
            <Clock />
          </GlassCard>

          {/* Temperature — HERO */}


          {/* System status */}
          <GlassCard style={{ minWidth: 200, display: "flex", alignItems: "center", gap: 14 }}>
            <StatusPulse status={sensorData.systemStatus} />
            <div>
              <Label>СТАТУС</Label>
              <div className="font-bold tracking-wider leading-tight text-3xl text-white opacity-92" >
                {sensorData.systemStatus}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* BOTTOM ROW: secondary sensors */}
        <div className="flex flex-col gap-16 justify-center items-center h-full">
          <div className="flex gap-5 justify-center items-center w-full">
            <GlassCard className="flex-1 max-w-3xl h-[30vh] flex items-center justify-center gap-5">
              <div className="text-4xl text-white opacity-35">
                <IconThermo />
              </div>
              <div>
                <Label>ТЕМПЕРАТУРА</Label>
                <BigValue value={sensorData.temperature} unit="°C" trend={sensorData.temperature} />
              </div>
            </GlassCard>
            <GlassCard className="flex-1 max-w-3xl h-[30vh] flex items-center justify-center gap-5">
              <div className="text-4xl text-white opacity-35">
                <IconTimer />
              </div>
              <div>
                <Label>ВРЕМЯ СЕАНСА</Label>
                <BigValue value={sensorData.sessionTime} unit="сек" />
              </div>
            </GlassCard>
          </div>
          <div className="flex gap-[15vw] justify-center items-center w-full">
            <GlassCard className="flex-1 max-w-lg h-[10vh] flex items-center justify-center gap-5">
              <div>
                <Label>S1</Label>
                <MidValue value={sensorData.s1} />
              </div>
            </GlassCard>
            <GlassCard className="flex-1 max-w-lg h-[10vh] flex items-center justify-center gap-5">
              <div>
                <Label>S2</Label>
                <MidValue value={sensorData.s2} />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <ToastManager events={events} />
    </div>
  );
}

// ─── Glass card ───────────────────────────────────────────────
function GlassCard({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`
      ${className}
      bg-[rgba(255,255,255,0.10)]
      backdrop-blur-[24px] backdrop-saturate-[140%]
      border border-[rgba(255,255,255,0.18)]
      rounded-[20px]
      py-5 px-7
      shadow-[0_2px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.22)]
    `}
      style={style}
    >
      {children}
    </div>
  );
}

// ─── Typography ───────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] tracking-[0.3em] text-white/45 uppercase mb-0.5">
      {children}
    </div>
  );
}

function BigValue({ value, unit, trend }: { value: string; unit: string; trend?: string }) {
  return (
    <div className="flex items-end gap-2 leading-none">
      <span className="text-[clamp(2.8rem,4.5vw,5rem)] font-bold text-white/95 tracking-[-0.02em] leading-none">
        {value}
      </span>
      {unit && (
        <span className="text-[clamp(1.2rem,2vw,1.8rem)] text-white/45 mb-1">
          {unit}
        </span>
      )}
      {trend && trend !== "stable" && (
        <span className={`
          text-[18px] mb-1.5
          ${trend === "up" ? "text-[rgba(255,120,100,0.8)]" : "text-[rgba(120,220,180,0.8)]"}
        `}>
          {trend === "up" ? "▲" : "▼"}
        </span>
      )}
    </div>
  );
}

function MidValue({ value, unit, trend }: { value: string; unit?: string; trend?: string }) {
  return (
    <div className="flex items-end gap-1.5 leading-none">
      <span className="text-[clamp(1.8rem,2.8vw,3rem)] font-bold text-white/90 tracking-[-0.01em] leading-none">
        {value}
      </span>
      {unit && (
        <span className="text-[clamp(0.9rem,1.3vw,1.2rem)] text-white/40 mb-[3px]">
          {unit}
        </span>
      )}
      {trend && trend !== "stable" && (
        <span className={`
          text-[13px] mb-1
          ${trend === "up" ? "text-[rgba(255,120,100,0.7)]" : "text-[rgba(120,220,180,0.7)]"}
        `}>
          {trend === "up" ? "▲" : "▼"}
        </span>
      )}
    </div>
  );
}

// function FillBar({ value }: { value: number }) {
//   return (
//     <div style={{
//       height: 4,
//       borderRadius: 4,
//       background: "rgba(255,255,255,0.12)",
//       overflow: "hidden",
//     }}>
//       <div style={{
//         height: "100%",
//         width: `${Math.min(value, 100)}%`,
//         background: "rgba(255,255,255,0.55)",
//         borderRadius: 4,
//         transition: "width 1s ease",
//       }} />
//     </div>
//   );
// }

function StatusPulse({ status }: { status: "Простой" | "Сушка" | "Процедура" | "Авария" }) {
  const color = () => {
    switch (status) {
      case "Авария":
        return "rgba(255,100,80,0.8)"
      case "Процедура":
        return "rgba(120,220,180,0.7)"
      case "Простой":
        return "rgba(255, 255, 255,0.3)"
      case "Сушка":
        return "rgba(245, 167, 66, 0.9)"
      default:
        return "rgba(255, 255, 255,0.3)"
    }
  }

  return (
    <div className="relative w-3 h-3 flex-shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: color(),
          animation: status == "Процедура" ? "pulseRing 2s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ fontFamily: "var(--fm)", color: "rgba(255,255,255,0.50)", fontSize: 13, letterSpacing: "0.1em" }}>
      {time.toLocaleTimeString("ru-RU")}
      <span className="opacity-60 ml-2">
        {time.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
      </span>
    </div>
  );
}

function IconThermo() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2a2 2 0 0 0-2 2v8.5A5 5 0 1 0 14 12.5V4a2 2 0 0 0-2-2Z" />
      <circle cx="12" cy="17" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function IconTimer() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 3h6" />
    </svg>
  );
}
