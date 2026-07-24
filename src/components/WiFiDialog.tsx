import Dialog from './Dialog'

interface WiFiDialogProps {
    open?: boolean
    onOpenChange(): void

}

function WiFiDialog({ open = false, onOpenChange }: WiFiDialogProps) {

    const handleOpen = () => {
        onOpenChange()
    }

    return (
        <Dialog z={30} onOpenChange={handleOpen} className='p-6 h-[30vh] top-[30vh] left-[35vw] right-[35vw] text-white' open={open} >
            <p className="text-white text-2xl">Настройка WiFi</p>
            <div className="border border-white/18 my-3" />
            <div className='flex flex-col gap-4 mt-4'>
                <div className='flex gap-2'>
                    <p className='w-30'>Название сети:</p>
                    <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-70">
                        <input type="text" className="focus-visible:outline-none bg-transparent w-full" />
                    </div>

                </div>
                <div className='flex gap-2'>
                    <p className='w-30'>Пароль:</p>
                    <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-70">
                        <input type="password" className="focus-visible:outline-none bg-transparent w-full" />
                    </div>
                </div>

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

export default WiFiDialog