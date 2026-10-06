// ToastManager.tsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ActiveToast, ToastEvent } from "../types";
import { EventToast } from "./EventToast";
import { getHoistState, getToastKey, isHoistStop } from "../lib/events";

interface ToastManagerProps {
    events: ToastEvent[];
}

type Kind = "patient" | "tube";

export function ToastManager({ events }: ToastManagerProps) {
    const [toasts, setToasts] = useState<Map<Kind, ActiveToast>>(new Map());
    const processed = useRef<Set<string>>(new Set());

    useEffect(() => {
        events.forEach(({ uid, event }) => {
            if (processed.current.has(uid)) return;
            processed.current.add(uid);

            const hoist = getHoistState(event.event_id);
            if (!hoist) return;

            const kind: Kind = hoist.kind;

            // ── STOP: помечаем текущий тост как уходящий ──
            if (isHoistStop(event.event_id)) {
                setToasts((prev) => {
                    const existing = prev.get(kind);
                    if (!existing || existing.leaving) return prev;
                    const next = new Map(prev);
                    next.set(kind, { ...existing, leaving: true });
                    return next;
                });
                return;
            }

            // ── UP / DOWN / ALARM: создаём/заменяем тост ──
            const key = getToastKey(event.event_id);
            if (!key) return;

            const toast: ActiveToast = {
                id: `${kind}_${key}_${uid}`,
                key,
                event,
                startTime: Date.now(),
            };

            setToasts((prev) => {
                const next = new Map(prev);
                next.set(kind, toast);
                return next;
            });
        });
    }, [events]);

    const handleUnmount = (kind: Kind, id: string) => {
        setToasts((prev) => {
            const cur = prev.get(kind);
            if (!cur || cur.id !== id) return prev;
            const next = new Map(prev);
            next.delete(kind);
            return next;
        });
    };

    const topToasts: ActiveToast[] = [];
    const bottomToasts: ActiveToast[] = [];
    toasts.forEach((t) => {
        if (t.key.startsWith("patient")) topToasts.push(t);
        else bottomToasts.push(t);
    });

    return (
        <>
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-row gap-4 items-start justify-center pointer-events-none">
                <AnimatePresence>
                    {topToasts.map((t) => (
                        <motion.div
                            key={t.id}
                            layout
                            transition={{ layout: { duration: 0.5, ease: "easeOut" } }}
                        >
                            <EventToast
                                toastKey={t.key}
                                leaving={t.leaving}
                                onUnmount={() => handleUnmount("patient", t.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-row gap-4 items-end justify-center pointer-events-none">
                <AnimatePresence>
                    {bottomToasts.map((t) => (
                        <motion.div
                            key={t.id}
                            layout
                            transition={{ layout: { duration: 0.5, ease: "easeOut" } }}
                        >
                            <EventToast
                                toastKey={t.key}
                                leaving={t.leaving}
                                onUnmount={() => handleUnmount("tube", t.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}