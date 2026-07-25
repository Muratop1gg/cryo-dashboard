import { useState } from 'react'
import Dialog from './Dialog'
import { ColorPicker, ColorPickerFormat, ColorPickerHue, ColorPickerSelection } from './ui/color-picker'
import Color from 'color'

interface DialogProps {
    open?: boolean
    onOpenChange(): void
    onColorSave(color: string): void
    defaultColor?: string

}

const PRESET_COLORS = [
    '#FF0000', // Красный
    '#FF6B00', // Оранжевый
    '#FFD700', // Желтый
    '#00FF00', // Зеленый
    '#00BFFF', // Голубой
    '#0000FF', // Синий
    '#8B00FF', // Фиолетовый
    '#FF00FF', // Розовый
    '#FF1493', // Розовый-неон
    '#00FA9A', // Мятный
    '#FF4500', // Оранжево-красный
    '#7B68EE', // Лавандовый
]

function LEDDialog({ open = false, onOpenChange, defaultColor = "#ffffff", onColorSave }: DialogProps) {

    const handleOpen = () => {
        setColor(defaultColor)
        onOpenChange()
    }

    const [color, setColor] = useState<string>(defaultColor)


    const handleColorChange = (value: any) => {
        const color = Color(value)
        const hex = color.hex()
        setColor(hex)
    }

    const handlePresetColorClick = (presetColor: string) => {
        setColor(presetColor)
    }



    return (
        <Dialog z={30} onOpenChange={handleOpen} className='p-6 h-[40vh] top-[25vh] left-[30vw] right-[30vw] text-white' open={open} >
            <p className="text-white text-2xl">Настройка цвета</p>
            <div className="border border-white/18 my-3" />
            <div className='flex flex-col gap-4 mt-4'>
                <div className="flex justify-center gap-4">
                    <ColorPicker onChange={handleColorChange} value={color} defaultValue={defaultColor} className="h-auto w-80 flex" >
                        <div className='flex gap-4'>
                            <ColorPickerSelection className="h-43 rounded-lg" />
                            <ColorPickerHue orientation='vertical' />
                        </div>
                    </ColorPicker>
                    <div className='flex-1 flex flex-col max-w-40 justify-between'>
                        <div>
                            <p className="text-sm text-white/60 mb-2">Быстрый выбор цвета:</p>
                            <div className="grid grid-cols-3 gap-1 w-full h-full">
                                {PRESET_COLORS.map((presetColor, index) => (
                                    <button
                                        key={index}
                                        className={`
                                h-7 w-full rounded-lg border-2 cursor-pointer transition-all duration-200
                                ${color === presetColor
                                                ? 'border-white ring-2 ring-white/30 scale-105'
                                                : 'border-white/18 hover:border-white/50 hover:scale-105'
                                            }
                            `}
                                        style={{ backgroundColor: presetColor }}
                                        onClick={() => handlePresetColorClick(presetColor)}
                                        title={presetColor}
                                    >
                                        {color === presetColor && (
                                            <svg
                                                className="h-5 w-full text-white drop-shadow-md mx-auto"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="gap-4 mt-2 flex justify-between">
                    <div
                        className={
                            "flex w-46 h-8 justify-center gap-2 items-center rounded-lg bg-white/20 border border-white/18"
                        }
                    >
                        <p>Новый цвет:</p>
                        <div className="w-12 h-5 rounded-md" style={{ backgroundColor: color }}></div>
                    </div>
                    <div onClick={handleOpen} className=
                        "active:scale-[0.94] text-red-500 hover:bg-red-800/50 bg-red-800/30 border border-red-600/50 cursor-pointer  transition-all flex items-center justify-center w-24 h-8 rounded-lg">
                        Отменить
                    </div>
                    <div onClick={() => onColorSave(color)} className="active:scale-[0.94] text-blue-500 hover:bg-blue-800/50 bg-blue-800/30 border border-blue-600/50 cursor-pointer transition-all flex items-center justify-center w-60 h-8 rounded-lg">Сохранить изменения
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default LEDDialog