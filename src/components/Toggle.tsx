import { useState, useEffect } from "react";

interface ToggleProps {
    onChange(num: number): any
    value?: number | boolean // Поддержка числа или boolean
    textDisplayed?: boolean
    texts?: string[]
    width?: number
    height?: number
    translateWidth?: number
}

function Toggle({
    onChange,
    value = 0,
    width = 52,
    height = 28,
    translateWidth = 22,
    textDisplayed = false,
    texts = ["выкл", "вкл"]
}: ToggleProps) {
    // Преобразуем value в индекс
    const getInitialState = (val: number | boolean): number => {
        if (typeof val === 'boolean') {
            return val ? 1 : 0
        }
        return val
    }

    const [state, setState] = useState(getInitialState(value))
    const statesLength = texts.length

    // Обновляем состояние при изменении value пропса
    useEffect(() => {
        const newState = getInitialState(value)
        if (newState >= 0 && newState < statesLength) {
            setState(newState)
        }
    }, [value, statesLength])

    const handleToggle = () => {
        const newState = (state + 1) % statesLength
        setState(newState)
        onChange(newState)
    }

    const getCircleclasses = () => {
        if (state !== 0) {
            return `bg-black/80`
        } else {
            return "bg-white/70"
        }
    }

    return (
        <div onClick={handleToggle}
            style={{ minWidth: width, minHeight: height, height: height, width: width }}
            className={`${state !== 0 ? "bg-white/70" : "bg-white/20"} cursor-pointer transition-all flex px-0.5 items-center border border-white/18 rounded-full`}>
            <div
                style={{
                    translate: (state * translateWidth).toString() + "px"
                }}
                className={`${getCircleclasses()} ${textDisplayed ? "w-fit px-1" : "w-5"} h-5 transition-all ease-in-out flex items-center justify-center rounded-full`} >
                <p className={`${state !== 0 ? "text-white" : "text-black/80"} text-sm`}>{textDisplayed && (texts[state])}</p>
            </div>
        </div>
    )
}

export default Toggle