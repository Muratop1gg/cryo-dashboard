import { DragEvent, useState } from "react"

interface SliderProps {
    range?: number
    onValueChange(number: number): any
}


function Slider({ range = 100, onValueChange }: SliderProps) {
    const [value, setValue] = useState(0)

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        // setValue
    }

    return (
        <div onDrag={handleDrag} className='rounded-full px-[2px] flex items-center w-full h-7 border border-[rgba(255,255,255,0.18)] bg-white/20'>
            <div className='relative h-5 rounded-full flex items-center justify-center bg-white/70' style={{
                width: `calc(7% + 93% * 0.01 * ${value} / (${range} / 100)`,
            }}>
                <div className="absolute cursor-pointer h-5 px-1 min-w-5 w-fit rounded-full bg-black/80 flex items-center justify-center right-0">
                    <p className="text-sm text-white">{value}</p>
                </div>
            </div>
        </div>
    )
}

export default Slider