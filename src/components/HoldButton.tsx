import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface HoldButtonProps {
    onPress(): void
    onRelease(): void
    children?: React.ReactNode
    disabled?: boolean
    className?: string
}

/**
 * Кнопка "нажал - держу - отпустил". Повторяет поведение физической кнопки:
 * onPress при нажатии, onRelease при отпускании, уходе пальца/курсора с кнопки
 * или размонтировании, пока кнопка зажата.
 */
function HoldButton({ onPress, onRelease, children, disabled, className }: HoldButtonProps) {
    const [pressed, setPressed] = useState(false)
    const pressedRef = useRef(false)
    const onReleaseRef = useRef(onRelease)
    onReleaseRef.current = onRelease

    const press = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (disabled || pressedRef.current) return
        e.currentTarget.setPointerCapture(e.pointerId)
        pressedRef.current = true
        setPressed(true)
        onPress()
    }

    const release = () => {
        if (!pressedRef.current) return
        pressedRef.current = false
        setPressed(false)
        onReleaseRef.current()
    }

    // Если кнопку убрали с экрана (закрыли меню) в зажатом состоянии - отпускаем
    useEffect(() => () => {
        if (pressedRef.current) onReleaseRef.current()
    }, [])

    useEffect(() => {
        if (disabled) release()
    }, [disabled])

    return (
        <button
            type="button"
            disabled={disabled}
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onContextMenu={(e) => e.preventDefault()}
            className={cn(
                pressed ? "bg-white/70 text-black scale-94" : "text-white hover:bg-white/30 bg-white/20",
                "border border-white/18 touch-none select-none",
                className,
                "px-4 gap-2 disabled:opacity-50 disabled:cursor-default cursor-pointer transition-all flex items-center justify-center h-8 rounded-lg"
            )}
        >
            {children}
        </button>
    )
}

export default HoldButton
