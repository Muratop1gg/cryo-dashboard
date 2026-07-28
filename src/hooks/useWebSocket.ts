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

  // Вспомогательная функция для отправки сообщений
  const sendMessage = (event: string, payload?: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("[WS] Cannot send message: WebSocket is not open");
      return false;
    }

    try {
      const message = JSON.stringify({ event, payload });
      wsRef.current.send(message);
      return true;
    } catch (e) {
      console.error("[WS] Failed to send message:", e);
      return false;
    }
  };

  // Функции для отправки команд
  const sendControllerButtonPressed = (button: "OK" | "ESC" | "RESET" | "CONFIRM") => {
    return sendMessage("controller_button_pressed", { button });
  };

  const sendControllerButtonReleased = () => {
    return sendMessage("controller_button_released");
  };

  const sendHoistCommandPressed = (button: "pipe_hoist_up" | "pipe_hoist_down" | "patient_hoist_up" | "patient_hoist_down") => {
    return sendMessage("hoist_button_pressed", { button });
  };


  const sendMachineControl = (type: string, value: boolean) => {
    return sendMessage("machine_controls", { type, value });
  };

  const sendSteamSpeedControl = (value: number) => {
    // Валидация значения
    const clampedValue = Math.max(0, Math.min(50, value));
    return sendMessage("steam_speed_control", { value: clampedValue });
  };

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

  return {
    sensorData,
    isConnected,
    // Отправка команд
    sendControllerButtonPressed,
    sendControllerButtonReleased,
    sendMachineControl,
    sendHoistCommandPressed,
    sendSteamSpeedControl,
    // Общая функция для отправки произвольных сообщений
    sendMessage
  };
}