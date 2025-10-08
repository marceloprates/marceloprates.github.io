"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import styles from './FilmGrain.module.css';

/**
 * FilmGrain renders a subtle animated procedural noise / dust overlay
 * reminiscent of old celluloid. It avoids heavy per-pixel work by
 * regenerating a small noise tile (canvas) every few frames and using it
 * as a repeated background image. Occasional larger specks / scratches
 * are added for authenticity. Frame rate & opacity are tuned to be subtle.
 */
export function FilmGrain({
    fps = 12,
    tileSize = 1000,
    className = "",
    intensity = 1,
    debug = false,
    pointDensity = 2000, // New prop for point density
    lineDensity = 1, // New prop for line density
}: {
    fps?: number;
    tileSize?: number;
    className?: string;
    intensity?: number;
    debug?: boolean;
    pointDensity?: number; // New prop for point density
    lineDensity?: number; // New prop for line density
}) {
    const { theme } = useTheme();
    const prefersReduced = usePrefersReducedMotion();
    const [dataUrl, setDataUrl] = useState<string>("");
    const frameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const layerRef = useRef<HTMLDivElement | null>(null);
    // Treat fps <= 0 as a fully static frame (no animation frames scheduled)
    const staticMode = fps <= 0;
    const interval = staticMode ? Infinity : 1000 / fps;

    // Generate a single noise tile as data URL.
    const generateTile = () => {
        const c = document.createElement("canvas");
        c.width = tileSize;
        c.height = tileSize;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        // Rely solely on next-themes state to avoid race conditions where the HTML class switches after we sample.
        const isDark = theme === "dark";

        // Base grain: iterate pixels via ImageData for speed.
        const imgData = ctx.createImageData(tileSize, tileSize);
        const data = imgData.data;

        // Revert to original procedural noise generation
        // Theme-driven intensity override: 20 (light) vs 1 (dark), ignoring provided prop for consistent look.
        const effectiveIntensity = isDark ? 1 : 5;
        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random();
            let shade;
            if (isDark) {
                shade = 200 + v * 55; // 200..255 for white in dark mode
            } else {
                shade = 50 + v * 150; // 50..200 for dark in light mode
            }
            data[i] = shade;
            data[i + 1] = shade;
            data[i + 2] = shade;
            const baseA = isDark ? (30 + v * 50) : (42 + v * 70);
            data[i + 3] = .75 * baseA * effectiveIntensity;
        }
        ctx.putImageData(imgData, 0, 0);

        // Occasional larger specks (dust) & faint scratches.
        if (Math.random() < pointDensity) { // Use pointDensity for specks
            const specks = 10 + Math.floor(Math.random() * 18);
            for (let s = 0; s < specks; s++) {
                const x = Math.random() * tileSize;
                const y = Math.random() * tileSize;
                const rX = 1 + Math.random() * 2.0; // Increased size variation
                const rY = 1 + Math.random() * 2.0; // Allow elongated shapes
                const rotation = Math.random() * Math.PI * 2; // Random rotation for elongated shapes
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.beginPath();
                ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
                const alpha = (isDark ? 0.15 + Math.random() * 0.25 : 0.08 + Math.random() * 0.15) * effectiveIntensity; // Increased opacity variation for better visibility in dark mode
                ctx.fillStyle = isDark ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
                ctx.fill();
                ctx.restore();
            }
        }

        // Rare vertical or diagonal scratch (low probability each frame)
        if (Math.random() < lineDensity) { // Use lineDensity for scratches
            const scratchCount = 4
            for (let k = 0; k < scratchCount; k++) {
                const x = Math.random() * tileSize;
                const y = Math.random() * tileSize;
                const len = tileSize * (0.3 + Math.random() * 0.5);
                const alpha = (isDark ? 0.2 : 0.2) * effectiveIntensity;
                const colors = isDark ? [
                    `rgba(255,255,255,${alpha})`,     // White
                    `rgba(200,200,255,${alpha})`,     // Light Blue
                    `rgba(255,200,255,${alpha})`,     // Light Pink
                    `rgba(200,255,200,${alpha})`      // Light Green
                ] : [
                    `rgba(0,200,200,${alpha})`,       // Darker Cyan
                    `rgba(255,0,255,${alpha})`,       // Magenta
                    `rgba(150,150,0,${alpha})`,       // Darker Yellow
                    `rgba(0,0,0,${alpha})`            // Black
                ];
                ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)]; // Randomly select a color
                ctx.lineWidth = 0.7;

                // Generate polynomial parametric curve
                const coefficientsX = Array.from({ length: 4 }, () => 2 * (Math.random() - 0.5));
                const coefficientsY = Array.from({ length: 4 }, () => 2 * (Math.random() - 0.5));

                ctx.beginPath();
                for (let t = -.5; t <= .5; t += 0.05) {
                    const tPow = [1, t, t ** 2, t ** 3];
                    const curveX = x + tPow.reduce((sum, coeff, i) => sum + coeff * coefficientsX[i], 0) * len;
                    const curveY = y + tPow.reduce((sum, coeff, i) => sum + coeff * coefficientsY[i], 0) * len;
                    if (t === 0) {
                        ctx.moveTo(curveX, curveY);
                    } else {
                        ctx.lineTo(curveX, curveY);
                    }
                }
                ctx.stroke();
            }
        }

        const url = c.toDataURL("image/png");
        setDataUrl(url);
        if (debug) {
            console.log("FilmGrain frame", { theme, urlLength: url.length });
        }
    };

    useEffect(() => {
        // In any static situation (reduced motion preference OR fps <= 0) generate once and bail.
        if (prefersReduced || staticMode) {
            generateTile();
            return () => {
                if (frameRef.current) cancelAnimationFrame(frameRef.current);
            };
        }

        let mounted = true;
        const loop = (time: number) => {
            if (!mounted) return;
            if (time - lastTimeRef.current >= interval) {
                lastTimeRef.current = time;
                generateTile();
            }
            frameRef.current = requestAnimationFrame(loop);
        };
        generateTile(); // immediate first frame so user sees grain instantly
        frameRef.current = requestAnimationFrame(loop);
        return () => {
            mounted = false;
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
        // Re-run when theme changes for correct contrast.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, interval, tileSize, intensity, staticMode]);

    // Apply runtime styles to the layer element to avoid inline JSX styles
    useEffect(() => {
        const el = layerRef.current;
        if (!el) return;
        el.style.backgroundRepeat = 'repeat';
        el.style.backgroundSize = `${tileSize}px ${tileSize}px`;
        el.style.zIndex = (1000).toString();
        el.style.willChange = 'transform';
        // Disable flicker animation entirely when static (fps <= 0) or reduced motion.
        el.style.animation = (prefersReduced || staticMode) ? 'none' : 'film-flicker 4s ease-in-out infinite';
        el.style.opacity = theme === 'dark' ? '0.3' : '0.15';
        el.style.mixBlendMode = theme === 'dark' ? 'screen' : 'multiply';
        if (dataUrl) el.style.backgroundImage = `url(${dataUrl})`;
    }, [dataUrl, tileSize, theme, prefersReduced, staticMode]);

    return (
        <div
            ref={layerRef}
            aria-hidden
            className={`${styles['film-grain']} ${className} ${theme === 'dark' ? styles.dark : styles.light} ${prefersReduced ? '' : ''}`}
        />
    );
}

export default FilmGrain;
