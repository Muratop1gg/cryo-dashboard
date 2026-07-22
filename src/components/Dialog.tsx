import { CSSProperties, ReactNode } from "react";

interface DialogProps {
    onOpenChange(): any
    open?: boolean
    children?: ReactNode
    className?: string
    style?: CSSProperties
}

function Dialog({ onOpenChange, open = false, children, className, style }: DialogProps) {

    if (!open) return;




    const handleOpenChange = () => {
        open = !open;
        onOpenChange()
    }

    return (
        <div
            className={`
      ${className}
      bg-[rgba(255,255,255,0.10)]
      backdrop-blur-[12px] backdrop-saturate-[140%]
      border border-[rgba(255,255,255,0.18)]
      rounded-[20px]
      py-4 px-4 z-20 
      absolute h-[90vh] top-[5vh] left-[5vh] right-[5vh] cursor-default
      shadow-[0_2px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.22)]
    `}
            style={style}
        >
            <div className="relative w-full h-full flex flex-col">
                <div onClick={handleOpenChange} className="absolute top-0 duration-300
                right-0 h-10 w-10 flex items-center justify-center rounded-xl
                transition-all bg-white/20 hover:bg-black/10 cursor-pointer text-white
                border border-[rgba(255,255,255,0.18)]">
                    X
                </div>
                {children}
            </div>

        </div>
    )
}

export default Dialog