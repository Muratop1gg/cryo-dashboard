import { useState } from 'react'
import Button from './button'
import Dialog from './Dialog'

interface WiFiDialogProps {
    open?: boolean
    onOpenChange?: () => void
    onWiFiSave?: (wifiData: { ssid: string; password: string }) => void
    data?: {
        ssid: string
        password_len: number
    }
}

function WiFiDialog({ open = false, onOpenChange, onWiFiSave, data }: WiFiDialogProps) {

    const [wifiData, setWiFiData] = useState({ ssid: data?.ssid || '', password: '' })

    const handleOpen = () => {
        onOpenChange && onOpenChange()
    }

    const handleWiFiSave = () => {
        onWiFiSave && onWiFiSave(wifiData)
        handleOpen()
    }

    return (
        <Dialog z={30} onOpenChange={handleOpen} className='p-6 h-[30vh] top-[30vh] left-[35vw] right-[35vw] text-white' open={open} >
            <p className="text-white text-2xl">Настройка WiFi</p>
            <div className="border border-white/18 my-3" />
            <div className='flex flex-col gap-4 mt-4'>
                <div className='flex gap-2'>
                    <p className='w-30'>Название сети:</p>
                    <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-70">
                        <input
                            type="text"
                            defaultValue={data?.ssid}
                            className="focus-visible:outline-none bg-transparent w-full"
                            value={wifiData.ssid}
                            onChange={(e) => setWiFiData({ ...wifiData, ssid: e.target.value })}
                        />
                    </div>

                </div>
                <div className='flex gap-2'>
                    <p className='w-30'>Пароль:</p>
                    <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-70">
                        <input
                            type="password"
                            defaultValue={data?.password_len ? '*'.repeat(data.password_len) : ''}
                            className="focus-visible:outline-none bg-transparent w-full"
                            value={wifiData.password}
                            onChange={(e) => setWiFiData({ ...wifiData, password: e.target.value })}
                        />
                    </div>
                </div>

            </div>
            <div className="gap-4 mt-8 flex justify-end">
                <Button variant="destructive" onClick={handleOpen} >
                    Отменить
                </Button>
                <Button variant="primary" onClick={handleWiFiSave} >
                    Сохранить изменения
                </Button>
            </div>
        </Dialog>

    )
}

export default WiFiDialog