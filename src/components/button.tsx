import { cn } from '@/lib/utils'
import React from 'react'


interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'destructive'
    onClick?: () => void
    children?: React.ReactNode
    disabled?: boolean
    className?: string

}

function Button({ variant = 'secondary', onClick, children, disabled, className, ...props }: ButtonProps) {

    const getButtonStyles = () => {
        switch (variant) {
            case 'primary':
                return "text-blue-500 hover:bg-blue-800/50 bg-blue-800/30 border border-blue-600/50"
            case 'secondary':
                return "text-white hover:bg-white/30 bg-white/20 border border-white/18"
            case 'destructive':
                return "text-red-500 hover:bg-red-800/50 bg-red-800/30 border border-red-600/50"
            default:
                return "text-white hover:bg-white/30 bg-white/20 border border-white/18"
        }
    }

    return (
        <button {...props} onClick={onClick} disabled={disabled} className={cn(getButtonStyles(),
            className,
            "px-4 gap-2 active:scale-94 disabled:active:scale-100 disabled:opacity-50 disabled:cursor-default cursor-pointer transition-all flex items-center justify-center h-8 rounded-lg")}>
            {children}
        </button>
    )
}

export default Button