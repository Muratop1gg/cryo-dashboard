// src/hooks/useEventDispatcher.ts
import { useCallback, useRef } from "react";
import { WS } from "@/lib/api";
import {
    parseEventId,
    subgroupKey,
    type ParsedEventId,
    type EventGroupValue,
} from "@/lib/events";

export type EventHandler = (event: WS.Event, parsed: ParsedEventId) => void;

export interface EventHandlers {
    /** Вызывается на любое событие (последним) */
    onAny?: EventHandler;

    /** Вызывается на конкретную группу (a) */
    onGroup?: Partial<Record<EventGroupValue, EventHandler>>;

    /**
     * Вызывается на конкретную пару (группа, подгруппа).
     * Ключ получать через `subgroupKey(a, b)`.
     */
    onSubgroup?: Record<string, EventHandler>;

    /** Вызывается на конкретный event_id */
    onId?: Record<number, EventHandler>;
}

/**
 * Диспетчер событий WS.Event по схеме event_id = abc.
 * Порядок вызовов: onId → onSubgroup → onGroup → onAny.
 * Каждому колбэку приходит и сам event, и распарсенный {group, subgroup, param}.
 */
export function useEventDispatcher(handlers: EventHandlers) {
    const ref = useRef(handlers);
    ref.current = handlers; // всегда актуальные колбэки без пересоздания функции

    return useCallback((event: WS.Event) => {
        const parsed = parseEventId(event.event_id);

        ref.current.onId?.[event.event_id]?.(event, parsed);
        ref.current.onSubgroup?.[subgroupKey(parsed.group, parsed.subgroup)]?.(
            event,
            parsed,
        );
        ref.current.onGroup?.[parsed.group as EventGroupValue]?.(event, parsed);
        ref.current.onAny?.(event, parsed);
    }, []);
}