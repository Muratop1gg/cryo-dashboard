import { useState } from 'react'
import Dialog from './Dialog'
import { ColorPicker, ColorPickerFormat, ColorPickerHue, ColorPickerSelection } from './ui/color-picker'
import Color from 'color'

interface DialogProps {
    open?: boolean
    onOpenChange(): void
    defaultColor?: string

}

function LEDDialog({ open = false, onOpenChange, defaultColor = "#ffffff" }: DialogProps) {

    const handleOpen = () => {
        onOpenChange()
    }

    const [color, setColor] = useState<string>(defaultColor)

    const handleColorChange = (value: any) => {
        const color = Color(value)
        const hex = color.hex()
        setColor(hex)
    }



    return (
        <Dialog z={30} onOpenChange={handleOpen} className='p-6 h-[50vh] top-[15vh] left-[30vw] right-[30vw] text-white' open={open} >
            <p className="text-white text-2xl">Настройка цвета</p>
            <div className="border border-white/18 my-3" />
            <div className='flex flex-col gap-4 mt-4'>
                <ColorPicker onChange={handleColorChange} defaultValue={defaultColor} className="h-auto w-80 flex" >
                    <div className='flex gap-4'>
                        <ColorPickerSelection className="h-40 rounded-lg" />
                        <ColorPickerHue orientation='vertical' />
                    </div>

                    <div className='w-100 flex flex-col gap-2'>
                        <p>Выбранный цвет:</p>
                        <ColorPickerFormat />
                    </div>
                </ColorPicker>

            </div>
            <div className="gap-4 mt-8 flex justify-end">
                <div onClick={handleOpen} className=
                    "active:scale-[0.94] text-red-500 hover:bg-red-800/50 bg-red-800/30 border border-red-600/50 cursor-pointer  transition-all flex items-center justify-center w-24 h-8 rounded-lg">
                    Отменить
                </div>
                <div className="active:scale-[0.94] text-blue-500 hover:bg-blue-800/50 bg-blue-800/30 border border-blue-600/50 cursor-pointer transition-all flex items-center justify-center w-60 h-8 rounded-lg">Сохранить изменения
                </div>
            </div>
        </Dialog>
    )
}

export default LEDDialog