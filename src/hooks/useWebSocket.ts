import { useState, useEffect, useRef, useCallback } from "react";
import { WS } from "@/lib/api";

// WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

export function useWebSocket(
  onEvent?: (event: WS.Event) => void,
  onProcedureState?: (state: WS.ProcedureState) => void
) {
  const [sensorData, setSensorData] = useState<WS.SensorsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<WS.ConnectionStatus>({
    modbus: "offline",
    zigbee: "offline",
  });

  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  const onProcedureStateRef = useRef(onProcedureState);


  onEventRef.current = onEvent;
  onProcedureStateRef.current = onProcedureState;

  // Вспомогательная функция для отправки сообщений
  const sendMessage = useCallback((event: string, payload?: any) => {
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
  }, []);

  // Функции для отправки команд
  const sendControllerButtonPressed = useCallback((button: WS.ControllerButton) => {
    return sendMessage("controller_button_pressed", { button } as WS.ControllerButtonPressed);
  }, [sendMessage]);

  const sendControllerButtonReleased = useCallback((button?: WS.ControllerButton) => {
    return sendMessage("controller_button_released", { button } as WS.ControllerButtonReleased);
  }, [sendMessage]);

  const sendHoistCommandPressed = useCallback((button: WS.HoistButton) => {
    return sendMessage("hoist_button_pressed", { button });
  }, [sendMessage]);

  const sendHoistCommandReleased = useCallback((button?: WS.HoistButton) => {
    return sendMessage("hoist_button_released", { button });
  }, [sendMessage]);

  const sendMachineControl = useCallback((type: WS.MachineControlType, value: boolean) => {
    return sendMessage("machine_controls", { type, value } as WS.MachineControl);
  }, [sendMessage]);

  const sendSteamSpeedControl = useCallback((value: number) => {
    // Валидация значения
    const clampedValue = Math.max(0, Math.min(50, value));
    return sendMessage("steam_speed_control", { value: clampedValue } as WS.SteamSpeedControl);
  }, [sendMessage]);

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
            else if (data.event === "procedure_state" && onProcedureStateRef.current) {
              onProcedureStateRef.current(data.payload as WS.ProcedureState);
            }
            else if (data.event === "error") {
              console.warn("[WS] Command rejected:", data.payload?.message);
            }
            else if (data.event === "connection_status") {
              const p = data.payload as WS.ConnectionStatusPayload;

              if (p.name === "snapshot" && typeof p.status === "object") {
                // снапшот: { modbus: "online", zigbee: "offline" }
                setConnectionStatus((prev) => ({ ...prev, ...(p.status as object) }));
              } else if (p.name === "modbus" || p.name === "zigbee") {
                setConnectionStatus((prev) => ({
                  ...prev,
                  [p.name]: p.status as WS.ConnectionState,
                }));
              }
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
    sendHoistCommandReleased,
    connectionStatus,
    sendSteamSpeedControl,
    // Общая функция для отправки произвольных сообщений
    sendMessage
  };
}