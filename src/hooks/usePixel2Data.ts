import { useState, useEffect, useRef } from "react";
import { SensorData } from "../types";

// Pixel2 polling URL - override via env
const PIXEL2_URL = import.meta.env.VITE_PIXEL2_URL || "http://localhost:8080/api/sensors";
const POLL_INTERVAL = parseInt(import.meta.env.VITE_POLL_INTERVAL || "2000");

// Demo data with realistic cryo values
const MOCK_BASE: SensorData = {
  temperature: "-196",
  temperatureTrend: "stable",
  nitrogenPressure: "101.3",
  fillLevel: "78",
  patientId: "CRY-2024-004",
  systemStatus: "КРИОСОН",
  humidity: "12",
  coolantFlow: "4.7",
  power: "2840",
  powerTrend: "stable",
  sessionTime: "120",
  t1: "37",
  t2: "38"
};

function jitter(val: number, range: number): string {
  return (val + (Math.random() - 0.5) * range).toFixed(1);
}

export function usePixel2Data() {
  const [sensorData, setSensorData] = useState<SensorData>(MOCK_BASE);
  const baseRef = useRef(MOCK_BASE);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(PIXEL2_URL, { signal: AbortSignal.timeout(1500) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        // Map your Pixel2 response to SensorData here
        setSensorData({
          temperature: json.temperature ?? MOCK_BASE.temperature,
          temperatureTrend: json.temperatureTrend ?? "stable",
          nitrogenPressure: json.nitrogenPressure ?? MOCK_BASE.nitrogenPressure,
          fillLevel: json.fillLevel ?? MOCK_BASE.fillLevel,
          patientId: json.patientId ?? MOCK_BASE.patientId,
          systemStatus: json.systemStatus ?? MOCK_BASE.systemStatus,
          humidity: json.humidity ?? MOCK_BASE.humidity,
          coolantFlow: json.coolantFlow ?? MOCK_BASE.coolantFlow,
          power: json.power ?? MOCK_BASE.power,
          powerTrend: json.powerTrend ?? "stable",
          sessionTime: json.sessionTime ?? MOCK_BASE.sessionTime,
          t1: json.t1 ?? MOCK_BASE.t1,
          t2: json.t2 ?? MOCK_BASE.t2
        });
      } catch {
        // Pixel2 not reachable — use mock with slight jitter for demo
        setSensorData({
          ...baseRef.current,
          temperature: `-${(196 + (Math.random() - 0.5) * 0.4).toFixed(1)}`,
          nitrogenPressure: jitter(101.3, 0.8),
          humidity: jitter(12, 1),
          coolantFlow: jitter(4.7, 0.3),
          power: Math.floor(2840 + (Math.random() - 0.5) * 80).toString(),
        });
      }
    }

    fetchData();
    const timer = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return { sensorData };
}
