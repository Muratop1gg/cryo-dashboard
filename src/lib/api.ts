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

export interface BasicResponse {
    status_code: string
    message?: string
}

export namespace GET {
    export interface SystemConfiguration {
        object: any
        // whatever is happening here 
    }

    export interface SettingsData {
        led_color: string
        led_active: boolean
        blocked: "yes" | "no" | "unlocking"
        time_s1_sec: number // работа 
        time_s2_sec: number // ожидание
        time_s3_sec: number // общая длительность процедуры
        temperature_sp1: number // уставка s1
        temperature_sp2: number // уставка s2
        wifi?: {
            ssid: string
            password: string
        }
    }
}

export namespace POST {
    export interface ChangeProcedureState {
        action: "stop" | "pause" | "resume" | "start"
    }

    export interface StartSelfTest {
        type: "dry" | "default"
    }

    export interface SettingsData {
        led_color?: string
        led_active?: boolean
        time_s1_sec?: number // работа 
        time_s2_sec?: number // ожидание
        time_s3_sec?: number // общая длительность процедуры
        temperature_sp1?: number // уставка s1
        temperature_sp2?: number // уставка s2
        wifi?: {
            ssid: string
            password: string
        }
    }

    export interface SystemConfiguration {
        // whatever is happening here 
    }

    export interface CheckUnlockCode {
        code: string // this is generated code for unblock, we have time info in it as well
    }

    export interface CheckUnlockCodeResponse {
        accepted: boolean
        days_left: number
    }
}

export namespace WS {
    export interface SensorsData {
        digital_inputs: {
            pipe_hoist: {
                lsw_top_emergency: boolean
                lsw_top_working: boolean
                lsw_bottom_working: boolean
                lsw_bottom_emergency: boolean
            }
            patient_hoist: {
                lsw_top_emergency: boolean
                lsw_top_working: boolean
                lsw_bottom_working: boolean
                lsw_bottom_emergency: boolean
                patient_present: boolean
            }
            safety: {
                estop_pressed: boolean
                cabinet_door_open: boolean
            }
        }
        stats: {
            patient_hoist: 0 | 1 | 2 | 3   // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
            pipe_hoist: 0 | 1 | 2 | 3    // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
            steam: 0 | 1 | 2 | 3          // 0 - стоп 1 - включение 2 - работа 3 - остановка 4 - авария
            charger: 0 | 1 | 2 | 3         // 0 - стоп 1 - работа 2 - авария
            heater: 0 | 1 | 2 | 3,          // 0 - стоп 1 - работа 2 - авария
            exhaust: 0 | 1 | 2 | 3         // 0 - стоп 1 - включение 2 - работа 3 - остановка 4 - авария
        }
        sensor_data: {
            t1: number
            t2: number
            t3: number
            t4: number
            humidity: number
            oxygen: number
            nitrogen_mass?: number
        }
        diagnostics: {
            test: {
                running: boolean
                type?: "self_test" | "dry_self_test"
                stage?: string
            }
        }

    }

    export interface Event {
        event_id: number // for digits code
    }

    export interface ControllerButtonPressed {
        button: "OK" | "ESC" | "RESET" | "CONFIRM"
    }

    export interface MachineControl {
        type: string
        value: boolean
    }

    export interface SteamSpeedControl {
        value: number // between 0 and 50
    }
}

// ========== API ФУНКЦИИ ==========

// --- GET запросы ---

/**
 * Получение системной конфигурации
 */
export async function getConfig(): Promise<GET.SystemConfiguration> {
    return apiRequest<GET.SystemConfiguration>('/api/config');
}

/**
 * Получение системных параметров
 */
export async function getSettings(): Promise<GET.SettingsData> {
    return apiRequest<GET.SettingsData>(`/api/settings`);
}

// --- POST запросы ---

// --- Управление процедурой ---

/**
 * Запуск процедуры
 */
export async function StartProcedure(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/change-procedure-state`, {
        method: 'POST',
        body: JSON.stringify({
            action: "start"
        } as POST.ChangeProcedureState)
    });
}

/**
 * Пауза процедуры
 */
export async function PauseProcedure(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/change-procedure-state`, {
        method: 'POST',
        body: JSON.stringify({
            action: "pause"
        } as POST.ChangeProcedureState)
    });
}

/**
 * Остановка процедуры
 */
export async function StopProcedure(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/change-procedure-state`, {
        method: 'POST',
        body: JSON.stringify({
            action: "stop"
        } as POST.ChangeProcedureState)
    });
}

/**
 * Возобновление процедуры
 */
export async function ResumeProcedure(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/change-procedure-state`, {
        method: 'POST',
        body: JSON.stringify({
            action: "resume"
        } as POST.ChangeProcedureState)
    });
}

// --- Управление тестами ---

/**
 * Запуск обычного теста
 */
export async function StartSelfTest(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/self-test`, {
        method: 'POST',
        body: JSON.stringify({
            type: "default"
        } as POST.StartSelfTest)
    });
}

/**
 * Запуск сухого теста
 */
export async function StartSelfTestDry(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/self-test`, {
        method: 'POST',
        body: JSON.stringify({
            type: "dry"
        } as POST.StartSelfTest)
    });
}

/**
 * Остановка теста
 */
export async function StopSelfTest(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/self-test/stop`, {
        method: 'POST'
    });
}

// --- Управление настройками ---

/**
 * Сохранение настроек
 * @param updatedSettings - объект с измененными настройками
 */
export async function UpdateSettings(updatedSettings: POST.SettingsData): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/update-settings`, {
        method: 'POST',
        body: JSON.stringify(updatedSettings as POST.SettingsData)
    });
}

/**
 * Обновление системной конфигурации
 * @param updatedConfig - объект с измененной конфигурацией
 */
export async function UpdateConfiguration(updatedConfig: POST.SystemConfiguration): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/config`, {
        method: 'POST',
        body: JSON.stringify(updatedConfig as POST.SystemConfiguration)
    });
}

/**
 * Запрос на автоматическую разблокировку
 */
export async function RequestUnlock(): Promise<BasicResponse> {
    return apiRequest<BasicResponse>(`/api/unlock`, {
        method: 'POST'
    });
}

/**
 * Запрос на разблокировку по 
 * @param code - код разблокировки, в нем зашифровано время
 */

export async function CheckUnlockCode(code: string): Promise<POST.CheckUnlockCodeResponse> {
    return apiRequest<POST.CheckUnlockCodeResponse>(`/api/unlock/check`, {
        method: 'POST',
        body: JSON.stringify({ code } as POST.CheckUnlockCode)
    });
}