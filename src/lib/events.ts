// src/lib/events.ts
// Формат event_id: abc
//   a — группа
//   b — подгруппа
//   c — параметр

export const EventGroup = {
    Idle: 1,             // Простой
    Procedure: 2,        // Процедура
    Cooldown: 3,         // Прохолаживание
    Drying: 4,           // Сушка
    NitrogenLoading: 5,  // Загрузка азота
    Service: 6,          // Сервисный режим
} as const;
export type EventGroupValue = (typeof EventGroup)[keyof typeof EventGroup];

export const EventSubgroup = {
    Common: 0,          // не выбрана (общий)
    PatientHoist: 1,    // Лебедка пациента
    PipeHoist: 2,       // Трубоподъемник
    SteamGenerator: 3,  // Парогенератор
    Blower: 4,          // Нагнетатель
    Heater: 5,          // Нагреватель
    Exhaust: 6,         // Вытяжка
} as const;
export type EventSubgroupValue = (typeof EventSubgroup)[keyof typeof EventSubgroup];

// ── Параметры по подгруппам ────────────────────────────────────
export const CommonParam = { Stop: 0, Sleep: 1, Alarm: 2 } as const;
export const HoistParam = { Stop: 0, Up: 1, Down: 2, Alarm: 3 } as const;
export const SteamGeneratorParam = { Stop: 0, Start: 1, Run: 2, Stopping: 3, Alarm: 4 } as const;
export const BlowerParam = { Stop: 0, Run: 1, Alarm: 2 } as const;
export const HeaterParam = { Stop: 0, Run: 1, Alarm: 2 } as const;
export const ExhaustParam = { Stop: 0, Start: 1, Run: 2, Stopping: 3, Alarm: 4 } as const;

export interface ParsedEventId {
    group: EventGroupValue | number;
    subgroup: EventSubgroupValue | number;
    param: number;
}

/** Собрать event_id из трёх цифр: a*100 + b*10 + c */
export function makeEventId(group: number, subgroup: number, param: number): number {
    return group * 100 + subgroup * 10 + param;
}

/** Разобрать event_id обратно в { group, subgroup, param } */
export function parseEventId(id: number): ParsedEventId {
    const safe = Math.max(0, Math.floor(id));
    return {
        group: Math.floor(safe / 100),
        subgroup: Math.floor((safe % 100) / 10),
        param: safe % 10,
    };
}

/** Ключ для (группа, подгруппа) — удобно использовать в Record<> */
export function subgroupKey(group: number, subgroup: number): string {
    return `${group}-${subgroup}`;
}

/** Человекочитаемое имя события — удобно для логов */
export function formatEventId(id: number): string {
    const { group, subgroup, param } = parseEventId(id);
    const g =
        Object.entries(EventGroup).find(([, v]) => v === group)?.[0] ?? `group${group}`;
    const s =
        Object.entries(EventSubgroup).find(([, v]) => v === subgroup)?.[0] ??
        `sub${subgroup}`;
    return `${g}.${s}[${param}]`;
}