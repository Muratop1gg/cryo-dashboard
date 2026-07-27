import { useState, useEffect, useRef } from "react";
import { WS } from "@/lib/api";


// WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";


export function useWebSocket(
  onEvent?: (event: WS.Event) => void
) {
  const [sensorData, setSensorData] = useState<WS.SensorsData | null>(null);
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
            // console.log(data.payload)

            if (data.event === "sensors_data") {
              // Обновляем данные сенсоров
              setSensorData(data.payload as WS.SensorsData);
              // console.log("[WS] Sensor data updated:", newSensorData);
            }
            else if (data.event === "event" && onEventRef.current) {
              onEventRef.current(data.payload as WS.Event);
              // console.log("[WS] Event received:", event);
            }
            else if (data.event === "connection_established") {
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