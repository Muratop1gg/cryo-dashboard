import React from 'react'
import QRCode from "react-qr-code";
import Dialog from './Dialog';
import Button from './button';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import CodeInput from './CodeInput';
import { motion } from 'framer-motion';

interface DialogProps {
    open?: boolean
    onOpenChange?: () => void
}

function UnlockDialog({ open = false, onOpenChange }: DialogProps) {
    const handleOpen = () => {
        onOpenChange && onOpenChange()
        setPage(0)
        setSuccess(false)
        setCodeInput("")
        setIsCodeValid(false)
        setError(null)
        setLoading(false)
    }

    const api = useApi()

    const [page, setPage] = React.useState<number>(0)
    const [loading, setLoading] = React.useState<boolean>(true)
    const [success, setSuccess] = React.useState<boolean>(false)
    const [codeInput, setCodeInput] = React.useState<string>("")
    const [isCodeValid, setIsCodeValid] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [isErrorFromServer, setIsErrorFromServer] = React.useState<boolean>(false)

    const code = "1234-7890-ABCD-EFGH"

    const handleValidityChange = (isValid: boolean) => {
        setIsCodeValid(isValid)
        // Если код стал невалидным или изменился, сбрасываем ошибку
        if (isErrorFromServer && !isValid) {
            setError(null)
            setIsErrorFromServer(false)
        }
    }

    // Обработка изменения кода пользователем
    const handleCodeChange = (value: string) => {
        setCodeInput(value)
        // Если пользователь начал редактировать код, сбрасываем ошибку сервера
        if (isErrorFromServer) {
            setError(null)
            setIsErrorFromServer(false)
        }
    }

    const checkUnlockStatus = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await api.securityUnlock({ system_code_long: code })

            // Проверяем статус ответа
            if (result?.status === 'error') {
                setError(result?.message || 'Ошибка при проверке статуса разблокировки')
                setIsErrorFromServer(true)
                setSuccess(false)
            } else if (result?.status === 'success') {
                setSuccess(true)
                setPage(2)
                setError(null)
            } else {
                // Если непонятный ответ
                setError('Неизвестная ошибка при проверке статуса')
                setIsErrorFromServer(true)
            }
            return result
        } catch (error) {
            // Ошибка соединения или другая проблема
            console.error("Error checking unlock status:", error)
            setError('Не удалось соединиться с сервером. Проверьте подключение.')
            setIsErrorFromServer(false)
        } finally {
            setLoading(false)
        }
    }

    const handleUnlockAttempt = async () => {
        setLoading(true)
        setError(null)
        setIsErrorFromServer(false)

        try {
            const cleanCode = codeInput.replace(/-/g, '')
            const result = await api.securityUnlock({ system_code_long: cleanCode })

            // Проверяем статус ответа
            if (result?.status === 'error') {
                setError(result?.message || 'Неверный код разблокировки')
                setIsErrorFromServer(true)
                setSuccess(false)
                // Не переключаем страницу, остаемся на странице ввода кода
            } else if (result?.status === 'success') {
                setSuccess(true)
                setPage(2)
                setError(null)
                setIsErrorFromServer(false)
            } else {
                setError('Неизвестная ошибка при разблокировке')
                setIsErrorFromServer(true)
            }
        } catch (error) {
            console.error("Error during unlock:", error)
            setError('Не удалось соединиться с сервером. Проверьте подключение.')
            setIsErrorFromServer(false)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        if (open) {
            checkUnlockStatus()
        }
    }, [open])

    // Страница успеха
    if (page === 2) {
        return (
            <Dialog z={30} onOpenChange={handleOpen} className='p-6 h-[40vh] top-[25vh] left-[30vw] right-[30vw] text-white overflow-hidden' open={open}>
                <p className="text-white text-2xl">Разблокировка установки</p>
                <div className="border border-white/18 my-3" />

                <div className="flex flex-col items-center justify-center h-[50%] gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20" />
                        <CheckCircle className="size-20 text-green-500 relative" />
                    </div>
                    <p className="text-2xl font-semibold">Успешная разблокировка!</p>
                    <p className="text-white/60 text-center max-w-md">
                        Установка успешно разблокирована. Теперь вы можете использовать все функции.
                    </p>
                </div>

                <div className="gap-4 mt-4 flex justify-end">
                    <Button onClick={handleOpen} variant="primary">
                        Готово
                    </Button>
                </div>
            </Dialog>
        )
    }

    return (
        <Dialog z={30} onOpenChange={handleOpen} className={`p-6 ${page == 0 && "h-[43vh]"} top-[25vh] left-[30vw] right-[30vw] text-white`} open={open}>
            <p className="text-white text-2xl">Разблокировка установки</p>
            <div className="border border-white/18 my-3" />

            {page == 0 ? (
                <motion.div
                    key="page0"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className='flex items-center justify-center mt-4 h-50'
                >
                    {loading ? (
                        <div className="flex flex-col items-center animate-pulse gap-2">
                            <p className="text-2xl">Связываемся с сервером</p>
                            <Loader className="animate-spin size-10" />
                        </div>
                    ) : success ? (
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="size-16 text-green-500" />
                            <p className="text-xl">Установка уже разблокирована</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 items-center justify-center">
                            <div className="flex flex-col h-full gap-2 justify-between">
                                <p className="text-lg">Для разблокировки установки отсканируйте QR-код:</p>
                                <p className="p-2 border rounded-lg border-white/18 bg-white/10">Код: {code}</p>
                            </div>
                            <div className="flex items-center justify-end h-full">
                                <QRCode
                                    size={256}
                                    className="bg-white/10 border border-white/18 p-2 rounded-lg min-w-50 h-50 w-50"
                                    value={"https://cryoone.ru/unlock/" + code}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    key="page1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex flex-col gap-2"
                >
                    <p className="">Введите код разблокировки:</p>
                    <CodeInput
                        onValidityChange={handleValidityChange}
                        value={codeInput}
                        onChange={handleCodeChange}
                        className="text-2xl"
                    />

                    {/* Отображение ошибки */}
                    {error && (
                        <div className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-red-800/30 border border-red-600/50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <AlertCircle className="size-5 text-red-500 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-red-500 text-sm font-medium">Ошибка!</span>
                                <span className="text-red-500/80 text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Подсказка по формату */}
                    {!error && codeInput.length > 0 && codeInput.length < 19 && (
                        <p className="text-xs text-white/40 mt-1">
                            Формат: xxxx-xxxx-xxxx-xxxx (буквы и цифры)
                        </p>
                    )}
                </motion.div>
            )}

            <div className="gap-4 mt-4 flex justify-end">
                {page == 0 ? (
                    <Button variant="destructive" onClick={handleOpen}>
                        Отменить
                    </Button>
                ) : (
                    <Button variant="destructive" onClick={() => {
                        setPage(page - 1)
                        setError(null)
                        setIsErrorFromServer(false)
                    }}>
                        Назад
                    </Button>
                )}

                {!loading && page == 0 && !success && (
                    <Button onClick={() => setPage(1)} variant="primary">
                        Далее
                    </Button>
                )}

                {page == 1 && (
                    <Button
                        onClick={handleUnlockAttempt}
                        disabled={!isCodeValid || loading || isErrorFromServer}
                        variant="primary"
                    >
                        {loading ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Разблокировка...
                            </>
                        ) : (
                            'Разблокировать'
                        )}
                    </Button>
                )}
            </div>
        </Dialog>
    )
}

export default UnlockDialog