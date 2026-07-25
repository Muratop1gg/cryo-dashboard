import { CSSProperties, ReactNode, useState, useEffect } from "react";

interface DialogProps {
    onOpenChange(): any
    open?: boolean
    children?: ReactNode
    className?: string
    style?: CSSProperties
    z?: number
}

function Dialog({ onOpenChange, open = false, children, className, style, z = 20 }: DialogProps) {
    const [animation, setAnimation] = useState<'in' | 'out' | null>(null);
    const [shouldRender, setShouldRender] = useState(open);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            setAnimation('in');
        } else {
            setAnimation('out');
            const timer = setTimeout(() => {
                setShouldRender(false);
                setAnimation(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const handleOpenChange = () => {
        onOpenChange();
    };

    if (!shouldRender) return null;

    const dialogAnimation = {
        in: 'animate-[dialogIn_0.2s_ease-in_forwards]',
        out: 'animate-[dialogOut_0.2s_ease-in_forwards]'
    };

    const overlayAnimation = {
        in: 'animate-[overlayIn_0.3s_ease_forwards]',
        out: 'animate-[overlayOut_0.3s_ease_forwards]'
    };

    return (
        <div className={`absolute cursor-default top-0 left-0 right-0 bottom-0`} style={{ zIndex: z }}>
            <div
                className={`absolute inset-0 bg-black/40 ${animation ? overlayAnimation[animation] : ''}`}
                onClick={handleOpenChange}
            />

            <div
                className={`
                    ${className} 
                    border border-white/18
                    rounded-[20px]
                    bg-black/25 
                    absolute
                    backdrop-blur-xl backdrop-saturate-140
                    shadow-[0_2px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.22)]
                    ${animation ? dialogAnimation[animation] : ''}
                    left-1/2 top-1/2
                    min-w-75 min-h-50
                `}
                style={style}
            >
                <div className="relative w-full h-full flex flex-col">
                    <div
                        onClick={handleOpenChange}
                        className="absolute active:scale-[0.94] top-0 duration-300
                            right-0 h-10 w-10 flex items-center justify-center rounded-xl
                            transition-all bg-white/20 hover:bg-white/30 cursor-pointer text-white
                            border border-white/18"
                    >
                        X
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Dialog;