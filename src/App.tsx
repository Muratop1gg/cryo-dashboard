import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { usePixel2Data } from "./hooks/usePixel2Data";
import { CapsuleEvent } from "./types";
import { ToastManager } from "./components/ToastManager";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [events, setEvents] = useState<CapsuleEvent[]>([]);
  const { sensorData } = usePixel2Data();

  const handleEvent = useCallback((event: CapsuleEvent) => {
    const id = Date.now().toString();
    setEvents((prev) => [...prev, { ...event, id }]);
    setTimeout(() => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }, 4500);
  }, []);

  useWebSocket(handleEvent);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-display">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="./background.mp4"
        autoPlay loop muted playsInline
      />

      {/* Soft dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)",
      }} />

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
            <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontFamily: "var(--fm)", textTransform: "uppercase" }}>
              CryoOne
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "0.12em", lineHeight: 1 }}>
              ПРОЦЕДУРА
            </div>
            <Clock />
          </GlassCard>

          {/* Temperature — HERO */}


          {/* System status */}
          <GlassCard style={{ minWidth: 200, display: "flex", alignItems: "center", gap: 14 }}>
            <StatusPulse active />
            <div>
              <Label>СТАТУС</Label>
              <div style={{
                fontSize: 28, fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "0.05em",
                fontFamily: "var(--fm)",
                lineHeight: 1.1,
              }}>
                {sensorData.systemStatus}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* BOTTOM ROW: secondary sensors */}
        <div className="flex flex-col gap-16 justify-center items-center h-full">
          <div className="flex gap-5 justify-center items-center w-full">
            <GlassCard className="flex-1 max-w-3xl h-[30vh] flex items-center justify-center gap-5">
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 36, lineHeight: 1 }}>
                <IconThermo />
              </div>
              <div>
                <Label>ТЕМПЕРАТУРА</Label>
                <BigValue value={sensorData.temperature} unit="°C" trend={sensorData.temperatureTrend} />
              </div>
            </GlassCard>
            <GlassCard className="flex-1 max-w-3xl h-[30vh] flex items-center justify-center gap-5">
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 36, lineHeight: 1 }}>
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
                <Label>Т1</Label>
                <MidValue value={sensorData.t1} />
              </div>
            </GlassCard>
            <GlassCard className="flex-1 max-w-lg h-[10vh] flex items-center justify-center gap-5">
              <div>
                <Label>Т2</Label>
                <MidValue value={sensorData.t2} />
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
    <div className={className} style={{
      background: "rgba(255,255,255,0.10)",
      backdropFilter: "blur(24px) saturate(140%)",
      WebkitBackdropFilter: "blur(24px) saturate(140%)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 20,
      padding: "20px 28px",
      boxShadow: "0 2px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Typography ───────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11,
      letterSpacing: "0.3em",
      color: "rgba(255,255,255,0.45)",
      textTransform: "uppercase",
      fontFamily: "var(--fm)",
      marginBottom: 2,
    }}>
      {children}
    </div>
  );
}

function BigValue({ value, unit, trend }: { value: string; unit: string; trend?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, lineHeight: 1 }}>
      <span style={{
        fontSize: "clamp(2.8rem, 4.5vw, 5rem)",
        fontWeight: 700,
        color: "rgba(255,255,255,0.95)",
        fontFamily: "var(--fm)",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>
        {value}
      </span>
      {unit && (
        <span style={{
          fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "var(--fm)",
          marginBottom: 4,
        }}>
          {unit}
        </span>
      )}
      {trend && trend !== "stable" && (
        <span style={{
          fontSize: 18,
          marginBottom: 6,
          color: trend === "up" ? "rgba(255,120,100,0.8)" : "rgba(120,220,180,0.8)",
        }}>
          {trend === "up" ? "▲" : "▼"}
        </span>
      )}
    </div>
  );
}

function MidValue({ value, unit, trend }: { value: string; unit?: string; trend?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, lineHeight: 1 }}>
      <span style={{
        fontSize: "clamp(1.8rem, 2.8vw, 3rem)",
        fontWeight: 700,
        color: "rgba(255,255,255,0.90)",
        fontFamily: "var(--fm)",
        letterSpacing: "-0.01em",
        lineHeight: 1,
      }}>
        {value}
      </span>
      {unit && (
        <span style={{
          fontSize: "clamp(0.9rem, 1.3vw, 1.2rem)",
          color: "rgba(255,255,255,0.40)",
          fontFamily: "var(--fm)",
          marginBottom: 3,
        }}>
          {unit}
        </span>
      )}
      {trend && trend !== "stable" && (
        <span style={{
          fontSize: 13, marginBottom: 4,
          color: trend === "up" ? "rgba(255,120,100,0.7)" : "rgba(120,220,180,0.7)",
        }}>
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

function StatusPulse({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: 12, height: 12, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: active ? "rgba(160,230,180,0.9)" : "rgba(255,100,80,0.8)",
        animation: active ? "pulseRing 2s ease-in-out infinite" : "none",
      }} />
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
      <span style={{ marginLeft: 8, opacity: 0.6 }}>
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
