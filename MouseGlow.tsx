import { useState, useEffect } from 'react';

interface MouseGlowProps {
    primaryColor?: string;
    secondaryColor?: string;
    size?: number;
}

export function MouseGlow({
    primaryColor = 'rgba(139, 92, 246, 0.15)',
    secondaryColor = 'rgba(59, 130, 246, 0.2)',
    size = 600
}: MouseGlowProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <>
            {/* Large ambient glow */}
            <div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
                style={{
                    opacity: isVisible ? 1 : 0,
                    background: `radial-gradient(${size}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${primaryColor}, transparent 40%)`
                }}
            />

            {/* Secondary smaller glow */}
            <div
                className="pointer-events-none fixed z-30 transition-all duration-100 ease-out"
                style={{
                    width: size * 0.64,
                    height: size * 0.64,
                    left: mousePosition.x - (size * 0.32),
                    top: mousePosition.y - (size * 0.32),
                    opacity: isVisible ? 0.6 : 0,
                    background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
                    filter: 'blur(40px)'
                }}
            />
        </>
    );
}

// Animated gradient background component
export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
            <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        </div>
    );
}
