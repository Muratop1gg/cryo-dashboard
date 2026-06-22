import { useState, useEffect, useRef } from "react";
import { SensorData, CapsuleEvent } from "../types";

// Demo data with realistic cryo values
const MOCK_BASE: SensorData = {
  temperature: "-196",
  systemStatus: "Процедура",
  sessionTime: "120",
  s1: "37",
  s2: "38"
};

// WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";


export function useWebSocket(
  onEvent?: (event: CapsuleEvent) => void
) {
  const [sensorData, setSensorData] = useState<SensorData>(MOCK_BASE);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);

  onEventRef.current = onEvent;

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          // console.log("[WS] Connected to", WS_URL);
          setIsConnected(true);
        };

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data.type === "sensor_data") {
              // Обновляем данные сенсоров
              const newSensorData: SensorData = {
                temperature: data.data.temperature,
                systemStatus: data.data.systemStatus,
                sessionTime: data.data.sessionTime,
                s1: data.data.s1,
                s2: data.data.s2
              };
              setSensorData(newSensorData);
              // console.log("[WS] Sensor data updated:", newSensorData);
            }
            else if (data.type === "event" && onEventRef.current) {
              // Обрабатываем событие
              const event: CapsuleEvent = {
                type: data.data.type,
                timestamp: data.data.timestamp,
                id: data.data.id,
                sequence: data.data.sequence
              };
              onEventRef.current(event);
              // console.log("[WS] Event received:", event);
            }
            else if (data.type === "connection_established") {
              // console.log("[WS] Connection established:", data.message);
            }
          } catch (e) {
            // console.warn("[WS] Failed to parse message:", msg.data, e);
          }
        };

        ws.onclose = () => {
          // console.log("[WS] Disconnected. Reconnecting in 3s...");
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.warn("[WS] Error:", err);
          ws.close();
        };
      } catch (e) {
        // console.warn("[WS] Could not connect, retrying in 3s");
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  return { sensorData, isConnected };
}