import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { Event, SystemMode } from "./types";
// import { ToastManager } from "./components/ToastManager";

import {
  ResponsiveContainer,
  Area,
  ComposedChart,
  YAxis,
  XAxis
} from 'recharts';
import { useApi } from "./hooks/useApi";
import PWDDialog from "./components/PWDDialog";


const HISTORY_LENGTH = 60;

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // const [events, setEvents] = useState<Event[]>([]);

  // Состояние для графика температуры
  const [temperatureHistory, setTemperatureHistory] = useState<Array<{ index: number; value: number | null }>>(() =>
    Array.from({ length: HISTORY_LENGTH }, (_, i) => ({
      index: i,
      value: 50
    }))
  );

  // Таймер состояния
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isChartActive, setIsChartActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const timerIntervalRef = useRef<number | null>(null);
  const updateCounterRef = useRef<number>(0);
  const sessionTimeRef = useRef<number>(0);

  // Функция остановки таймера
  const stopTimer = useCallback(() => {
    console.log("Stopping timer");
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    setIsTimerPaused(false);
  }, []);


  const resetTemperatureHistory = useCallback(() => {
    setTemperatureHistory(
      Array.from({ length: HISTORY_LENGTH }, (_, i) => ({
        index: i,
        value: null
      }))
    );
  }, []);

  const handleEvent = useCallback((event: Event) => {
    console.log("Event received:", event.EventType);


    switch (event.EventType) {

      case 100:
        // Старт процедуры
        console.log("Starting procedure");

        setSessionTime(HISTORY_LENGTH);

        setIsTimerPaused(false);
        setIsTimerRunning(true);

        resetTemperatureHistory();

        // включаем запись графика
        setIsChartActive(true);

        break;


      case 101:
        // Пауза
        console.log("Pause timer");

        setIsTimerPaused(true);
        setIsTimerRunning(false);

        // график замораживаем
        setIsChartActive(false);

        break;


      case 102:
        // Возобновление
        console.log("Resume timer");

        setIsTimerPaused(false);
        setIsTimerRunning(true);

        // продолжаем график
        setIsChartActive(true);

        break;


      case 103:
        // Стоп
        console.log("Stop timer");

        setSessionTime(0);

        setIsTimerPaused(false);
        setIsTimerRunning(false);

        setIsChartActive(false);

        resetTemperatureHistory();

        break;
    }

  }, [resetTemperatureHistory]);



  // Единый контроллер таймера
  useEffect(() => {
    if (!isTimerRunning || isTimerPaused) {
      return;
    }
    const interval = window.setInterval(() => {

      setSessionTime(prev => {
        if (prev <= 1) {

          setIsTimerRunning(false);
          setIsTimerPaused(false);

          return 0;
        }

        return prev - 1;
      });

    }, 1000);


    return () => {
      console.log("Timer cleanup");
      clearInterval(interval);
    };

  }, [isTimerRunning, isTimerPaused]);

  const { sensorData, isConnected } = useWebSocket(handleEvent);

  const api = useApi();

  // Обработка клавиш
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMenuOpen) {
        if (event.key === ' ' || event.code === 'Space') {
          event.preventDefault();

          console.log("Space pressed, isPaused:", isTimerPaused, "isRunning:", isTimerRunning);

          if (isTimerPaused) {
            console.log("Resuming via API");
            api.resumeProcedure({});
          } else if (isTimerRunning) {
            console.log("Pausing via API");
            api.pauseProcedure({});
          } else {
            console.log("Starting via API");
            api.startProcedure({});
          }
        } else if (event.key === 'Backspace') {
          event.preventDefault();
          console.log("Stopping via API");
          api.stopProcedure({});
          setSessionTime(0);
          sessionTimeRef.current = 0;
          stopTimer();
        } else if (event.key == 'm' || event.key == 'ь') {
          event.preventDefault();
          setIsMenuOpen(!isMenuOpen);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [api, isTimerRunning, isTimerPaused]);

  useEffect(() => {
    const a = api.getConfig()
    console.log(a)
  }, [])

  useEffect(() => {
    if (!sensorData?.Telemetry?.Temperature?.Average) return;

    if (!isChartActive) return;

    updateCounterRef.current += 1;

    if (updateCounterRef.current % 5 !== 0) return;

    const newTemperature = sensorData.Telemetry.Temperature.Average;

    setTemperatureHistory(prev => {
      const newHistory = [...prev];

      let firstNullIndex = newHistory.findIndex(item => item.value === null);

      if (firstNullIndex === -1) {
        const resetHistory = Array.from({ length: HISTORY_LENGTH }, (_, i) => ({
          index: i,
          value: 50
        }));
        return resetHistory;
      }

      newHistory[firstNullIndex] = {
        index: firstNullIndex,
        value: newTemperature
      };

      return newHistory;
    });
  }, [sensorData, isChartActive]);


  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-display">

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="./background.mp4"
        autoPlay loop muted playsInline
      />

      <div className="absolute inset-0 bg-black opacity-45" />

      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.12)_3px,rgba(0,0,0,0.12)_4px)]" />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
      }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 gap-5">

        <div className="flex justify-between gap-5">

          <GlassCard style={{ minWidth: 220, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
            <div className="text-sm uppercase opacity-95 text-white tracking-[0.3em]">
              CryoOne
            </div>
            <Label>{isConnected ? "Подключен" : "Отключен"}</Label>
            <Clock />
          </GlassCard>

          <GlassCard style={{ minWidth: 200, display: "flex", alignItems: "center", gap: 14 }}>
            {sensorData && <StatusPulse status={sensorData.SystemStatus.currentMode} />}
            <div>
              <Label>СТАТУС</Label>
              <div className="font-bold tracking-wider leading-tight text-4xl text-white opacity-92" >
                {/* {sensorData && sensorData.SystemStatus.currentMode} */}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="flex flex-col gap-16 justify-center items-center h-full">
          <div className="flex gap-5 justify-center items-center w-full">
            <GlassCard className="relative flex-1 max-w-3xl h-[30vh] flex items-center justify-center gap-5 rounded-xl overflow-hidden">
              <div className="absolute inset-0 z-0 rounded-xl overflow-hidden cursor-none select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={temperatureHistory}>
                    <Area
                      type="monotone"
                      dataKey="value"

                      stroke={
                        isTimerPaused
                          ? "rgba(255,200,100,0.35)"
                          : "rgba(120,200,255,0.5)"
                      }
                      baseValue={50}
                      strokeWidth={1.5}
                      fill="url(#temperatureGradient)"
                      dot={false}
                      activeDot={false}
                      isAnimationActive={true}
                      connectNulls={true}
                    />
                    <YAxis
                      domain={[-200, 50]}
                      type="number"
                      padding={{ top: 10, bottom: 10 }}
                    />
                    <XAxis
                      domain={[0, HISTORY_LENGTH - 1]}
                      type="number"
                      scale={"auto"}
                      dataKey="index"
                      hide
                    />
                    <defs>
                      <linearGradient
                        id="temperatureGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="100%"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="rgba(120, 200, 255, 0.15)" />
                        <stop offset="100%" stopColor="rgba(120, 200, 255, 0.005)" />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="relative z-10 flex items-center justify-center gap-5">
                <div className="text-7xl text-white/35">
                  <IconThermo />
                </div>
                <div>
                  <Label>ТЕМПЕРАТУРА</Label>
                  {sensorData && <BigValue value={sensorData?.Telemetry.Temperature.Average} unit="°C" trend={"1"} />}
                </div>
              </div>
            </GlassCard>
            <GlassCard className="flex-1 max-w-3xl h-[30vh] flex items-center justify-center gap-5">
              <div className="text-7xl text-white opacity-35">
                <IconTimer />
              </div>
              <div>
                <Label>ВРЕМЯ СЕАНСА</Label>
                <SessionTimer
                  time={sessionTime}
                  isRunning={isTimerRunning}
                  isPaused={isTimerPaused}
                />
                {/* <div className="text-sm text-white/40 mt-1">
                  {isTimerRunning && "⏳ Идет отсчет"}
                  {isTimerPaused && "⏸ На паузе"}
                  {!isTimerRunning && !isTimerPaused && sessionTime === 0 && "⏹ Ожидание"}
                  {!isTimerRunning && !isTimerPaused && sessionTime > 0 && "⏹ Остановлен"}
                </div> */}
              </div>
            </GlassCard>
          </div>
          <div className="flex gap-[15vw] justify-center items-center w-full">
            <GlassCard className="flex-1 max-w-lg h-[10vh] flex items-center justify-center gap-5">
              <div className="flex gap-2">
                <Label>O2 - </Label>
                {sensorData && <MidValue value={sensorData.Telemetry.Environment.ChamberOxygen} />}
                <Label>%</Label>
              </div>
            </GlassCard>
            <GlassCard className="flex-1 max-w-lg h-[10vh] flex items-center justify-center gap-5">
              <div className="flex gap-2">
                <Label>Rh - </Label>
                {sensorData && <MidValue value={sensorData.Telemetry.Environment.ChamberHumidity} />}
                <Label>%</Label>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
      <PWDDialog open={isMenuOpen} onOpenChange={() => { setIsMenuOpen(!isMenuOpen) }} />
    </div >
  );
}

// ─── Glass card ───────────────────────────────────────────────
function GlassCard({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`
      ${className}
      bg-[rgba(255,255,255,0.10)]
      backdrop-blur-xl backdrop-saturate-140
      border border-white/18
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
    <div className="text-5xl text-white/65 uppercase">
      {children}
    </div>
  );
}

function BigValue({ value, unit, trend }: { value: number; unit: string; trend?: string }) {
  return (
    <div className="flex items-end gap-2 leading-none">
      <span className="text-9xl font-bold text-white/95 tracking-[-0.02em] leading-none">
        {parseInt(value.toString())}
      </span>
      {unit && (
        <span className="text-[clamp(1.2rem,2vw,1.8rem)] text-white/65 mb-1">
          {unit}
        </span>
      )}
      {trend && trend !== "stable" && (
        <span className={`
          text-4xl mb-1.5
          ${trend === "up" ? "text-[rgba(255,120,100,0.8)]" : "text-[rgba(120,220,180,0.8)]"}
        `}>
          {trend === "up" ? "▲" : "▼"}
        </span>
      )}
    </div>
  );
}

function MidValue({ value, unit, trend }: { value: number; unit?: string; trend?: string }) {
  return (
    <div className="flex items-center gap-1.5 leading-none">
      <span className="text-5xl font-bold text-white/90 tracking-[-0.01em] leading-none">
        {value}
      </span>
      {unit && (
        <span className="text-[clamp(0.9rem,1.3vw,1.2rem)] text-white/40 mb-[3px]">
          {unit}
        </span>
      )}
      {trend && trend !== "stable" && (
        <span className={`
          text-lg mb-1
          ${trend === "up" ? "text-[rgba(255,120,100,0.7)]" : "text-[rgba(120,220,180,0.7)]"}
        `}>
          {trend === "up" ? "▲" : "▼"}
        </span>
      )}
    </div>
  );
}

// ─── Session Timer Component ─────────────────────────────────
function SessionTimer({ time, isRunning, isPaused }: { time: number; isRunning: boolean; isPaused: boolean }) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  let timerColor = "text-white/50";
  if (isRunning) timerColor = "text-white/95";
  if (isPaused) timerColor = "text-yellow-400/80";

  return (
    <div className={`text-8xl font-bold tracking-wider leading-none ${timerColor}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}

function StatusPulse({ status }: { status: SystemMode }) {
  const color = () => {
    switch (status) {
      case "working":
        return "rgba(120,220,180,0.7)"
      case "stdby":
        return "rgba(255, 255, 255,0.3)"
      case "drying":
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
          animation: status == "working" ? "pulseRing 2s ease-in-out infinite" : "none",
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
    <div className="text-white text-xl font-bold">
      {time.toLocaleTimeString("ru-RU")}
      <span className="ml-2">
        {time.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
      </span>
    </div>
  );
}

function IconThermo() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2a2 2 0 0 0-2 2v8.5A5 5 0 1 0 14 12.5V4a2 2 0 0 0-2-2Z" />
      <circle cx="12" cy="17" r="2" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function IconTimer() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 3h6" />
    </svg>
  );
}