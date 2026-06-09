// ToastManager.tsx
import { useEffect, useState, useRef } from "react";
import { CapsuleEvent, ActiveLift } from "../types";
import { EventToast } from "./EventToast";
import { AnimatePresence, motion } from "framer-motion";

interface ToastManagerProps {
    events: CapsuleEvent[];
}

export function ToastManager({ events }: ToastManagerProps) {
    const [activeLifts, setActiveLifts] = useState<Map<string, ActiveLift>>(new Map());
    const processedEvents = useRef<Set<string>>(new Set());

    useEffect(() => {
        events.forEach((event) => {
            // Используем уникальный ID события чтобы не обрабатывать одно событие дважды
            const eventId = event.id || `${event.type}_${event.timestamp}_${event.sequence}`;
            if (processedEvents.current.has(eventId)) {
                return;
            }
            processedEvents.current.add(eventId);

            const type = event.type;

            // Обработка stop событий
            if (type.includes("stop")) {
                const liftTypeBase = type.replace("_stop", "");

                setActiveLifts((prev) => {
                    const newMap = new Map(prev);

                    const upKey = `${liftTypeBase}_up`;
                    const downKey = `${liftTypeBase}_down`;

                    if (newMap.has(upKey)) {
                        const lift = newMap.get(upKey)!;
                        newMap.set(upKey, {
                            ...lift,
                            leaving: true,
                        });
                    }

                    if (newMap.has(downKey)) {
                        const lift = newMap.get(downKey)!;
                        newMap.set(downKey, {
                            ...lift,
                            leaving: true,
                        });
                    }

                    return newMap;
                });

                return;
            }

            // Обработка событий движения
            // console.log("MOTION event received:", type);

            setActiveLifts((prev) => {
                const newMap = new Map(prev);

                // Сохраняем с полным ключом (например, patient_lift_up)
                newMap.set(type, {
                    type: type,
                    event: event,
                    startTime: Date.now(),
                    id: event.id || `${type}_${Date.now()}`,
                });

                // console.log("Active lifts after update:", Array.from(newMap.keys()));
                return newMap;
            });
        });
    }, [events]);

    const handleUnmount = (liftType: string) => {
        // console.log("Unmounting toast for:", liftType);
        setActiveLifts((prev) => {
            const newMap = new Map(prev);
            newMap.delete(liftType);
            return newMap;
        });
    };

    // Разделяем тосты по типу и позиции
    const patientTopToasts: ActiveLift[] = [];
    const patientBottomToasts: ActiveLift[] = [];
    const tubeTopToasts: ActiveLift[] = [];
    const tubeBottomToasts: ActiveLift[] = [];

    activeLifts.forEach((lift) => {
        const isPatient = lift.type.includes("patient");
        const isUp = lift.type.includes("up");

        if (isPatient) {
            if (isUp) {
                patientTopToasts.push(lift);
            } else {
                patientBottomToasts.push(lift);
            }
        } else {
            if (isUp) {
                tubeTopToasts.push(lift);
            } else {
                tubeBottomToasts.push(lift);
            }
        }
    });

    return (
        <>
            {/* Верхние тосты - располагаем горизонтально */}
            <div
                className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-row gap-4 items-start justify-center pointer-events-none"
            >
                <AnimatePresence>
                    {[...patientTopToasts, ...tubeTopToasts].map((lift) => (
                        <motion.div
                            key={lift.id}
                            layout
                            transition={{
                                layout: {
                                    duration: 0.5,
                                    ease: "easeOut",
                                },
                            }}
                        >
                            <EventToast
                                event={lift.event}
                                leaving={lift.leaving}
                                onUnmount={() => handleUnmount(lift.type)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Нижние тосты - располагаем горизонтально */}
            <div
                className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-row gap-4 items-end justify-center pointer-events-none"
            >
                <AnimatePresence>
                    {[...patientBottomToasts, ...tubeBottomToasts].map((lift) => (
                        <motion.div
                            key={lift.id}
                            layout
                            transition={{
                                layout: {
                                    duration: 0.5,
                                    ease: "easeOut",
                                },
                            }}
                        >
                            <EventToast
                                event={lift.event}
                                leaving={lift.leaving}
                                onUnmount={() => handleUnmount(lift.type)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}