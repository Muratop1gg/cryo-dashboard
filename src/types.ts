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

// Типы для возможных значений
export type SystemMode = 'stdby' | 'autotest' | 'drying' | 'cooling' | 'working';
type ErrorCode = null | string[]; // null - нет ошибок, string[] - список ошибок
type VfdErrorCode = null | string;

// Интерфейс для статуса VFD (общий)
interface VfdStatus {
  Frequency: number;
  ErrorCode: VfdErrorCode;
}

// Интерфейс для температур
interface Temperatures {
  SteamGenerator: number;
  HeaterZone: number;
  AirDuct: number;
  Average: number;
  ChamberZone: number;
}

// Интерфейс для окружающей среды
interface Environment {
  AirDuctHumidity: number;
  ChamberHumidity: number;
  ChamberOxygen: number;
  NitrogenLevel: number; // остаток азота
}

// Интерфейс для статуса VFD
interface VfdStatuses {
  Steam: VfdStatus;
  Hoist: VfdStatus; // обратите внимание на ключ с дефисом
}

// Интерфейс для телеметрии
interface Telemetry {
  Temperature: Temperatures;
  Environment: Environment;
  vfdStatus: VfdStatuses;
}

// Интерфейс для системного статуса
interface SystemStatus {
  currentMode: SystemMode;
  errorCode: ErrorCode;
  SteamOnline: boolean; // парогенератор для сервисного режима
  HoistOnline: boolean; // лебёдка
}

// Главный интерфейс
export interface SystemData {
  SystemStatus: SystemStatus;
  Telemetry: Telemetry;
}

export interface Event {
  EventType: number
}