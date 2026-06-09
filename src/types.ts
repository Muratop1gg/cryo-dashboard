// types.ts
export type EventType =
  | "patient_lift_up"
  | "patient_lift_down"
  | "patient_lift_stop"
  | "tube_lift_up"
  | "tube_lift_down"
  | "tube_lift_stop";

export interface CapsuleEvent {
  id?: string;
  type: EventType;
  message?: string;
  timestamp?: number;
  sequence?: number;
}

export interface ActiveLift {
  type: string;
  event: CapsuleEvent;
  startTime: number;
  id: string;
  leaving?: boolean;
}

export interface SensorData {
  temperature: string;
  systemStatus: "Простой" | "Сушка" | "Процедура" | "Авария";
  sessionTime: string;
  s1: string;
  s2: string;
}