import React from 'react'
import Dialog from './Dialog'
import SettingsMenu from './SettingsMenu'

interface SettingsMenuProps {
    open?: boolean
    onOpenChange(): void
}

function PWDDialog({ open = false, onOpenChange }: SettingsMenuProps) {
    const [input, setInput] = React.useState('')
    const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const accept = import.meta.env.VITE_SETTINGS_PASSWORD || "admin"

    const handleOpenChange = () => {
        // Если меню открыто, не даем закрыть диалог с паролем
        if (isMenuOpen) return;
        if (!open) {
            setInput('')
        }
        onOpenChange()
    }

    // Обработчик закрытия меню настроек
    const handleSettingsMenuClose = () => {
        setIsMenuOpen(false)
        // Закрываем и родительский диалог, чтобы все закрылось
        onOpenChange()
    }

    React.useEffect(() => {
        if (input === accept) {
            setIsMenuOpen(true)
            setInput('')
        }
    }, [input])

    // Фокус при открытии
    React.useEffect(() => {
        if (open && !isMenuOpen && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus()
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [open, isMenuOpen])

    return (
        <>
            <Dialog z={30} onOpenChange={handleOpenChange} className='p-6 h-[20vh] top-[30vh] left-[35vw] right-[35vw] text-white' open={open && !isMenuOpen} >
                <p className="text-white text-2xl">Авторизация</p>
                <div className="border border-white/18 my-3" />
                <div className='flex flex-col gap-4 mt-4'>
                    <p className=''>Введите пароль для доступа к настройкам:</p>
                    <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-full">
                        <input
                            ref={inputRef}
                            type="password"
                            className="focus-visible:outline-none bg-transparent w-full"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus={open && !isMenuOpen}
                        />
                    </div>
                </div>
            </Dialog>
            <SettingsMenu
                open={isMenuOpen}
                onOpenChange={handleSettingsMenuClose}
            />
        </>
    )
}

export default PWDDialog