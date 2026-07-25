import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface CodeInputProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    onComplete?: (value: string) => void
    onValidityChange?: (isValid: boolean) => void
    onCharChange?: (value: string, isComplete: boolean) => void // Новый пропс
}

// Экспортируем функцию проверки маски
export const validateCodeFormat = (code: string): boolean => {
    // Проверяем формат xxxx-xxxx-xxxx-xxxx
    const regex = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/
    return regex.test(code)
}

// Экспортируем функцию для очистки кода от дефисов
export const cleanCode = (code: string): string => {
    return code.replace(/-/g, '')
}

export const formatCode = (code: string): string => {
    const clean = code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)
    let formatted = ''
    for (let i = 0; i < clean.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += '-'
        }
        formatted += clean[i]
    }
    return formatted
}

function CodeInput({ value = '', onChange, placeholder = 'xxxx-xxxx-xxxx-xxxx', className = '', onComplete, onValidityChange, onCharChange }: CodeInputProps) {
    const [inputValue, setInputValue] = useState(value)
    const [isValid, setIsValid] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (value !== inputValue) {
            setInputValue(value)
            // Проверяем валидность при изменении value извне
            const valid = validateCodeFormat(value)
            setIsValid(valid)
            onValidityChange?.(valid)
        }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value

        // Удаляем все недопустимые символы
        raw = raw.replace(/[^a-zA-Z0-9]/g, '')
        raw = raw.slice(0, 16)

        // Форматируем
        let formatted = ''
        for (let i = 0; i < raw.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += '-'
            }
            formatted += raw[i]
        }

        setInputValue(formatted)
        onChange?.(formatted)

        // Проверяем валидность
        const valid = validateCodeFormat(formatted)
        setIsValid(valid)
        onValidityChange?.(valid)

        // Вызываем onCharChange при каждом изменении
        const isComplete = raw.length === 16
        onCharChange?.(formatted, isComplete)

        // Если введено 16 символов и код валиден, вызываем onComplete
        if (raw.length === 16 && valid && onComplete) {
            onComplete(formatted)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Обработка Backspace для удаления дефиса
        if (e.key === 'Backspace' && inputValue.length > 0) {
            const lastChar = inputValue[inputValue.length - 1]
            if (lastChar === '-') {
                e.preventDefault()
                const newValue = inputValue.slice(0, -1)
                setInputValue(newValue)
                onChange?.(newValue)
                const valid = validateCodeFormat(newValue)
                setIsValid(valid)
                onValidityChange?.(valid)
            }
        }
    }

    return (
        <div className="flex p-1 h-12 bg-white/20 border border-white/18 rounded-lg w-full">
            <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`font-mono ring-0 border-0 tracking-wider ${className}`}
                maxLength={19}
                autoCapitalize="characters"
                spellCheck={false}
            />
        </div>
    )
}

export default CodeInput