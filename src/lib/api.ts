// api.ts

// ========== БАЗОВЫЙ URL ==========
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    // Если ответ 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// ========== ТИПЫ (МОДЕЛИ) ==========

export type SystemMode = 'stdby' | 'autotest' | 'drying' | 'cooling' | 'working';

// --- Телеметрия ---
export interface SystemStatusModel {
    currentMode: SystemMode;
    errorCode: string[] | null;
    SteamOnline: boolean;
    HoistOnline: boolean;
}

export interface VFDModel {
    Frequency: number;
    ErrorCode: string;
}

export interface VFDStatusesModel {
    Steam: VFDModel;
    Hoist: VFDModel;
}

export interface TemperatureModel {
    SteamGenerator: number;
    HeaterZone: number;
    AirDuct: number;
    Average: number;
    ChamberZone: number;
}

export interface EnvironmentModel {
    AirDuctHumidity: number;
    ChamberHumidity: number;
    ChamberOxygen: number;
    NitrogenLevel: number;
}

export interface TelemetryModel {
    Temperature: TemperatureModel;
    Environment: EnvironmentModel;
    vfdStatus: VFDStatusesModel;
}

export interface SensorData {
    SystemStatus: SystemStatusModel;
    Telemetry: TelemetryModel;
}

// --- Концевики и безопасность ---
export interface Hoist {
    lsw_top_emergency: boolean;
    lsw_top_working: boolean;
    lsw_bottom_working: boolean;
    lsw_bottom_emergency: boolean;
}

export interface PatientHoist extends Hoist {
    patient_present: boolean;
}

export interface SafetyModel {
    estop_pressed: boolean;
    cabinet_door_open: boolean;
}

export interface DigitalInputs {
    pipe_hoist: Hoist;
    patient_hoist: PatientHoist;
    safety: SafetyModel;
}

export interface StatsModel {
    patient_hoist: number; // 0-стоп, 1-вверх, 2-вниз, 3-авария
    pipe_hoist: number;    // 0-стоп, 1-вверх, 2-вниз, 3-авария
    steam: number;         // 0-стоп, 1-вкл, 2-работа, 3-остановка, 4-авария
    charger: number;       // 0-стоп, 1-работа, 2-авария
    heater: number;        // 0-стоп, 1-работа, 2-авария
    exhaust: number;       // 0-стоп, 1-вкл, 2-работа, 3-остановка, 4-авария
}

// --- Системная информация ---
export interface SystemInfo {
    hostname: string;
    os: string;
    python_version: string;
    app_version: string;
    uptime_seconds: number;
    started_at: string;
    modbus_connected: boolean;
    zigbee_connected: boolean;
    o2_sensor_connected: boolean;
    SystemStatus: SystemStatusModel;
    Telemetry: TelemetryModel;
    digital_inputs: DigitalInputs;
    stats: StatsModel;
}

// --- Конфигурация ---
export interface ConfigResponse {
    network: Record<string, any>;
    hardware: Record<string, any>;
    defaults: Record<string, any>;
    modbus_plc: Record<string, any>;
    zigbee_modem: Record<string, any>;
}

// --- Статус актуаторов ---
export interface ActuatorStatus {
    // Определите поля на основе модели ActuatorStatus
    [key: string]: any;
}

// --- Лог ---
export interface LogResponse {
    content: string;
    lines_count: number;
    last_modified: string | null;
}

// --- Команды ---
export interface ModeSelection {
    mode: SystemMode;
}

export interface TechnologicalSettingsModel {
    time_s1_sec: number;
    time_s2_sec: number;
    time_s3_sec: number;
    temperature_sp1: number;
    temperature_sp2: number;
}

export interface UpdateSettings {
    mode_selection: ModeSelection;
    technological_settings: TechnologicalSettingsModel;
}

export interface MotionCommands {
    patient_hoist?: boolean | null; // true=вверх, false=вниз, null=стоп
    pipe_hoist?: boolean | null;    // true=вверх, false=вниз, null=стоп
}

export interface UiButtons {
    btn_ok: boolean;
    btn_esc: boolean;
    btn_reset_fault: boolean;
    btn_bypass_confirm: boolean;
}

export interface Security {
    system_code_long: string;
}

export interface AutocalibrationCommand {
    start: boolean;
}

// --- Команды процедуры ---
export interface StartProcedure {
    // Можно добавить параметры если нужны
    [key: string]: any;
}

export interface PauseProcedure {
    // Можно добавить параметры если нужны
    [key: string]: any;
}

export interface ResumeProcedure {
    // Можно добавить параметры если нужны
    [key: string]: any;
}

export interface StopProcedure {
    // Можно добавить параметры если нужны
    [key: string]: any;
}

// --- Исполнительные устройства ---
export interface BlowerCommand {
    enabled: boolean;
    frequency_hz: number;
}

export interface SteamGeneratorCommand {
    enabled: boolean;
    frequency_hz: number;
    direction: 'forward' | 'reverse';
}

export interface HoistCommand {
    state: 'stop' | 'up' | 'down';
}

export interface HeaterCommand {
    enabled: boolean;
    power_w: number;
}

export interface ExhaustFanCommand {
    enabled: boolean;
}

export interface ExhaustDamperCommand {
    state: 'open' | 'closed';
}

export interface LedStripCommand {
    enabled: boolean;
    color: string;
    type: 'argb' | 'rgb';
}

export interface ActuatorCommand {
    device: 'blower' | 'steam_generator' | 'patient_hoist' | 'pipe_hoist' |
    'heater' | 'exhaust_fan' | 'exhaust_damper' | 'led_strip';
    payload: BlowerCommand | SteamGeneratorCommand | HoistCommand |
    HeaterCommand | ExhaustFanCommand | ExhaustDamperCommand |
    LedStripCommand;
}

// --- Ответы ---
export interface CommandResponse {
    status: 'success' | 'error' | 'timeout';
    message: string;
    event_id?: number | null;
    data?: Record<string, any> | null;
}

// ========== API ФУНКЦИИ ==========

// --- GET запросы ---

/**
 * Получение системной конфигурации
 */
export async function getConfig(): Promise<ConfigResponse> {
    return apiRequest<ConfigResponse>('/api/config');
}

/**
 * Получение системной информации + телеметрии + концевиков + статистики
 */
export async function getSystemInfo(): Promise<SystemInfo> {
    return apiRequest<SystemInfo>('/api/system_info');
}

/**
 * Получение статусов исполнительных устройств
 */
export async function getActuatorsStatus(): Promise<ActuatorStatus> {
    return apiRequest<ActuatorStatus>('/api/actuators/status');
}

/**
 * Получение лога последней процедуры
 * @param lines количество строк (по умолчанию 100, от 1 до 1000)
 */
export async function getLog(lines: number = 100): Promise<LogResponse> {
    return apiRequest<LogResponse>(`/api/log?lines=${lines}`);
}

// --- POST запросы ---

/**
 * Обновление настроек процедуры
 */
export async function updateSettings(settings: UpdateSettings): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
    });
}

/**
 * Команды движения лебёдкам
 */
export async function motionCommand(cmd: MotionCommands): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/motion', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

/**
 * Команды кнопок UI
 */
export async function uiButtons(cmd: UiButtons): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/ui_buttons', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

/**
 * Разблокировка системы (без интернета)
 */
export async function securityUnlock(cmd: Security): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/security', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

/**
 * Запуск автокалибровки
 */
export async function autocalibration(cmd: AutocalibrationCommand): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/autocalibration', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

/**
 * Универсальная команда для исполнительных устройств
 */
export async function actuatorCommand(cmd: ActuatorCommand): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/actuators/command', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

// ========== КОМАНДЫ ПРОЦЕДУРЫ ==========

/**
 * Запуск процедуры
 * @param cmd параметры запуска процедуры (если нужны)
 */
export async function startProcedure(cmd: StartProcedure = {}): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/procedure/start', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

/**
 * Пауза процедуры
 * @param cmd параметры паузы (если нужны)
 */
export async function pauseProcedure(cmd: PauseProcedure = {}): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/procedure/pause', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

/**
 * Возобновление процедуры после паузы
 * @param cmd параметры возобновления (если нужны)
 */
export async function resumeProcedure(cmd: ResumeProcedure = {}): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/procedure/resume', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

/**
 * Остановка процедуры
 * @param cmd параметры остановки (если нужны)
 */
export async function stopProcedure(cmd: StopProcedure = {}): Promise<CommandResponse> {
    return apiRequest<CommandResponse>('/api/procedure/stop', {
        method: 'POST',
        body: JSON.stringify(cmd),
    });
}

// ========== УТИЛИТЫ ДЛЯ УДОБСТВА ==========

/**
 * Команды для лебёдки пациента
 */
export const PatientHoistCommands = {
    UP: { patient_hoist: true, pipe_hoist: null },
    DOWN: { patient_hoist: false, pipe_hoist: null },
    STOP: { patient_hoist: null, pipe_hoist: null },
} as const;

/**
 * Команды для лебёдки трубы
 */
export const PipeHoistCommands = {
    UP: { patient_hoist: null, pipe_hoist: true },
    DOWN: { patient_hoist: null, pipe_hoist: false },
    STOP: { patient_hoist: null, pipe_hoist: null },
} as const;

/**
 * Вспомогательная функция для создания команд актуаторов
 */
export function createActuatorCommand<T extends ActuatorCommand['payload']>(
    device: ActuatorCommand['device'],
    payload: T
): ActuatorCommand {
    return { device, payload };
}

// Пример использования:
// const blowerCmd = createActuatorCommand('blower', { enabled: true, frequency_hz: 30 });
// await actuatorCommand(blowerCmd);