"use client";

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCallback } from 'react';
import type { CSSProperties } from 'react';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

interface TiltProps {
    children: React.ReactNode;
    className?: string;
    max?: number; // max tilt in degrees
    scale?: number; // scale on hover
    style?: CSSProperties; // optional extra styles (e.g., aspect-ratio)
}

export function Tilt({ children, className = '', max = 12, scale = 1.03, style }: TiltProps) {
    const prefersReduced = usePrefersReducedMotion();

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const s = useMotionValue(1);

    // If user prefers reduced motion, use much gentler springs (or no motion at all)
    const springConfig = prefersReduced ? { stiffness: 80, damping: 40, mass: 0.6 } : { stiffness: 220, damping: 18, mass: 0.6 };

    const rX = useSpring(rotateX, springConfig);
    const rY = useSpring(rotateY, springConfig);
    const sc = useSpring(s, springConfig);

    const handleMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (prefersReduced) return; // disable motion when user prefers reduced motion
            const el = e.currentTarget as HTMLDivElement;
            const rect = el.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            const px = relX / rect.width; // 0..1
            const py = relY / rect.height; // 0..1
            const rYd = (px - 0.5) * (max * -2); // invert to tilt toward cursor
            const rXd = (py - 0.5) * (max * 2);
            rotateX.set(rXd);
            rotateY.set(rYd);
            // expose cursor position as CSS variables for shine/gradient effects
            el.style.setProperty('--mx', `${relX}px`);
            el.style.setProperty('--my', `${relY}px`);
        },
        [max, rotateX, rotateY, prefersReduced]
    );

    const handleEnter = useCallback(() => {
        if (prefersReduced) return;
        s.set(scale);
    }, [s, scale, prefersReduced]);

    const handleLeave = useCallback(() => {
        rotateX.set(0);
        rotateY.set(0);
        s.set(1);
    }, [rotateX, rotateY, s]);

    const handleDown = useCallback(() => {
        if (prefersReduced) return;
        s.set(scale * 0.985);
    }, [s, scale, prefersReduced]);

    const handleUp = useCallback(() => {
        if (prefersReduced) return;
        s.set(scale);
    }, [s, scale, prefersReduced]);

    return (
        <div className="[perspective:1000px] [transform-style:preserve-3d]">
            <motion.div
                onMouseMove={handleMove}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onMouseDown={handleDown}
                onMouseUp={handleUp}
                style={{ ...(style || {}), rotateX: rX, rotateY: rY, scale: sc }}
                className={`${className} will-change-transform transform-gpu`}
            >
                {children}
            </motion.div>
        </div>
    );
}

export default Tilt;
