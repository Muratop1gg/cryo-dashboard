import { useEffect, useRef } from "react";
import { CapsuleEvent } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8765";

export function useWebSocket(onEvent: (event: CapsuleEvent) => void) {
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
          console.log("[WS] Connected to", WS_URL);
        };

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data) as CapsuleEvent;
            if (
              data.type &&
              [
                "patient_lift_up",
                "patient_lift_down",
                "patient_lift_stop",      // Новое событие остановки patient lift
                "tube_lift_up",
                "tube_lift_down",
                "tube_lift_stop",         // Новое событие остановки tube lift
              ].includes(data.type)
            ) {
              onEventRef.current(data);
            }
          } catch (e) {
            console.warn("[WS] Failed to parse message:", msg.data);
          }
        };

        ws.onclose = () => {
          console.log("[WS] Disconnected. Reconnecting in 3s...");
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.warn("[WS] Error:", err);
          ws.close();
        };
      } catch (e) {
        console.warn("[WS] Could not connect, retrying in 3s");
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);
}