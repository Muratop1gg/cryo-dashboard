import { useState } from "react";

interface ToggleProps {
    onChange(num: number): any
    textDisplayed?: boolean
    texts?: string[]
    width?: number
    height?: number
    translateWidth?: number
}

function Toggle({ onChange, width = 52, height = 28, translateWidth = 22, textDisplayed = false, texts = ["выкл", "вкл"] }: ToggleProps) {
    const [state, setState] = useState(0)
    const statesLength = texts.length

    const handleToggle = () => {
        if (state + 1 == statesLength) {
            setState(0)
        } else setState(state + 1)
        onChange(state);
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
            style={{ minWidth: width, minHeight: height, width: width }}
            className={`${state !== 0 ? "bg-white/70" : "bg-white/20"} cursor-pointer transition-all flex px-[2px] items-center border border-[rgba(255,255,255,0.18)] rounded-full`}>
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